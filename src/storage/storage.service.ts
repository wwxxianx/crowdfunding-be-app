import { Injectable } from '@nestjs/common';
import { Supabase } from 'src/common/supabase/supabase.service';

type UploadFileResponse =
  | {
      data: {
        publicUrl: string;
      };
      error: string;
    }
  | {
      data: null;
      error: string;
    };

@Injectable()
export class StorageService {
  constructor(private supabase: Supabase) {}

  async uploadFile(
    bucket: string,
    filePath: string,
    file: Buffer,
    contentType: string,
  ): Promise<UploadFileResponse> {
    const { data, error } = await this.supabase
      .getClient()
      .storage.from(bucket)
      .upload(filePath, file, { contentType: contentType, upsert: true });

    if (error != null) {
      console.log(error);
      return { error: error.message, data: null };
    }

    const {
      data: { publicUrl },
    } = this.supabase.getClient().storage.from(bucket).getPublicUrl(filePath);

    return { data: { publicUrl: publicUrl }, error: null };
  }
}
