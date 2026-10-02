// Tipos alineados con las respuestas reales del backend Flask (snake_case)

export type Role = "docente" | "bibliotecaria" | "admin";
export type UserStatus = "ACTIVO" | "INACTIVO" | "SUSPENDIDO";
export type RequestStatus = "PENDIENTE" | "CONFIRMADA" | "RECHAZADA" | "CANCELADA";
export type ResourceCategory = "Equipamiento" | "Espacios" | "Material bibliográfico";
export type ResourceCondition = "EXCELENTE" | "BUENO" | "EN_MANTENIMIENTO" | "FUERA_DE_SERVICIO";
export type Shift = "Mañana · 08:00–12:00" | "Tarde · 13:00–17:00";
export type Module =
  | "Módulo 1 · 08:00–09:20"
  | "Módulo 2 · 09:30–10:50"
  | "Módulo 3 · 11:00–12:00"
  | "Módulo 1 · 13:00–14:20"
  | "Módulo 2 · 14:30–15:50"
  | "Módulo 3 · 16:00–17:00";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  dni?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: string;
  name: string;
  category: ResourceCategory;
  description: string;
  info: string;
  icon: string;
  available: boolean;
  condition: ResourceCondition;
  serial_number?: string;
  location?: string;
  tone: string;
  created_at?: string;
  updated_at?: string;
}

export interface Request {
  id: string;
  resource_id: string;
  user_id: string;
  teacher: string;
  date: string;
  shift: Shift;
  module: Module;
  notes?: string;
  status: RequestStatus;
  created_at: string;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  targetEntity: string;
  targetId: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface DashboardMetrics {
  totalResources: number;
  activeUsers: number;
  totalRequestsThisMonth: number;
  pendingRequests: number;
  confirmedRequests: number;
  rejectedRequests: number;
  mostRequestedResources: Array<{
    resourceId: string;
    resourceName: string;
    requestCount: number;
  }>;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role: Role;
  dni?: string;
  phone?: string;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  role?: Role;
  status?: UserStatus;
  dni?: string;
  phone?: string;
}

export interface CreateResourceDTO {
  id: string;
  name: string;
  category: ResourceCategory;
  description: string;
  info: string;
  icon: string;
  available?: boolean;
  condition?: ResourceCondition;
  serial_number?: string;
  location?: string;
  tone: string;
}

export interface UpdateResourceDTO {
  name?: string;
  category?: ResourceCategory;
  description?: string;
  info?: string;
  icon?: string;
  available?: boolean;
  condition?: ResourceCondition;
  serial_number?: string;
  location?: string;
  tone?: string;
}

export interface CreateRequestDTO {
  resource_id: string;
  teacher: string;
  date: string;
  shift: Shift;
  module: Module;
  notes?: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  fieldErrors?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}
