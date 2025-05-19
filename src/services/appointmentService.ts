import api from './api';
import { 
  AppointmentDetailResponse, 
  AppointmentListResponse, 
  AppointmentLogsResponse, 
  AppointmentStatus, 
  CheckInOutResponse, 
  CheckInOutPayload, 
  ReportActivityPayload, 
  ReportActivityResponse,
  AppointmetSeederPayload,
  AppointmentSeederResponse
} from '../types';

export const getAppointments = async (status?: AppointmentStatus): Promise<AppointmentListResponse> => {
  const params = status ? { status } : {};
  const response = await api.get<AppointmentListResponse>('/v1/evv/appointment/list', { params });
  return response.data ;
};

export const getAppointmentById = async (appointmentId: string): Promise<AppointmentDetailResponse> => {
  const response = await api.get<AppointmentDetailResponse>(`/v1/evv/appointment/${appointmentId}`);
  return response.data;
};

export const getAppointmentLogs = async (appointmentId: string): Promise<AppointmentLogsResponse> => {
  const response = await api.get<AppointmentLogsResponse>(`/v1/evv/appointment/${appointmentId}/logs`);
  return response.data;
};

export const checkInAppointment = async (payload: CheckInOutPayload): Promise<CheckInOutResponse> => {
  const response = await api.post<CheckInOutResponse>('/v1/evv/appointment/check-in', payload);
  return response.data
};

export const checkOutAppointment = async (payload: CheckInOutPayload): Promise<CheckInOutResponse> => {
  const response = await api.post<CheckInOutResponse>('/v1/evv/appointment/check-out', payload);
  return response.data;
};


export const reportActivity = async (payload: ReportActivityPayload): Promise<ReportActivityResponse> => {
  const response = await api.post<ReportActivityResponse>('/v1/evv/appointment/note', payload);
  return response.data;
}

export const appointmentSeeder = async (payload: AppointmetSeederPayload ): Promise<AppointmentSeederResponse> => {
  const response = await api.post<AppointmentSeederResponse>('/v1/evv/seed/appointment', payload);
  return response.data;
}



