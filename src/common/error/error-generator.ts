import {
  BadRequestException,
  ConflictException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export function throwGeneralError(
  error: PrismaClientKnownRequestError,
  action: String,
) {
  let errorRes = {
    errorTrace: error.message,
    errorCode: error.code,
    errorMessage: '',
  };
  switch (error.code) {
    case 'P2002':
      errorRes.errorMessage = `Unique constraint failed on the ${action}`;
      throw new ConflictException(errorRes);
    case 'P2005':
    case 'P2006':
    case 'P2007':
    case 'P2019':
      errorRes.errorMessage = `Invalid value`;
      throw new NotAcceptableException(errorRes);
    case 'P2011':
      errorRes.errorMessage = `Null constraint violation`;
      throw new NotAcceptableException(errorRes);
    case 'P2012':
    case 'P2013':
      errorRes.errorMessage = `Missing a required value`;
      throw new NotAcceptableException(errorRes);
    case 'P2015':
      errorRes.errorMessage = 'A related record could not be found';
      throw new NotFoundException(errorRes);
    default:
      throw new BadRequestException(errorRes);
  }
}
