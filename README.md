# Supervise

## Install

```
npm install --save lib-supervise
```

## Usage

```javascript
var supervise = require('lib-supervise');

var EventEmitter = require('events').EventEmitter;

var job = {};

job.exec  = 'node';
job.args  = ['server.js'];
job.cwd   = '/app/';
job.envs  = {
  DATABASE_URL: 'mysql://localhost:3306'
};

var job = supervise(job);

var ee  = new EventEmitter();

ee.on('run', function start(proc) {
  proc.stdout.pipe(process.stdout);
  proc.stderr.pipe(process.stdout);
  console.log("----> job", proc.pid);
});

ee.on('die', function fault(code, signal) {
  console.log("----> die", code, signal);
});

ee.on('end', function finish() {
  console.log("----> end");
});

job.start(ee);
```
