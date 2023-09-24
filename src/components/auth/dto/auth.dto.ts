import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { normalizeEmailAddress } from '../../../shared/utils/email.utils';

export class CreateUserAccountDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  businessName: string;

  @Transform((params) => normalizeEmailAddress(params.value))
  @IsEmail()
  email: string;

  @MinLength(8)
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class LoginDto {
  @Transform((params) => normalizeEmailAddress(params.value))
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RequestPasswordResetDto {
  @Transform((params) => normalizeEmailAddress(params.value))
  @IsString()
  @IsEmail()
  email: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class PasswordResetDto {
  @IsString()
  @IsNotEmpty()
  resetToken: string;

  @IsString()
  @MinLength(8)
  password: string;
}
