export const commonHeaders = {
  Accept: 'text/html, */*; q=0.01',
  'Accept-Language': 'en-US,en;q=0.8',
  'Cache-Control': 'no-cache',
  Connection: 'keep-alive',
  'Content-Type': 'application/html;charset=utf-8',
  Pragma: 'no-cache',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-origin',
  'Sec-GPC': '1',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  'X-Requested-With': 'XMLHttpRequest',
  'sec-ch-ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Brave";v="128"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
};

/**
 * Creates a cookie header string from an object of cookies.
 *
 * @param cookies - An object where keys are cookie names and values are cookie values.
 * @returns A string formatted for use in HTTP headers.
 */
export function createRequestHeaders(cookies: {
  [key: string]: string;
}): Record<string, string> {
  const cookieHeaders = Object.entries(cookies)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join('; ');

  return { ...commonHeaders, Cookie: cookieHeaders };
}
