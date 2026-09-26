// Playwright globalSetup：起兩個測試後端（見 stack.js）。E2E_STACK=external 時不起（自己已經用 node e2e/stack.js 起著）。
// eslint-disable-next-line @typescript-eslint/no-var-requires
const stack = require('./stack');

export default async function globalSetup() {
  if (process.env.E2E_STACK === 'external') return;
  await stack.start();
}
