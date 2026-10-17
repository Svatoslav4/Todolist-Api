import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { TodosModule } from './todos/todos.module.js';
import { UserModule } from './users/user.module.js';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthModule,
    NotificationsModule,
    PrismaModule,
    UserModule,
    TodosModule,
  ],
})
export class AppModule {}
