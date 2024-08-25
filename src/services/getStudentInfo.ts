import axios from 'axios';
import { parseStudentInfo } from '../lib/parsers/parseStudentInfo';
import { StudentInfo } from '../types/StudentInfo';
import { createRequestHeaders } from '../lib/utils/createRequestHeaders';
import { env } from '../config/env';
import { RequestTokenCookies } from '../types/RequestTokenCookies';
import { log } from '../lib/utils/log';

export async function getStudentInfo(
  cookies: RequestTokenCookies
): Promise<StudentInfo> {
  try {
    const response = await axios.get(
      `https://${env.ISMIS_DOMAIN}/Manage/Student`,
      {
        headers: createRequestHeaders(cookies),
      }
    );

    return parseStudentInfo(response.data);
  } catch (error) {
    log.error('Error fetching student info:', error);
    throw error;
  }
}
