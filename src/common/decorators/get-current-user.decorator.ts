import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayloadWithRT } from 'src/auth/types/jwt-payload';

export const GetCurrentUser = createParamDecorator(
  (data: keyof JwtPayloadWithRT | undefined, context: ExecutionContext) => {
    console.log('data: ', data);
    const request = context.switchToHttp().getRequest();
    console.log(request.user);
    if (!data) return request.user;
    return request.user[data];
  },
);
