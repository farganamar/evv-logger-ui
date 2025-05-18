export interface User {
  user_id: string;
  username: string;
  email: string;
  is_verified: boolean;
  roles: string[];
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  issued_at: string;
}

export interface LoginResponse {
  data: AuthTokens;
  message: string;
  code: number;
}

export interface Appointment {
  appointment_id: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  notes: string;
  created_at: string;
  updated_at: string;
  caregiver_id: string;
  client_id: string;  
  client_detail: Client;
}

export interface Client {
  name: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  note?: string;
  created_at: string;
  updated_at: string;
}

export interface AppointmentListResponse {
  data: Appointment[];
  message: string;
  code: number;
}

export interface AppointmentDetailResponse {
  data: Appointment;
  message: string;
  code: number;
}

export interface AppointmentLog {
  appointment_id: string;
  caregiver_id: string;
  log_type: LogType;
  log_data: Record<string, unknown>;
  latitude: number;
  longitude: number;
  timestamp: string;
  notes: string;
}

export interface AppointmentLogsResponse {
  data: AppointmentLog[];
  message: string;
  code: number;
}

export type AppointmentStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type LogType = 'CHECK-IN' | 'CHECK-OUT' | 'NOTE' ;