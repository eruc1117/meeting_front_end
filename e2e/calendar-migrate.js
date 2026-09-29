// 由 stack.js 以子程序執行：建 Schedule_test（不存在時）並 migration 到最新。cwd 必須是 meeting_API_Server。
require(require('path').join(process.cwd(), 'tests', 'global-setup'))()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });
