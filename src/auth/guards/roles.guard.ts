import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'

@Injectable()
export class RolesGuard implements CanActivate {
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    if (!request.user.isAdmin) {
      throw new ForbiddenException('Недостаточно прав. У вас нет прав доступа к этому ресурсу.')
    }

    return true
  }
}
