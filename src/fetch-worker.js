const fetch = require('node-fetch');
const fs = require('fs-promise');
const path = require('path');
const url = require('url');

module.exports = function({source, worker}) {
    return Promise.resolve()
    .then(() => {

        let workerURL = url.resolve(source, worker);
        return fetch(workerURL)
        .then((res) => res.text())

    })
    

}