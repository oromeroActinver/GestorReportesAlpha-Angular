export interface LoginResponse {
  exist: boolean;
  fullName: string | null;
  userEmail: string | null;
  message: string;
  token: string;
}