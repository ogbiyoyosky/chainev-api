export interface CreateUserInput {
  firstName: string;
  lastName: string;
  businessName: string;
  email: string;
  password: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  businessName?: string;
  email?: string;
  password?: string;
}
