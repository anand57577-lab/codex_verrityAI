from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.organization import Organization, Brand
from app.schemas.organization import OrganizationUpdate, OrganizationResponse

router = APIRouter(prefix="/api/organizations", tags=["Organizations"])

def build_response(db: Session, organization: Organization):
    brand = (
        db.query(Brand)
        .filter(Brand.organization_id == organization.id)
        .order_by(Brand.id)
        .first()
    )
    return OrganizationResponse(
        id=organization.id,
        brand_id=brand.id if brand else 0,
        legal_name=organization.legal_name,
        primary_brand_name=brand.name if brand else "",
        industry=organization.industry,
        country_market=organization.country_market,
        description=organization.description,
    )

@router.get("/current", response_model=OrganizationResponse | None)
def get_current_organization(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    organization = (
        db.query(Organization)
        .filter(Organization.owner_user_id == current_user.id)
        .first()
    )
    if organization is None:
        return None
    return build_response(db, organization)

@router.put("/current", response_model=OrganizationResponse)
def update_current_organization(
    payload: OrganizationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    organization = (
        db.query(Organization)
        .filter(Organization.owner_user_id == current_user.id)
        .first()
    )
    if organization is None:
        raise HTTPException(status_code=404, detail="Organization not found.")

    changes = payload.model_dump(exclude_unset=True)
    brand_name = changes.pop("primary_brand_name", None)

    for field, value in changes.items():
        setattr(organization, field, value)

    if brand_name is not None:
        brand = (
            db.query(Brand)
            .filter(Brand.organization_id == organization.id)
            .order_by(Brand.id)
            .first()
        )
        if brand:
            brand.name = brand_name
        else:
            db.add(Brand(organization_id=organization.id, name=brand_name))

    db.commit()
    db.refresh(organization)
    return build_response(db, organization)
