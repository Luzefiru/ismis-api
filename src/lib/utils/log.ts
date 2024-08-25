import dayjs from 'dayjs';

function info(msg: any, ...args: any[]) {
  console.log(`🔍 [${dayjs().format('YYYY-MM-DD HH:mm:ss')}]`, {
    msg,
    ...args,
  });
}

function error(msg: any, ...args: any[]) {
  console.error(`🚨 [${dayjs().format('YYYY-MM-DD HH:mm:ss')}]`, {
    msg,
    ...args,
  });
}

function warn(msg: any, ...args: any[]) {
  console.warn(`⚠️ [${dayjs().format('YYYY-MM-DD HH:mm:ss')}]`, {
    msg,
    ...args,
  });
}

export const log = { info, error, warn };
