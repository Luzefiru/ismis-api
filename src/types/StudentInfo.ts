import { z } from 'zod';
import dayjs from 'dayjs';

export const StudentInfoSchema = z.object({
  studentId: z.number().int().positive(),
  fullName: z.string().min(1),
  dateOfBirth: z.string().transform((val) => {
    const date = dayjs(val);
    return date.format('YYYY-MM-DD');
  }),
  yearLevel: z.number().int().positive(),
  studentType: z.string().min(1),
  program: z.string().min(1),
});
export type StudentInfo = z.infer<typeof StudentInfoSchema>;
