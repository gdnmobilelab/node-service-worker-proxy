const {ServiceWorker, installAndActivate} = require('node-service-worker');
const log = require('./log');
const url = require('url');
const path = require('path');

function getScopeFromWorkerURL(workerURL) {
    let parsedWorkerURL = url.parse(workerURL);
    parsedWorkerURL.pathname = path.dirname(parsedWorkerURL.pathname);
    return url.format(parsedWorkerURL);
}

module.exports = function({contents, target, worker, scope, source}) {

    let scriptURL = url.resolve(target, worker);

    if (!scope) {
        scope = getScopeFromWorkerURL(scriptURL);
        log.warn({scope}, "Scope not provided for worker, defaulting to directory of JS file");
    }

    let targetURL = url.parse(target);
    let sourceURL = url.parse(source);
 
    let workerInstance = new ServiceWorker({
        url: scriptURL,
        scope: scope,
        contents: contents,
        interceptFetch: function(fetchArgs, fetch) {
            
            // can pass either a FetchRequest or a string to fetch()
            let isFetchRequest = fetchArgs[0] instanceof fetch.Request;

            let urlToFetch = null;

            if (isFetchRequest) {
                urlToFetch = fetchArgs[0].url;
            } else {
                urlToFetch = fetchArgs[0];
            }

            log.info({url: urlToFetch}, "Received request");

            let parsedURL = url.parse(urlToFetch);

            // hostname of null means a relative path
            if (parsedURL.hostname === null || parsedURL.hostname === targetURL.hostname) {
                
                
                let newURL = Object.assign({}, sourceURL, {
                    pathname: parsedURL.pathname,
                    query: parsedURL.query
                });

                urlToFetch = url.format(newURL);

                log.info({newURL: urlToFetch}, "Remapping URL to source server");

                if (isFetchRequest) {
                    fetchArgs[0].url = urlToFetch;
                    fetchArgs[0].headers.set("host", newURL.hostname);
                } else {
                    fetchArgs[0] = urlToFetch;
                }
            }

            return fetch(fetchArgs[0], fetchArgs[1]);
        }
    });

    return installAndActivate(workerInstance)
    .then(() => {
        return workerInstance;
    })
}

