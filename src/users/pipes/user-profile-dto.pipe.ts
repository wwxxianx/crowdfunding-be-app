import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

import { UpdateUserDto } from '../dto/update-user.dto';
@Injectable()
export class ParseUserProfileDtoPipe implements PipeTransform {
  transform(value: UpdateUserDto, metadata: ArgumentMetadata) {
    if (typeof value !== 'object' || !value) {
      // TODO: handle unknown value
      return value;
    }

    const result = {};
    for (const [key, val] of Object.entries(value)) {
      // Data transformation logic:
      // convert FormData to its corresponding type
      // as FormData value is all string
      result[key] = this.transformValue(val, key as keyof UpdateUserDto);
    }
    return result;
  }

  private transformValue(value: any, key: keyof UpdateUserDto): any {
    if (key === 'fullName' || key === 'phoneNumber') {
      return value;
    }
    if (key === 'favouriteCategoriesId') {
      console.log(value);
      console.log(typeof value);
      console.log(value?.length);
      return this.parseArray(value);
    }
    if (key === 'isOnboardingCompleted') {
      return Boolean(value);
    }

    return value;
  }

  private parseArray(value: string): string[] {
    if (Array.isArray(value)) {
      return value;
    }
    // Assuming the values are comma-separated
    return value.split(',').map((item) => item.trim());
  }
}
