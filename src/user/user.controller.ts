import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common'

import { Authorization } from '@/auth/decorators/auth.decorator'
import { Authorized } from '@/auth/decorators/authorized.decorator'

import { UserService } from './user.service'

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Authorization()
  @HttpCode(HttpStatus.OK)
  @Get('profile')
  public async findProfile(@Authorized('id') userId: string) {
    return this.userService.findById(userId)
  }

  @Authorization(true)
  @HttpCode(HttpStatus.OK)
  @Get('/:id')
  public async findById(@Param('id') id: string) {
    return this.userService.findById(id)
  }
}
