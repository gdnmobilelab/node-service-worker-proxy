let argv = require('yargs')
    .describe("source", "The local path or remote URL you want to proxy content from")
    .describe("target", "The URL this proxy will run on")
    .describe("worker", "The path (relative to source) of the JS file containing the service worker")
    .describe("scope", "The scope to register the worker under. If not specified, defaults to the directory of the JS file")
    .describe("port", "The port to run the server on")
    .describe("maxAge", "If using a local source, this specifies the max-age header for the responses.")
    .argv;

module.exports = argv;