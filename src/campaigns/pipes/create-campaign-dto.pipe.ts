import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { CreateCampaignDto } from '../dto/create-campaign.dto';

@Injectable()
export class ParseCreateCampaignDtoPipe implements PipeTransform {
  transform(value: CreateCampaignDto, metadata: ArgumentMetadata) {
    if (typeof value !== 'object' || !value) {
      return value;
    }

    const result = {};
    for (const [key, val] of Object.entries(value)) {
      // Data transformation logic:
      // convert FormData to its corresponding type
      // as FormData value is all string
      result[key] = this.transformValue(val, key as keyof CreateCampaignDto);
    }
    return result;
  }

  private transformValue(value: any, key: keyof CreateCampaignDto): any {
    if (
      key === 'title' ||
      key === 'description' ||
      key === 'contactPhoneNumber' ||
      key === 'beneficiaryName'
    ) {
      return value;
    }
    if (key === 'targetAmount') {
      return parseInt(value);
    }

    return value;
  }
}
