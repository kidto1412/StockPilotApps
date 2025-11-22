export interface LoginResponse {
  access_token: string;
}
export interface LoginRequest {
  username: string;
  password: string;
}

export interface VerifyResponse {
  valid: boolean;
}
