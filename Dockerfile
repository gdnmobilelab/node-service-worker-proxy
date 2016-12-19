FROM mhart/alpine-node:base-6

ARG target
ARG scope
ARG worker
ARG maxAge
ARG sourcelocal 

ADD src src
ADD package.json .
ADD cli.js .
ADD yargs.js .
ADD builds/yarn-0.18.1.js ./yarn.js
ADD yarn.lock .
ADD $sourcelocal ./source

RUN node ./yarn.js install --production

ENV target $target
ENV worker $worker
ENV maxAge $maxAge

EXPOSE 3000

CMD node cli.js --source ./source --target $target --worker $worker --maxAge $maxAge --port 3000