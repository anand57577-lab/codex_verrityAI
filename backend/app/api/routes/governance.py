
from fastapi import APIRouter, Depends, HTTPException,Body
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.core.database import get_db
from app.models.product import Product
from app.models.advertisement_review import AdvertisementReview
from app.schemas.governance import (
    AdvertisementAnalysisRequest,
    AdvertisementAnalysisResponse,
)
from app.services.governance_service import analyze_advertisement

router = APIRouter(
    prefix="/api/governance",
    tags=["Brand Governance Analysis"],
)


@router.post(
    "/analyze",
    response_model=AdvertisementAnalysisResponse,
)
def analyze(
    payload: AdvertisementAnalysisRequest,
    db: Session = Depends(get_db),
):
    product = db.get(Product, payload.product_id)

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found.",
        )

    result = analyze_advertisement(
        db=db,
        product=product,
        advertisement_text=payload.advertisement_text,
    )

    # Keep automatic approval for low-risk matched results.
    review_status = (
        "approved"
        if result["overall_status"] == "matched_reference"
        else "pending_review"
    )

    review = AdvertisementReview(
        product_id=product.id,
        advertisement_text=payload.advertisement_text,
        ai_summary=result.get("summary") or "",
        ai_conclusion=result.get("conclusion") or "",
        ai_findings=result.get("findings") or [],
        ai_risk_level=result.get("risk_level"),
        ai_overall_status=result.get("overall_status"),
        review_status=review_status,
    )

    db.add(review)
    db.commit()

    return result

@router.get("/pending")
def get_pending_advertisements(
    db: Session = Depends(get_db),
):
    reviews = (
        db.query(AdvertisementReview)
        .filter(
            AdvertisementReview.review_status == "pending_review"
        )
        .order_by(AdvertisementReview.created_at.desc())
        .all()
    )

    return [
        {
            "id": review.id,
            "product_id": review.product.id,
            "product_name": review.product.name,
            "product_details": review.product.specifications,
            "advertisement_text": review.advertisement_text,
            "summary": review.ai_summary,
            "conclusion": review.ai_conclusion,
            "findings": review.ai_findings or [],
            "risk_level": review.ai_risk_level,
            "overall_status": review.ai_overall_status,
            "status": review.review_status,
            "created_at": review.created_at,
        }
        for review in reviews
    ]
    
@router.patch("/{review_id}/decision")
def update_advertisement_review(
    review_id: int,
    payload: dict = Body(...),
    db: Session = Depends(get_db),
):
    decision = payload.get("status")
    comment = payload.get("comment")

    if decision not in ["approved", "denied"]:
        raise HTTPException(
            status_code=400,
            detail="Status must be approved or denied.",
        )

    review = db.get(AdvertisementReview, review_id)

    if review is None:
        raise HTTPException(
            status_code=404,
            detail="Advertisement review not found.",
        )

    if review.review_status != "pending_review":
        raise HTTPException(
            status_code=409,
            detail="This advertisement has already been reviewed.",
        )

    review.review_status = decision
    review.reviewer_comment = comment
    review.reviewed_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(review)

    return {
        "id": review.id,
        "status": review.review_status,
        "message": f"Advertisement {decision} successfully.",
    }
    
    

@router.get("/approved")
def get_approved_advertisements(
    db: Session = Depends(get_db),
):
    reviews = (
        db.query(AdvertisementReview)
        .filter(AdvertisementReview.review_status == "approved")
        .order_by(AdvertisementReview.created_at.desc())
        .all()
    )

    return [
        {
            "id": review.id,
            "product_id": review.product.id,
            "product_name": review.product.name,
            "product_details": review.product.specifications,
            "advertisement_text": review.advertisement_text,
            "status": review.review_status,
            "created_at": review.created_at,
        }
        for review in reviews
    ]
