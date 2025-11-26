export interface LoginResponse {
  access_token: string;
}

export interface RegisterResponse {
  userId: string;
  access_token: string;
}
export interface LoginRequest {
  username: string;
  password: string;
}

export interface VerifyResponse {
  valid: boolean;
}

export interface RegisterRequest {
  fullName: string;
  username: string;
  password: string;
  email: string; // karena @IsEmail() tidak wajib
  phone: string;
  role: string;
}
