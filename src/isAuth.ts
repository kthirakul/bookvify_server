import { MiddlewareFn } from 'type-graphql'
import { MyContext } from './MyContext'
import { verify } from 'jsonwebtoken'

// bearer something..

export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
  const authorization = context.req.headers['authorization']
  console.log('authorization : ', authorization)
  if (!authorization) {
    throw new Error('not authorizated')
  }
  try {
    const token = authorization.split(' ')[1]
    const payload = verify(token, process.env.ACCESS_TOKEN_SECRET!)
    context.payload = payload as any
  } catch (error) {
    console.log(error)
    throw new Error('not authorizated')
  }

  return next()
}
