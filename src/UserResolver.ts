import { Resolver, Query, Mutation, Arg, ObjectType, Field } from 'type-graphql'
import { hash, compare } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { User } from './entity/User'

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

  // Get User
  @Query(() => [User])
  users() {
    return User.find()
  }

  // Login
  @Mutation(() => LoginResponse)
  async login(
    @Arg('email') email: string,
    @Arg('password') password: string
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
    return {
      accessToken: sign({ userId: user.id }, 'secret', { expiresIn: '15m' }),
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
