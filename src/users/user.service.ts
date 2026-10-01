import { Injectable,NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService){}

    async findById(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                email: true,
                firstname: true,
                lastname: true,
                createdAt: true,
                updatedAt: true
            }
        })

        if(!user) {
            throw new NotFoundException('User not found')
        }

        return user
    }
}