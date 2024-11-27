import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseOptionalBoolPipe implements PipeTransform {
  transform(value: any) {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    if (value === 'true') {
      return true;
    }
    if (value === 'false') {
      return false;
    }
    return value;
  }
}
