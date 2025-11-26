import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyResponse,
} from '@/interfaces/auth.interface';
import { GET, POST } from '@/utils/api.util';

export const AuthEndpoint = {
  login(payload: LoginRequest) {
    return POST<LoginResponse>('/auth/login', payload);
  },
  register(payload: RegisterRequest) {
    return POST<RegisterResponse>('/auth/register', payload);
  },
  checkToken() {
    return GET<VerifyResponse>('/auth/verify');
  },
};
