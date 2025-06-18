export interface User {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'educator' | 'admin';
  proficiency_level?: 'beginner' | 'intermediate' | 'advanced';
  learning_goals?: string;
  profile_picture?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  first_name: string;
  last_name: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user_id: number;
  email: string;
  role: 'student' | 'educator' | 'admin';
}

export interface RegisterResponse {
  message: string;
  user_id: number;
  email: string;
  role: 'student' | 'educator' | 'admin';
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}
