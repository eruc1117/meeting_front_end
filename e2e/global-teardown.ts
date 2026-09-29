// eslint-disable-next-line @typescript-eslint/no-var-requires
const stack = require('./stack');

export default async function globalTeardown() {
  if (process.env.E2E_STACK === 'external') return;
  await stack.stop();
}
