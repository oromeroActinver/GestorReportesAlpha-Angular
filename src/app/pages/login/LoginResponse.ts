export interface LoginResponse {
  exist: boolean;
  fullName: string ;
  userEmail: string;
  message: string;
  token: string;
  perfil: string;
}