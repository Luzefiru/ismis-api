import * as cheerio from 'cheerio';
import { z } from 'zod';
import {
  StudyLoadCourseSchema,
  StudyLoadCourse,
} from '../../types/StudyLoadCourse';
import { log } from '../utils/log';

export function parseStudyLoad(html: string): StudyLoadCourse[] {
  const $ = cheerio.load(html);
  const rows = $('#dvData table tr').toArray();

  const courses: StudyLoadCourse[] = rows.slice(1).map((row) => {
    const cells = $(row).find('td');

    const group = cells.eq(0).text().trim();
    const courseCode = cells.eq(1).text().trim();
    const schedule = cells.eq(2).text().trim().replace(/\s+/g, ' ');
    const faculty = cells.eq(3).text().trim() || null;
    const units = parseFloat(cells.eq(4).text().trim());
    const status = cells.eq(5).text().trim();

    return {
      group,
      courseCode,
      schedule,
      faculty,
      units,
      status,
    };
  });

  const parsedCourses = z.array(StudyLoadCourseSchema).parse(courses);

  return parsedCourses;
}
