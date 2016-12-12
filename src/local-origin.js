const http = require('http');
const serveStatic = require('serve-static');
const url = require('url');
const log = require('./log');
const path = require('path');

module.exports = function(args) {

    return Promise.resolve()
    .then(() => {

        let sourceURL = url.parse(args.source);
        
        if (sourceURL.protocol) {
           
            // is remote

            if (args.maxAge) {
                throw new Error("Cannot use maxAge parameter with remote origin");
            }

            return args;
        }

        if (!args.maxAge) {
            throw new Error("Must specify maxAge parameter when using a local origin");
        }

        let fullPath = path.resolve(process.cwd(), args.source);

        log.info({path: fullPath}, "Creating server for local origin.")
        let static = serveStatic(fullPath, {maxAge: args.maxAge});
        
        let server = http.createServer(function(req,res) {
            static(req, res, function() {
                res.statusCode = 404;
                res.end();
            })
        });

        return new Promise((fulfill, reject) => {
            server.listen(0, function(err) {
                if (err) {
                    reject(err);
                }
                fulfill(server);
            });
        })
        .then((server) => {
            
           
            let serverAddress = url.format({
                protocol: "http:",
                hostname: "localhost",
                port: server.address().port
            });

            log.info({newSource: serverAddress}, "Local origin proxy running.");

            return Object.assign({}, args, {
                source: serverAddress
            })
        })


    })
    

}