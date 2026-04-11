import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyResponse,
} from '@/interfaces/auth.interface';
import { ProfileResponse } from '@/interfaces/user.interface';
import { GET, POST } from '@/utils/api.util';
import { APIResponse } from '@/interfaces/base_respone.interface';

export const AuthEndpoint = {
  login(payload: LoginRequest) {
    return POST<LoginResponse>('/auth/login', payload);
  },
  profile(role?: string) {
    const normalizedRole = (role || '').toUpperCase();
    const path =
      normalizedRole === 'OWNER'
        ? '/users/profile/owner'
        : '/users/profile/staff';
    return GET<ProfileResponse>(path);
  },
  register(payload: RegisterRequest) {
    return POST<RegisterResponse>('/auth/register', payload);
  },
  checkToken() {
    return GET<VerifyResponse>('/auth/verify');
  },
  logout() {
    return POST<null>('/auth/logout', {}) as Promise<APIResponse<null>>;
  },
};
