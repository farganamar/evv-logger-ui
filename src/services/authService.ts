import api from './api';
import { LoginResponse } from '../types';

export const loginUser = async (username: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/v1/evv/user/login', { username });
  return response.data;
};