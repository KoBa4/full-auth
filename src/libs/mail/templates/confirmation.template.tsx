import * as React from 'react'
import { Body, Heading, Html, Link, Tailwind, Text } from '@react-email/components'

type Props = {
  domain: string
  token: string
}

/**
 * A React component that renders a confirmation email template.
 *
 * The component expects the following props:
 *
 * - `domain`: The domain of the application, which is used to construct the
 *   confirmation link.
 * - `token`: The confirmation token that is used to confirm the user's email.
 *
 * The rendered template contains a heading, a greeting message, a link to
 * confirm the email, and a message that is displayed if the user did not
 * request the confirmation.
 */
export function ConfirmationTemplate({ domain, token }: Props) {
  const confirmLink = `${domain}/auth/confirmation?token=${token}`

  return (
    <Tailwind>
      <Html>
        <Body className='text-black'>
          <Heading>Подтверждение почты</Heading>
          <Text>
            Привет! Чтобы подтвердить свой адрес электронной почты, пожалуйста, перейдите по следующей ссылке:
          </Text>
          <Link href={confirmLink}>Подтвердить почту</Link>
          <Text>
            Эта ссылка действительна в течение 1 часа. Если вы не запрашивали подтверждение, просто проигнорируйте это
            сообщение.
          </Text>
        </Body>
      </Html>
    </Tailwind>
  )
}
