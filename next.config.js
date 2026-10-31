const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

// Keep builds from replacing chunks served by a running preview.
module.exports = (phase) => ({
  distDir: phase === PHASE_DEVELOPMENT_SERVER ? '.next-dev' : '.next',
});
