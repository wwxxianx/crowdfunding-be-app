import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Supabase } from './supabase.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [Supabase],
  exports: [Supabase],
})
export class SupabaseModule {}
