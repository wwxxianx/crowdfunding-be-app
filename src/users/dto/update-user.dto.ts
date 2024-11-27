import { User } from '@prisma/client';

export type UpdateUserDto = Pick<
  User,
  | 'fullName'
  | 'phoneNumber'
  | 'profileImageUrl'
  | 'address'
  | 'identityNumber'
  | 'onesignalId'
> & {
  favouriteCategoriesId: string[];
  isOnboardingCompleted?: boolean;
};
