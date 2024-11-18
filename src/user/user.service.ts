import { Injectable, NotFoundException } from '@nestjs/common'
import { AuthMethod } from '@prisma/__generated__'
import { hash } from 'argon2'

import { PrismaService } from '@/prisma/prisma.service'

@Injectable()
export class UserService {
  public constructor(private readonly prismaService: PrismaService) {}

  public async findById(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      include: { accounts: true },
    })

    if (!user) {
      throw new NotFoundException('Пользователь не найден. Пожалуйста, проверьте введенные данные.')
    }

    return user
  }

  public async findByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: { email },
      include: { accounts: true },
    })
  }

  public async create(
    email: string,
    password: string,
    username: string,
    avatar: string,
    method: AuthMethod,
    isVerified: boolean
  ) {
    return this.prismaService.user.create({
      data: {
        email,
        password: password ? await hash(password) : '',
        username,
        avatar,
        method,
        isVerified,
      },
      include: { accounts: true },
    })
  }
}
