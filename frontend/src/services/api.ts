
const AUTH_TOKEN_KEY = "verityai_access_token";
const AUTH_USER_KEY = "verityai_user";

function normalizeApiBaseUrl(value?: string): string {
  const configured = (value ?? "").trim();

  if (!configured) {
    throw new Error("VITE_API_BASE_URL must be configured.");
  }

  try {
    const url = new URL(configured);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("Unsupported API URL protocol.");
    }
    return url.origin.replace(/\/+$/, "");
  } catch {
    throw new Error(
      "VITE_API_BASE_URL must be an absolute HTTP or HTTPS backend URL.",
    );
  }
}

export const API_BASE_URL = normalizeApiBaseUrl(
  import.meta.env.VITE_API_BASE_URL,
);

export function buildApiUrl(path: string): string {
  const cleanBase = API_BASE_URL.replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

export function buildDocumentDownloadUrl(documentId: number): string {
  return buildApiUrl(`/api/documents/${documentId}/download`);
}

/* =========================================================
   AUTHENTICATION
========================================================= */

export interface AuthUser {
  id: number;
  full_name: string;
  email: string;
  organization_id?: number | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  organization_name: string;
  primary_brand_name: string;
  industry: string;
  country_market: string;
  description?: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getAuthUser(): AuthUser | null {
  const storedUser = localStorage.getItem(AUTH_USER_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as AuthUser;
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
}

export function saveAuthSession(auth: AuthResponse): void {
  localStorage.setItem(AUTH_TOKEN_KEY, auth.access_token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(auth.user));
}

export function clearAuthSession(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken());
}

export async function registerAccount(
  payload: RegisterPayload,
): Promise<AuthResponse> {
  const auth = await request<AuthResponse>("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  saveAuthSession(auth);
  return auth;
}

export async function loginAccount(
  payload: LoginPayload,
): Promise<AuthResponse> {
  const auth = await request<AuthResponse>("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  saveAuthSession(auth);
  return auth;
}

export async function getCurrentUser(): Promise<AuthUser> {
  return request<AuthUser>("/api/auth/me");
}

export function logoutAccount(): void {
  clearAuthSession();
}

/* =========================================================
   COMMON API REQUEST FUNCTION
========================================================= */

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  // Automatically attach the JWT token to authenticated requests.
  const token = getAuthToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildApiUrl(path), {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.text();
    let message = body || `HTTP ${response.status}`;

    try {
      const parsed: unknown = JSON.parse(body);

      if (
        typeof parsed === "object" &&
        parsed !== null &&
        "detail" in parsed
      ) {
        const detail = parsed.detail;

        message =
          typeof detail === "string"
            ? detail
            : JSON.stringify(detail) ?? String(detail);
      }
    } catch {
      // Keep the response body when the server returns non-JSON error text.
    }

    if (response.status === 401 && token) {
      // Do not silently clear the session here.
      // The UI can decide whether to redirect the user to login.
    }

    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

/* =========================================================
   ORGANIZATION
========================================================= */

export interface OrganizationPayload {
  legal_name: string;
  primary_brand_name: string;
  industry: string;
  country_market: string;
  description: string | null;
}

export interface OrganizationResponse extends OrganizationPayload {
  id: number;
  brand_id: number;
}

export async function createOrganization(
  payload: OrganizationPayload,
): Promise<OrganizationResponse> {
  return request<OrganizationResponse>("/api/organizations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function getCurrentOrganization(): Promise<OrganizationResponse | null> {
  return request<OrganizationResponse | null>(
    "/api/organizations/current",
  );
}

export async function updateOrganization(
  payload: Partial<OrganizationPayload>,
): Promise<OrganizationResponse> {
  return request<OrganizationResponse>("/api/organizations/current", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

/* =========================================================
   BRAND GUIDELINES
========================================================= */

export interface GuidelinePayload {
  voice_and_tone: string;
  preferred_terminology: string | null;
  restricted_phrases: string | null;
  visual_identity_notes: string | null;
}

export interface GuidelineResponse extends GuidelinePayload {
  id: number;
  brand_id: number;
  version: number;
  approval_status: string;
  created_at: string;
}

export async function saveGuidelines(
  brandId: number,
  payload: GuidelinePayload,
): Promise<GuidelineResponse> {
  return request<GuidelineResponse>(
    `/api/brands/${brandId}/guidelines`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
}

export async function getGuidelines(brandId: number) {
  return request<any>(`/api/brands/${brandId}/guidelines`);
}

/* =========================================================
   PRODUCTS
========================================================= */

export interface ProductPayload {
  name: string;
  sku: string;
  category: string | null;
  specifications: string | null;
  approved_claims: string[];
}

export interface ProductClaimResponse {
  id: number;
  product_id: number;
  claim_text: string;
  approval_status: string;
  source_document_id: number | null;
  effective_date: string | null;
  review_date: string | null;
}

export interface ProductResponse
  extends Omit<ProductPayload, "approved_claims"> {
  id: number;
  brand_id: number;
  created_at: string;
  claims: ProductClaimResponse[];
}

export async function createProduct(
  brandId: number,
  payload: ProductPayload,
): Promise<ProductResponse> {
  return request<ProductResponse>(
    `/api/brands/${brandId}/products`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
}

export async function listProducts(
  brandId: number,
): Promise<ProductResponse[]> {
  return request<ProductResponse[]>(
    `/api/brands/${brandId}/products`,
  );
}

/* =========================================================
   DOCUMENTS
========================================================= */

export interface DocumentResponse {
  id: number;
  brand_id: number;
  product_id: number | null;
  filename: string;
  content_type: string;
  document_type: string;
  file_size: number;
  approval_status: string;
  uploaded_at: string;
}

export async function uploadDocument(
  brandId: number,
  file: File,
  documentType = "supporting",
  productId?: number,
): Promise<DocumentResponse> {
  const data = new FormData();

  data.append("file", file);
  data.append("document_type", documentType);

  if (productId !== undefined) {
    data.append("product_id", String(productId));
  }

  return request<DocumentResponse>(
    `/api/brands/${brandId}/documents`,
    {
      method: "POST",
      body: data,
    },
  );
}

export async function listDocuments(
  brandId: number,
): Promise<DocumentResponse[]> {
  return request<DocumentResponse[]>(
    `/api/brands/${brandId}/documents`,
  );
}

/* =========================================================
   GOVERNANCE ANALYSIS
========================================================= */

export interface GovernanceFinding {
  claim_text: string;
  status: string;
  severity: string;
  explanation: string;
  source: string | null;
  suggested_correction: string | null;
}

export interface GovernanceResponse {
  product_id: number;
  product_name: string;
  overall_status: string;
  risk_level: string;
  summary: string;
  conclusion: string;
  findings: GovernanceFinding[];
  limitations: string[];
}

export async function analyzeAdvertisement(
  productId: number,
  advertisementText: string,
): Promise<GovernanceResponse> {
  return request<GovernanceResponse>(
    "/api/governance/analyze",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: productId,
        advertisement_text: advertisementText,
      }),
    },
  );
}

/* =========================================================
   APPROVED ADVERTISEMENTS
========================================================= */

export interface ApprovedAdvertisement {
  id: number;
  product_id: number;
  product_name: string;
  product_details: string | null;
  advertisement_text: string;
  status: string;
  created_at: string;
}

export async function getApprovedAdvertisements(): Promise<
  ApprovedAdvertisement[]
> {
  return request<ApprovedAdvertisement[]>(
    "/api/governance/approved",
  );
}

/* =========================================================
   PENDING ADVERTISEMENTS / REVIEW CENTRE
========================================================= */

export interface PendingAdvertisement {
  id: number;
  product_id: number;
  product_name: string;
  product_details: string | null;
  advertisement_text: string;
  summary: string | null;
  conclusion: string | null;
  findings: GovernanceFinding[];
  risk_level: string | null;
  overall_status: string | null;
  status: string;
  created_at: string;
}

export async function getPendingAdvertisements(): Promise<
  PendingAdvertisement[]
> {
  return request<PendingAdvertisement[]>(
    "/api/governance/pending",
  );
}

export async function updateAdvertisementReview(
  reviewId: number,
  status: "approved" | "denied",
  comment?: string,
): Promise<{
  id: number;
  status: string;
  message: string;
}> {
  return request<{
    id: number;
    status: string;
    message: string;
  }>(`/api/governance/${reviewId}/decision`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status,
      comment,
    }),
  });
}
