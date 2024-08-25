import { RequestTokenCookies } from '../types/RequestTokenCookies';
import { log } from '../lib/utils/log';
import { getStudentInfo } from './getStudentInfo';

export async function validateRequestTokens(
  cookies: RequestTokenCookies
): Promise<boolean> {
  try {
    await getStudentInfo(cookies);

    return true;
  } catch (error) {
    log.error('Request tokens expired.', error);
    return false;
  }
}
