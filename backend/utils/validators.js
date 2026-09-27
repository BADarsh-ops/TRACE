import { z } from 'zod';
export const entitySchema = z.object({ type: z.string(), value: z.string(), normalizedValue: z.string(), confidence: z.number().min(0).max(1), sourceEvidenceId: z.string(), sourceText: z.string(), uncertain: z.boolean().default(false) });
export const aiResultSchema = z.object({ entities: z.array(entitySchema), eventType: z.enum(['MESSAGE_RECEIVED','PAYMENT_REQUEST','TRANSACTION','URL_IDENTIFIED','OTP_REQUEST','LOGIN_EVENT','ACCOUNT_CHANGE','FOLLOW_UP_MESSAGE','OTHER']), eventDescription: z.string().nullable().optional() });
export const incidentInput = z.object({ title: z.string().trim().min(3).max(160), description: z.string().trim().max(2000).default('') });
