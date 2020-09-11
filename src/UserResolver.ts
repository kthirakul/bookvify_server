import {
  Resolver,
  Query,
  Mutation,
  Arg,
  ObjectType,
  Field,
  Ctx,
  UseMiddleware,
} from 'type-graphql'
import { hash, compare } from 'bcryptjs'
import { User } from './entity/User'
import { MyContext } from './MyContext'
import { createRefreshToken, createAccessToken } from './auth'
import { isAuth } from './isAuth'

@ObjectType()
class LoginResponse {
  @Field()
  accessToken: string
}

@Resolver()
export class UserResolver {
  @Query(() => String)
  hello() {
    return 'hi!'
  }


  // Middleware
  @Query(() => String)
  @UseMiddleware(isAuth)
  bye(@Ctx() { payload }: MyContext) {
    console.log(payload)
    return `your user id is ${payload!.userId}`
  }

  // Get User
  @Query(() => [User])
  users() {
    return User.find()
  }

  // Login
  @Mutation(() => LoginResponse)
  async login(
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Ctx() { res }: MyContext
  ): Promise<LoginResponse> {
    const user = await User.findOne({ where: { email } })

    if (!user) {
      throw new Error('could not find user')
    }

    const valid = await compare(password, user.password)

    if (!valid) {
      throw new Error('bad password')
    }

    // login successful

    // Login ค้างไว้
    res.cookie('jid', createRefreshToken(user), {
      httpOnly: true,
    })

    return {
      accessToken: createAccessToken(user),
    }
  }

  // Register
  @Mutation(() => Boolean)
  async register(
    @Arg('email') email: string,
    @Arg('password') password: string
  ) {
    const hashPassword = await hash(password, 12)
    console.log(hashPassword)

    try {
      await User.insert({
        email,
        password: hashPassword,
      })
    } catch (error) {
      console.log(error)
    }

    return true
  }
}
