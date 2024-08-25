import axios from 'axios';
import { createRequestHeaders } from '../lib/utils/createRequestHeaders';
import { env } from '../config/env';
import { RequestTokenCookies } from '../types/RequestTokenCookies';
import { log } from '../lib/utils/log';

export async function validateRequestTokens(
  cookies: RequestTokenCookies
): Promise<boolean> {
  try {
    const response = await axios.get(
      `https://${env.ISMIS_DOMAIN}/Home/IndexUSC`,
      {
        headers: createRequestHeaders(cookies),
      }
    );

    return true;
  } catch (error) {
    log.error('Request tokens expired.', error);
    return false;
  }
}
