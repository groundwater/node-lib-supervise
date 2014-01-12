var supervise = require('./index.js');

var EventEmitter = require('events').EventEmitter;

var job = {};

job.exec  = 'sleep';
job.args  = ['1'];

var job = new supervise.Job(job);

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

setTimeout(function () {
  job.trap = false;
},5000);
