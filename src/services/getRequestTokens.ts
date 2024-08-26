import puppeteer from 'puppeteer';
import { env } from '../config/env';
import { log } from '../lib/utils/log';
import {
  RequestTokenCookies,
  RequestTokenCookiesSchema,
} from '../types/RequestTokenCookies';

interface Cookie {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  expires?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

interface LoginCredentials {
  username: string;
  password: string;
}

const PRODUCTION_OPTIONS = {
  headless: true,
  executablePath: '/usr/bin/google-chrome',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-zygote',
    '--disable-gl-drawing-for-tests',
    '--disable-extensions',
    '--disable-software-rasterizer',
    '--disable-gpu',
    '--single-process',
  ],
};

/**
 * Logs into the page and fetches the tokens for maintaining a session.
 *
 * @param credentials - The username and password for login.
 * @returns The request tokens needed for session maintenance.
 */
export const getRequestTokens = async (
  credentials: LoginCredentials
): Promise<RequestTokenCookies> => {
  log.info('Launching Puppeteer...');
  const options =
    process.env.NODE_ENV !== 'production'
      ? {
          headless: true,
          args: [
            '--disable-features=IsolateOrigins',
            '--disable-site-isolation-trials',
          ],
        }
      : PRODUCTION_OPTIONS;

  const browser = await puppeteer.launch(options);
  log.info('Successfully launched Puppeteer instance.');
  const page = await browser.newPage();

  try {
    // Disable loading of unnecessary resources like images and stylesheets
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (
        ['image', 'stylesheet', 'font', 'media', 'other'].includes(
          req.resourceType()
        )
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });

    log.info('Fetching session tokens...');
    await page.goto(`https://${env.ISMIS_DOMAIN}/Account/Login?ReturnUrl=%2F`, {
      waitUntil: 'domcontentloaded', // Load until the DOM is ready, quicker than networkidle2
      timeout: 30000,
    });

    // Extract the __RequestVerificationToken from the page
    const requestVerificationToken = await page.evaluate(() => {
      const tokenInput = document.querySelector(
        'input[name="__RequestVerificationToken"]'
      );
      return tokenInput ? (tokenInput as HTMLInputElement).value : '';
    });

    if (!requestVerificationToken) {
      throw new Error('No __RequestVerificationToken found');
    }

    // Fill in the login form
    await page.type('input[name="Username"]', credentials.username);
    await page.type('input[name="Password"]', credentials.password);
    await page.evaluate((token) => {
      (
        document.querySelector(
          'input[name="__RequestVerificationToken"]'
        ) as HTMLInputElement
      ).value = token;
    }, requestVerificationToken);

    log.info('Logging in...');
    // Submit the form
    await page.click('button[type="submit"]');
    await page.waitForNavigation({
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    log.info('Extracting cookies...');
    // Extract cookies from the page after login
    const cookies: Cookie[] = await page.cookies();
    const cookieDict: { [name: string]: string } = cookies.reduce(
      (acc: { [name: string]: string }, cookie: Cookie) => {
        acc[cookie.name] = cookie.value;
        return acc;
      },
      {}
    );

    const result = RequestTokenCookiesSchema.safeParse(cookieDict);

    if (!result.success) {
      throw new Error(
        'An error occurred while retrieving tokens. Are your credentials correct?'
      );
    }

    // Verify all required cookies are present
    if (Object.values(result.data).some((value) => !value)) {
      throw new Error('Not all required cookies are present');
    }

    return result.data;
  } catch (error) {
    throw error;
  } finally {
    await browser.close();
  }
};
