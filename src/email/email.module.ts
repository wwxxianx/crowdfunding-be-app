import { Module } from '@nestjs/common';
import { EmailService } from './email.service';

@Module({
  imports: [
    // ResendModule.forAsyncRoot({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: async (configServie: ConfigService) => {
    //     return {
    //       apiKey: configServie.get('RESEND_API_KEY'),
    //     }
    //   },
    // }),
  ],
  providers: [EmailService],
  exports: [EmailService]
})
export class EmailModule {}
