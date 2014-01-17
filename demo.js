var supervise = require('./index.js');

var fail = 0;

var job = supervise({
  exec : 'node',
  args : ['server.js']
});

job.on('run', function start(proc) {
  proc.stdout.pipe(process.stdout);
  proc.stderr.pipe(process.stdout);
  console.log("----> job", proc.pid);
});

job.on('die', function fault(code, signal) {
  // stop trapping after 5 failures
  if (++fail > 4) job.retry = null;
  console.log("----> die", fail);
});

job.on('error', function (err) {
  console.log("----> error", err);
});

job.on('end', function () {
  console.log('END');
});
