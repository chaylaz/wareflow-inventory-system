export type AuthenticatedUser = {
  id: string;
  fullName: string;
  email: string;
  role: string;
};

export type LoginRequest = {
  email: string;
  password: string;
  rememberMe: boolean;
};