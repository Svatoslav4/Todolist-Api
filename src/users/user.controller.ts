import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { UserService } from './user.service.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(
    @CurrentUser() user: CurrentUser
  ) {
    return this.usersService.findById(
        user.userId,
    );
  }
}
