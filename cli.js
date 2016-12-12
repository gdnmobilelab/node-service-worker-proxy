const argv = require('./yargs');
const workerProxy = require('./src');

workerProxy(argv);