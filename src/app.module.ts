import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { TodosModule } from './todos/todos.module.js';
import { UserModule } from './users/user.module.js';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    UserModule,
    TodosModule,
  ],
})
export class AppModule {}
