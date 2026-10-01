import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(0)
  password: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  firstName: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  lastName: string;
}
