export interface UserRequest {
  fullName: string;
  username: string;
  password?: string;
  email: string;
  phone: string;
  role: string;
}

export interface UserResponse {
  id: string;
  fullName: string;
  username: string;
  password: string | null;
  email: string;
  phone: string;
  role: "ADMIN" | "CASHIER" | "OTHER"; // bisa disesuaikan
  createdAt: string; // atau Date kalau mau auto-parse
  updatedAt: string;
}
