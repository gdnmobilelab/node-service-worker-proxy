const http = require('http');
const log = require('./log');
const url = require('url');
const enableDestroy = require('server-destroy');
const {FetchEvent, resolveExtendableEvent, Request} = require('node-service-worker');

module.exports = class WorkerServer {

    constructor(worker, args) {
        this.worker = worker;
        this.args = args;
        this.server = http.createServer(this.handleRequest.bind(this));
        enableDestroy(this.server);
        this.pendingRequests = [];
    }

    handleRequest(req, res) {

        if (!this.worker) {
            log.warn({url: req.url}, "Holding request because we have no current worker");
            pendingRequests.push({req, res});
            return;
        }

        let fullURL = url.resolve(this.args.target, req.url.substr(1))
       
        let fetchRequest = new Request(fullURL, {
            method: req.method,
            headers: req.headers
        })

        let fetchEvent = new FetchEvent(fetchRequest);
        this.worker.dispatchEvent(fetchEvent);

        resolveExtendableEvent(fetchEvent)
        .then((workerResponse) => {
            return workerResponse.buffer()
            .then((buffer) => {
               
                for (let headerKey in workerResponse.headers.raw()) {
                    if (headerKey == "content-encoding") {
                        // already decompressed
                        continue
                    }
                    res.setHeader(headerKey, workerResponse.headers.get(headerKey));
                }

                res.statusCode = workerResponse.status;
                res.end(buffer, null);
            })
            
            
        })
        .catch((err) => {
            res.statusCode = 500;
            this.worker.console.dump()
            log.error({message: err.message}, "Error when sending fetch event to worker")
            // need to work on this part.
            res.end("ERROR");
        })
    }

    clearWorker() {
        this.worker = null;
    }

    setWorker(worker) {
        log.info({pendingRequests: this.pendingRequests.length}, "Received new worker");
        this.worker = worker;

        this.pendingRequests.forEach(({req, res}) => {
            this.handleRequest(req,res);
        })

    }

    start(port) {
        return new Promise((fulfill, reject) => {
            this.server.listen(port, (err) => {
                if (err) {
                    reject(err);
                }
                log.info({port}, "Web server listening for requests.");
                fulfill();
            });
        })
    }

    stop() {
        return new Promise((fulfill, reject) => {
            this.server.destroy((err) => {
                if (err) {
                    reject(err);
                }
                fulfill();
            })
        })
    }

}