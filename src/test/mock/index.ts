import { PrismaClient } from '@prisma/client';
import { Cache } from 'cache-manager';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { StorageService } from 'src/storage/storage.service';

export const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockProxy<{
  // this is needed to resolve the issue with circular types definition
  // https://github.com/prisma/prisma/issues/10203
  [K in keyof PrismaClient]: Omit<PrismaClient[K], "groupBy">;
}>;

export const cacheMock = mockDeep<Cache>() as unknown as DeepMockProxy<Cache>;
export const storageMock = mockDeep<StorageService>() as unknown as DeepMockProxy<StorageService>;