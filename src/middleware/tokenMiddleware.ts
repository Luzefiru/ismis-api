import { createMiddleware } from 'hono/factory';
import { getCookie, setCookie } from 'hono/cookie';
import { getRequestTokens } from '../services/getRequestTokens';
import { validateRequestTokens } from '../services/validateRequestTokens';
import {
  RequestTokenCookies,
  RequestTokenCookiesSchema,
} from '../types/RequestTokenCookies';
import { LoginCredentialsSchema } from '../types/LoginCredentials';
import { HTTPException } from 'hono/http-exception';
import { log } from '../lib/utils/log';

export const tokenMiddleware = createMiddleware<{
  Variables: {
    tokens: RequestTokenCookies;
  };
}>(async (c, next) => {
  try {
    const allCookies = getCookie(c);
    const parsedTokens = RequestTokenCookiesSchema.safeParse(allCookies);

    const isValidRequestTokens =
      parsedTokens.success && (await validateRequestTokens(parsedTokens.data));

    if (!isValidRequestTokens) {
      try {
        const body = await c.req.json();

        const parsedCredentials = LoginCredentialsSchema.safeParse(body);
        log.info(`Fetching tokens for ${parsedCredentials.data?.username}...`);

        if (!parsedCredentials.success) {
          throw new Error(
            `Invalid login credentials: ${parsedCredentials.error.issues[0].message}`
          );
        }

        const tokens = await getRequestTokens(parsedCredentials.data);
        for (const key in tokens) {
          setCookie(c, key, tokens[key as keyof RequestTokenCookies], {
            sameSite: 'None',
            secure: true,
          });
        }
        c.set('tokens', tokens);
      } catch (e) {
        throw e;
      }
    } else {
      const existingTokens = {} as RequestTokenCookies;
      for (const key in parsedTokens.data) {
        existingTokens[key as keyof RequestTokenCookies] = getCookie(
          c,
          key
        ) as string;
      }
      c.set('tokens', existingTokens);
    }

    await next();
  } catch (e) {
    throw new HTTPException(500, {
      message: (e as Error).message,
      cause: e,
    });
  }
});
