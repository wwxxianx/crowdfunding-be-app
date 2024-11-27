import { ScamReport } from '@prisma/client';

export type CreateScamReportDto = Pick<
  ScamReport,
  'campaignId' | 'description'
>;
