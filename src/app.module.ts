import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { UserModule } from './users/user.module.js';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    UserModule
  ],
})
export class AppModule {}
