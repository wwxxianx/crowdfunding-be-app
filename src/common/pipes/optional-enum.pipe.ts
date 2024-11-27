import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class ParseOptionalEnumPipe implements PipeTransform {
  constructor(private readonly enumType: object) {}

  transform(value: any) {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    if (!Object.values(this.enumType).includes(value)) {
      throw new BadRequestException(`Invalid enum value: ${value}`);
    }
    return value;
  }
}