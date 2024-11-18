import { applyDecorators, UseGuards } from '@nestjs/common'

import { AuthGuard } from '@/auth/guards/auth.guard'
import { RolesGuard } from '@/auth/guards/roles.guard'

export function Authorization(isAdmin = false) {
  if (isAdmin) {
    return applyDecorators(UseGuards(AuthGuard, RolesGuard))
  }

  return applyDecorators(UseGuards(AuthGuard))
}
