import { z } from 'zod';
import dayjs from 'dayjs';

export const StudyLoadCourseSchema = z.object({
  group: z.string(),
  courseCode: z.string(),
  schedule: z.string(),
  faculty: z.string().nullable(),
  units: z.number(),
  status: z.string(),
});
export type StudyLoadCourse = z.infer<typeof StudyLoadCourseSchema>;

export const AcademicPeriod = {
  FIRST_SEMESTER: 'FIRST_SEMESTER',
  SECOND_SEMESTER: 'SECOND_SEMESTER',
  SUMMER: 'SUMMER',
  FIRST_TRIMESTER: 'FIRST_TRIMESTER',
  SECOND_TRIMESTER: 'SECOND_TRIMESTER',
  THIRD_TRIMESTER: 'THIRD_TRIMESTER',
  TRANSITION_SEMESTER: 'TRANSITION_SEMESTER',
  SENIORHIGH_TRANSITION_SEMESTER_1: 'SENIORHIGH_TRANSITION_SEMESTER_1',
  SENIORHIGH_TRANSITION_SEMESTER_2: 'SENIORHIGH_TRANSITION_SEMESTER_2',
} as const;

const CURRENT_YEAR = Number(dayjs().format('YYYY'));
export const AcademicYearSchema = z
  .string()
  .refine(
    (val) => {
      const year = Number(val);
      return !isNaN(year) && year >= 1992 && year <= CURRENT_YEAR;
    },
    {
      message: `Academic year must be a string representing a year between 1992 and ${CURRENT_YEAR}`,
    }
  )
  .default(String(CURRENT_YEAR));

export const StudyLoadArgsSchema = z.object({
  period: z.nativeEnum(AcademicPeriod).default(AcademicPeriod.FIRST_SEMESTER),
  year: AcademicYearSchema,
});
export type StudyLoadArgs = z.infer<typeof StudyLoadArgsSchema>;
