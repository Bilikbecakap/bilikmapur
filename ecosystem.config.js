const path = require('path');

module.exports = {
  apps: [{
    name: 'web',
    cwd: path.join(__dirname, 'web'),
    script: 'node',
    args: 'node_modules/next/dist/bin/next start -p 3001',
    env: { NODE_ENV: 'production' },
  }],
};
