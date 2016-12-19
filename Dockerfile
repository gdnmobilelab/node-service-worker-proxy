FROM mhart/alpine-node:6

ARG target
ARG scope
ARG worker
ARG maxAge
ARG sourcelocal 

ADD src src
ADD package.json .
ADD cli.js .
ADD yargs.js .
RUN mkdir -p source
ADD $sourcelocal ./source

RUN NODE_ENV=production npm install

ENV target $target
ENV worker $worker
ENV maxAge $maxAge

EXPOSE 3000

CMD node cli.js --source ./source --target $target --worker $worker --maxAge $maxAge --port 3000