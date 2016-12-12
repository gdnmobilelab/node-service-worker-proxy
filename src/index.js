const fetchWorker = require('./fetch-worker');
const createWorker = require('./create-worker');
const WorkerServer = require('./worker-server');
const checkForLocalOrigin = require('./local-origin');
const log = require('./log');

module.exports = function(baseArgs) {

    return checkForLocalOrigin(baseArgs)
    .then((args) => {
        return fetchWorker(args)
        .then((contents) => {
            return createWorker(Object.assign(args, {
                contents: contents
            }));
        })
        .then((worker) => {
            let instance = new WorkerServer(worker, args);

            return instance.start(args.port)
            .then(() => {
                return instance;
            })
        })
    })
    .catch((err) => {
        console.error(err);
    })
}
