var supervise = require('./index.js');

var fail = 0;

var ee = supervise({
  exec : 'node',
  args : ['server.js']
});

ee.on('run', function start(proc) {
  proc.stdout.pipe(process.stdout);
  proc.stderr.pipe(process.stdout);
  console.log("----> job", proc.pid);
});

ee.on('die', function fault(code, signal) {
  // stop trapping after 5 failures
  if (++fail > 4) ee.retry = null;
  console.log("----> die", fail);
});

ee.on('error', function (err) {
  console.log("----> error", err);
});

ee.on('end', function () {
  console.log('END');
});
