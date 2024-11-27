import { Organization } from '@prisma/client';

export type CreateOrganizationDto = Pick<
  Organization,
  'name' | 'email' | 'contactPhoneNumber' | 'slogan'
>;
