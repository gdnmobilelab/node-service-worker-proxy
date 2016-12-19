const proxyWorker = require('../src');
const path = require('path');
const log = require('../src/log');
const fetch = require('node-fetch');
const assert = require('assert');
const http = require('http');

log.level("error");

module.exports = {
    "Should forward request to worker and take response": function() {
        return proxyWorker({
            source: path.join(__dirname, 'test-workers'),
            worker: 'fetch-json.js',
            target: 'https://www.example.com/',
            port: 3000,
            maxAge: 60
        })
        .then((server) => {
            return fetch('http://localhost:3000/test')
            .then((res) => {
                return res.json()
                .then((json) => {
                    assert.equal(json.ok, true);
                    assert.equal(json.url, 'https://www.example.com/test')
                    return server.stop();
                })
            })
        })
    },
    "Should allow fetch interception": function() {

        return proxyWorker({
            source: path.join(__dirname, 'test-workers'),
            target: 'https://www.example.com/',
            port: 3000,
            maxAge: 6000,
            worker: 'perform-manual-fetch.js'
        })
        .then((server) => {
            return fetch('http://localhost:3000/test')
            .then((res) => {
                // assert.equal(res.headers.get('cache-control'), 'public, max-age=6')
                return res.text()
                .then((text) => {
                    assert.equal(text, "hello");
                    return server.stop();
                })
            })
        })
    },
    "Should add correct MIME type to local files": function() {

        return proxyWorker({
            source: path.join(__dirname, 'test-workers'),
            target: 'https://www.example.com/',
            port: 3000,
            maxAge: 6000,
            worker: 'pass-to-serve.js'
        })
        .then((server) => {
            return Promise.all([
                fetch('http://localhost:3000/test-response.txt')
                .then((res) => {
                    assert.equal(res.headers.get('content-type'), 'text/plain; charset=UTF-8') 
                }),
                fetch('http://localhost:3000/test.json')
                .then((res) => {
                    assert.equal(res.headers.get('content-type'), 'application/json') 
                }),
                fetch('http://localhost:3000/test.css')
                .then((res) => {
                    assert.equal(res.headers.get('content-type'), 'text/css; charset=UTF-8') 
                }),
                fetch('http://localhost:3000/apple-app-site-association')
                .then((res) => {
                    assert.equal(res.headers.get('content-type'), 'application/json') 
                })
            ])
        })
    }

}