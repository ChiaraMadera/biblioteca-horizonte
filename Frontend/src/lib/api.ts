import type {
  AuditLog,
  CreateRequestDTO,
  CreateResourceDTO,
  CreateUserDTO,
  DashboardMetrics,
  ErrorResponse,
  LoginRequest,
  LoginResponse,
  PaginatedResponse,
  Request,
  RequestStatus,
  Resource,
  Shift,
  Module,
  ResourceCategory,
  UpdateResourceDTO,
  UpdateUserDTO,
  User,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(message: string, status: number, fieldErrors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const url = `${API_URL}/api${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: ErrorResponse;
    try {
      errorData = await response.json();
    } catch {
      errorData = { error: "Error", message: "Error inesperado del servidor" };
    }
    throw new ApiError(
      errorData.message || "Error en la solicitud",
      response.status,
      errorData.fieldErrors
    );
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Auth
export async function login(data: LoginRequest): Promise<LoginResponse> {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMe(token: string): Promise<User> {
  return request<User>("/auth/me", {}, token);
}

// Users
export async function getUsers(
  token: string,
  params?: { role?: string; status?: string; search?: string; page?: number; limit?: number }
): Promise<PaginatedResponse<User>> {
  const searchParams = new URLSearchParams();
  if (params?.role) searchParams.set("role", params.role);
  if (params?.status) searchParams.set("status", params.status);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  const query = searchParams.toString();
  return request<PaginatedResponse<User>>(`/users/${query ? `?${query}` : ""}`, {}, token);
}

export async function getUser(token: string, userId: string): Promise<User> {
  return request<User>(`/users/${userId}`, {}, token);
}

export async function createUser(token: string, data: CreateUserDTO): Promise<User> {
  return request<User>("/users/", {
    method: "POST",
    body: JSON.stringify(data),
  }, token);
}

export async function updateUser(
  token: string,
  userId: string,
  data: UpdateUserDTO
): Promise<User> {
  return request<User>(`/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }, token);
}

export async function deleteUser(token: string, userId: string): Promise<{ message: string }> {
  return request<{ message: string }>(`/users/${userId}`, {
    method: "DELETE",
  }, token);
}

// Resources
export async function getResources(
  token: string,
  params?: { category?: ResourceCategory; available?: boolean }
): Promise<Resource[]> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set("category", params.category);
  if (params?.available !== undefined) searchParams.set("available", String(params.available));
  const query = searchParams.toString();
  return request<Resource[]>(`/resources/${query ? `?${query}` : ""}`, {}, token);
}

export async function getResource(token: string, resourceId: string): Promise<Resource> {
  return request<Resource>(`/resources/${resourceId}`, {}, token);
}

export async function createResource(
  token: string,
  data: CreateResourceDTO
): Promise<Resource> {
  return request<Resource>("/resources/", {
    method: "POST",
    body: JSON.stringify(data),
  }, token);
}

export async function updateResource(
  token: string,
  resourceId: string,
  data: UpdateResourceDTO
): Promise<Resource> {
  return request<Resource>(`/resources/${resourceId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }, token);
}

export async function deleteResource(
  token: string,
  resourceId: string
): Promise<{ message: string }> {
  return request<{ message: string }>(`/resources/${resourceId}`, {
    method: "DELETE",
  }, token);
}


// Requests
export async function getRequests(
  token: string,
  params?: {
    status?: RequestStatus;
    userId?: string;
    resourceId?: string;
  }
): Promise<Request[]> {
  const searchParams = new URLSearchParams();

  if (params?.status) searchParams.set("status", params.status);
  if (params?.userId) searchParams.set("user_id", params.userId);
  if (params?.resourceId) searchParams.set("resource_id", params.resourceId);

  searchParams.set("per_page", "1000");

  const query = searchParams.toString();

  const response = await request<PaginatedResponse<Request>>(
    `/requests/?${query}`,
    {},
    token
  );

  return response.items;
}

export interface AvailabilitySlot {
  shift: Shift;
  module: Module;
  available: boolean;
  reason?: string;
  request_id?: string;
}

export async function getAvailability(
  token: string,
  resourceId: string,
  date: string
): Promise<AvailabilitySlot[]> {
  const params = new URLSearchParams({
    resource_id: resourceId,
    date,
  });

  const response = await request<{ slots: AvailabilitySlot[] }>(
    `/requests/availability?${params.toString()}`,
    {},
    token
  );

  return response.slots;
}

export async function getRequest(token: string, requestId: string): Promise<Request> {
  return request<Request>(`/requests/${requestId}`, {}, token);
}

export async function createRequest(
  token: string,
  data: CreateRequestDTO
): Promise<Request> {
  return request<Request>("/requests/", {
    method: "POST",
    body: JSON.stringify(data),
  }, token);
}

export async function reviewRequest(
  token: string,
  requestId: string,
  status: "CONFIRMADA" | "RECHAZADA" | "CANCELADA"
): Promise<Request> {
  return request<Request>(`/requests/${requestId}/review`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  }, token);
}

export async function cancelRequest(token: string, requestId: string): Promise<Request> {
  return request<Request>(`/requests/${requestId}/cancel`, {
    method: "PATCH",
  }, token);
}

// Admin
export async function getDashboardMetrics(token: string): Promise<DashboardMetrics> {
  return request<DashboardMetrics>("/admin/dashboard", {}, token);
}

export async function getAuditLogs(token: string): Promise<AuditLog[]> {
  return request<AuditLog[]>("/admin/audit-logs", {}, token);
}

export { ApiError };
