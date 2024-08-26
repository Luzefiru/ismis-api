import { StudentInfo, StudentInfoSchema } from '../../types/StudentInfo';
import { load } from 'cheerio';

export function parseStudentInfo(html: string): StudentInfo {
  const $ = load(html);

  const fullName = $('td.bold:nth-child(2)').eq(0).text().trim() || '';
  const studentId = parseInt(
    $('td.bold:nth-child(2)').eq(1).text().trim() || '0'
  );
  const dateOfBirth = $('td.bold:nth-child(2)').eq(2).text().trim() || '';
  const yearLevel = parseInt(
    $('td.bold:nth-child(2)').eq(3).text().trim() || '0'
  );
  const studentType = $('td.bold:nth-child(2)').eq(4).text().trim() || '';
  const program = $('center h3 b').first().text().trim() || '';

  const data = {
    fullName,
    studentId,
    dateOfBirth,
    yearLevel,
    studentType,
    program,
  };

  try {
    const parsedData = StudentInfoSchema.parse(data);
    return parsedData;
  } catch (e) {
    throw new Error('Invalid student information');
  }
}
