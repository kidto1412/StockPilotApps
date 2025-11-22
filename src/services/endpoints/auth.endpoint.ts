import {
  LoginRequest,
  LoginResponse,
  VerifyResponse,
} from '@/interfaces/auth.interface';
import { GET, POST } from '@/utils/api.util';

export const AuthEndpoint = {
  login(payload: LoginRequest) {
    return POST<LoginResponse>('/auth/login', payload);
  },
  checkToken() {
    return GET<VerifyResponse>('/auth/verify');
  },
};
