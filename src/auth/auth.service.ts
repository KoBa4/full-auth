import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthMethod, User } from '@prisma/__generated__'
import { verify } from 'argon2'
import { Request, Response } from 'express'

import { LoginDto } from '@/auth/dto/login.dto'
import { RegisterDto } from '@/auth/dto/register.dto'
import { EmailConfirmationService } from '@/auth/email-confirmation/email-confirmation.service'
import { ProviderService } from '@/auth/provider/provider.service'
import { PrismaService } from '@/prisma/prisma.service'
import { UserService } from '@/user/user.service'

@Injectable()
export class AuthService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly providerService: ProviderService,
    private readonly emailConfirmationService: EmailConfirmationService
  ) {}

  public async register(req: Request, dto: RegisterDto) {
    const isExists = await this.userService.findByEmail(dto.email)

    if (isExists) {
      throw new ConflictException(
        'Регистрация не удалась. Пользователь с таким email уже существует. Пожалуйста, используйте другой email или войдите в систему.'
      )
    }

    const newUser = await this.userService.create(
      dto.email,
      dto.password,
      dto.username,
      '',
      AuthMethod.CREDENTIALS,
      false
    )

    await this.emailConfirmationService.sendVerificationToken(newUser.email)

    return {
      message:
        'Вы успешно зарегистрировались. Пожалуйста, подтвердите ващ email. Сообщение было отправлено на ваш почтовый адрес.',
    }
  }

  public async login(req: Request, dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email)

    if (!user || !user.password) {
      throw new NotFoundException('Пользователь не найден. Пожалуйста, проверьте введенные данные.')
    }

    const isValidPassword = await verify(user.password, dto.password)

    if (!isValidPassword) {
      throw new UnauthorizedException(
        'Неверный пароль. Пожалуйста, попробуйте ещё раз или восстановите пароль, если вы его забыли.'
      )
    }

    if (!user.isVerified) {
      await this.emailConfirmationService.sendVerificationToken(user.email)
      throw new UnauthorizedException('Ващ email не подтвержден. Пожалуйста, проверьте вашу почту и подтвердите адрес.')
    }

    return this.saveSession(req, user)
  }

  public async extractProfileFromCode(req: Request, provider: string, code: string) {
    const providerInstance = this.providerService.findByService(provider)
    const profile = await providerInstance.findUserByCode(code)
    const account = await this.prismaService.account.findFirst({
      where: {
        id: profile.id,
        provider: profile.provider,
      },
    })

    let user = account?.userId ? await this.userService.findById(account.userId) : null

    if (user) {
      return this.saveSession(req, user)
    }

    user = await this.userService.create(
      profile.email,
      '',
      profile.name,
      profile.picture,
      AuthMethod[profile.provider.toUpperCase()],
      true
    )

    if (!account) {
      await this.prismaService.account.create({
        data: {
          userId: user.id,
          type: 'oauth',
          provider: profile.provider,
          accessToken: profile.access_token,
          refreshToken: profile.refresh_token,
          expiresAt: profile.expires_at,
        },
      })
    }

    return this.saveSession(req, user)
  }

  public async logout(req: Request, res: Response): Promise<void> {
    return new Promise((resolve, reject) => {
      req.session.destroy(err => {
        if (err) {
          return reject(
            new InternalServerErrorException(
              'Не удалось завершить сессию. Возможно, возникла проблема с сервером или сессия уже была завершена.'
            )
          )
        }

        res.clearCookie(this.configService.getOrThrow<string>('SESSION_NAME'))
        resolve()
      })
    })
  }

  public async saveSession(req: Request, user: User) {
    return new Promise((resolve, reject) => {
      req.session.userId = user.id
      req.session.save(err => {
        if (err) {
          return reject(
            new InternalServerErrorException(
              'Не удалось сохранить сессию. Проверьте, правильно ли настроены параметры сессии.'
            )
          )
        } else {
          resolve({ user })
        }
      })
    })
  }
}