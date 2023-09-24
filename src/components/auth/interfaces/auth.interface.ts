export interface RegisterInput {
  firstName: string;
  lastName: string;
  businessName: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordInput {
  resetToken: string;
  password: string;
}

export interface AuthJWTInput {
  id: string;
  email: string;
}

export interface LoggedInState {
  uuid: string;
  firstName: string;
  lastName: string;
  businessName: string;
  email: string;
  token: string;
}
