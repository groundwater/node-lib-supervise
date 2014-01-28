var assert    = require('assert');
var supervise = require('./index.js');

var fail = 0;

var job = supervise({
  exec : 'node',
  args : ['server.js']
});

// start should only be triggered once
job.start();

job.on('run', function start(proc) {
  // this should be our process
  assert(proc);
});

job.on('die', function fault(code, signal) {
  // stop trapping after 5 failures
  if (++fail > 4) job.retry = null;

  // the test process throws, which produces an exit code of 8
  assert.equal(code, 8);
});

job.on('end', function () {
  // we should have run 5 times
  assert.equal(fail, 5);
  console.log('ok');
});
