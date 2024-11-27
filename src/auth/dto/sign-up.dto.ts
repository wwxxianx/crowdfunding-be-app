import { Prisma } from '@prisma/client';

export type SignUpDto = Pick<
  Prisma.UserCreateInput,
  'id' | 'email' | 'fullName'
>;
