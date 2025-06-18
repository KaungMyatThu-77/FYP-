import api from './api';
import { AuthResponse, LoginCredentials, RegisterData, User, RegisterResponse } from '../types/auth.types';

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    return data;
};

export const register = async (userData: RegisterData): Promise<RegisterResponse> => {
    const { data } = await api.post<RegisterResponse>('/auth/register', userData);
    return data;
};

export const logout = async (): Promise<{ message: string }> => {
    const { data } = await api.post<{ message: string }>('/auth/logout');
    return data;
};

export const getProfile = async (): Promise<User> => {
    const { data } = await api.get<User>('/auth/profile');
    return data;
};
