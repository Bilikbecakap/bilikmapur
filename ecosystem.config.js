const path = require('path');

module.exports = {
  apps: [{
    name: 'web',
    cwd: path.join(__dirname, 'web'),
    script: path.join(__dirname, 'web', 'node_modules', '.bin', 'next'),
    args: 'start -p 3000',
    env: { NODE_ENV: 'production' },
  }],
};
