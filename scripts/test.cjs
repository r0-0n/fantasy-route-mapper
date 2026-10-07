// One test inventory for npm test and release packaging. No external dependencies.
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const suites = [
 'verify.cjs',
 'flows.cjs',
 'binary-backup.cjs',
 'hourly.cjs',
 'routing-access.cjs',
 'city.cjs',
 'map-insights.cjs',
];
for (const suite of suites) {
 execFileSync(process.execPath, [path.join(root, 'tests', suite)], {
  cwd: root,
  stdio: 'inherit',
 });
}
