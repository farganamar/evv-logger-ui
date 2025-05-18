import api from './api';
import { AppointmentDetailResponse, AppointmentListResponse, AppointmentLogsResponse, AppointmentStatus } from '../types';

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