# node-service-worker-proxy

A proxy server that allows you to send HTTP requests through an instance of
[`node-service-worker`](https://github.com/gdnmobilelab/node-service-worker).

## Why?

While most service worker demos demonstrate using the `fetch` event to return
items in the service worker cache, it can actually construct responses manually.

So, we can use the service worker to manually construct HTTP responses just like
we would with a Node server, complete with whatever templating library we choose.
But the API is entirely different to that of Express or any other Node HTTP server
library, which is where this proxy comes in.

## What works?

Much like node-service-worker, very little right now. But it does succesfully pass
requests through into the worker, and to the `source` if `fetch()` is called from inside
the worker (or we'd get an infinite loop).

It does not (and will not) do things like gzip responses – you should put this behind
Nginx or similar when serving to the public, and setup compression, caching etc. there.

## How do I use it?

After running:

    npm install node-service-worker-proxy

you can call `service-worker-proxy` in any NPM script. Or just manually call:

    node cli.js

with these arguments:

 - `source`: the directory or HTTP server you want to pull content from. For example:
   - `../html-build`
   - `https://proxy-origin.example.com`

   Note: only local directory usage has been tested, but remote should work as well

- `target`: the address this proxy will be serving from (i.e. the URL we will send into
  the worker). Example: `https://www.example.com`.

- `worker`: the relative path (from `source`) of the JS file to load as a worker.
  Example: `sw.js`.

- `scope`: the scope to register the worker under. Just like `navigator.serviceWorker.register`
  in the browser this is optional, and will default to the directory the `worker` is in.

- `maxAge`: if you're using a local source there won't be any HTTP headers to forward - this
  argument lets you specify how long static files should be cached, by default. Accepts an integer
  value millisecond value, or a string parsable by [`ms`](https://www.npmjs.com/package/ms). Examples:
   - `6000` = 6 seconds
   - `60s` = 60 seconds 

in the format of:

    service-worker-proxy --source ../html-build --target https://www.example.com --maxAge 60s

## Using in Docker

I've thrown together a quick Dockerfile that'll let you use this in Docker. You need to specify
the arguments above as `--build-arg`s, as well as make sure your local source directory is in
the current directory. Also, use `sourcelocal` instead of `source` (and you can only specify a local path).

 Example script to assemble:

    cp -r ../html-build ./build-source
    docker build -t gdnmobilelab/app-proxy . --build-arg sourcelocal=./build-source --build-arg target=https://www.example.com --build-arg worker=sw.js --build-arg maxAge="60s"
    rm -rf ./build-source

This could do with some improvement. But it works.

## Tests

Some quick tests are available. Just run:

   npm test

To see the results. Needs a lot more test coverage.