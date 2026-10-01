import { Module } from "@nestjs/common";
import { UsersController } from "./user.controller.js";
import { UserService } from "./user.service.js";

@Module({
    controllers: [UsersController],
    providers: [UserService]
})
export class UserModule {}