import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { UpdateCampaignDto } from '../dto/update-campaign.dto';

@Injectable()
export class ParseUpdateCampaignDtoPipe implements PipeTransform {
  transform(value: UpdateCampaignDto, metadata: ArgumentMetadata) {
    if (typeof value !== 'object' || !value) {
      return value;
    }

    const result = {};
    for (const [key, val] of Object.entries(value)) {
      // Data transformation logic:
      // convert FormData to its corresponding type
      // as FormData value is all string
      result[key] = this.transformValue(val, key as keyof UpdateCampaignDto);
    }
    return result;
  }

  private transformValue(value: any, key: keyof UpdateCampaignDto): any {
    if (
      key === 'title' ||
      key === 'description' ||
      key === 'contactPhoneNumber' ||
      key === 'beneficiaryName' ||
      key === 'oriBeneficiaryImageId' ||
      key === 'oriCampaignImagesId'
    ) {
      return value;
    }
    if (key === 'targetAmount') {
      return parseInt(value);
    }

    return value;
  }
}
