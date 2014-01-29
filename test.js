var assert    = require('assert');
var supervise = require('./index.js');

var fail = 0;

var job = supervise({
  exec : 'node',
  args : ['server.js']
});

// start should only be triggered once
job.start();

var i=0;
job.on('run', function start(proc) {
  // this should be our process
  assert(proc);
  i++;
});

job.on('die', function fault(code, signal) {
  // the test process throws, which produces an exit code of 8
  assert.equal(code, 8);

  // restart 5 times
  if (i<4) return this.start();

  assert(i, 5);
  console.log('ok');
});
