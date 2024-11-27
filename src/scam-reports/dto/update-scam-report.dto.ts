import { ScamReport } from '@prisma/client';

export type UpdateScamReportDto = Partial<Pick<ScamReport, 'resolution' | 'status'>>;
