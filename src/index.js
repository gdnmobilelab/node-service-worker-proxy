const fetchWorker = require('./fetch-worker');
const createWorker = require('./create-worker');
const WorkerServer = require('./worker-server');
const checkForLocalOrigin = require('./local-origin');
const log = require('./log');
const fs = require('fs');
const path = require('path');

class ServiceWorkerProxy {

    constructor(baseArgs) {
        this.baseArgs = baseArgs;
    }

    transformArgs() {
        return checkForLocalOrigin(this.baseArgs)
        .then((args) => {
            this.args = args;
        })
    }

    start() {
        return this.transformArgs()
        .then(() => {
            return this.createWorker()
        })
        .then(() => {
            return this.createServer()
        })
        .then(() => {
            if (this.args.watch) {
                return this.watchForChanges();
            }
        })
    }

    createWorker() {
        return fetchWorker(this.args)
        .then((contents) => {
            return createWorker(Object.assign(this.args, {
                contents: contents
            }));
        })
        .then((worker) => {
            this.currentWorker = worker;
        })
    }

    createServer() {
        let instance = new WorkerServer(this.currentWorker, this.args);

        return instance.start(this.args.port)
        .then(() => {
            this.server = instance;
        })
    }

    watchForChanges() {
        let fileToWatch = path.join(this.baseArgs.source, this.baseArgs.worker);
        log.info({watching: fileToWatch}, "Watching service worker file for changes...");
        fs.watchFile(fileToWatch, {interval: 200}, (event) => {
            log.info("Service worker file changed - updating server");

            this.server.clearWorker();
            this.createWorker()
            .then(() => {
                this.server.setWorker(this.currentWorker);
            })
        })
    }
}

module.exports = function(baseArgs) {

    let proxy = new ServiceWorkerProxy(baseArgs)

    return proxy.start()
    .then(() => {
        return proxy.server;
    })

}
