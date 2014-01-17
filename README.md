# Supervise

## Install

```
npm install --save lib-supervise
```

## Usage

```javascript
var supervise = require('lib-supervise');

var job = supervise({
  exec: 'node',
  args: ['server.js']
});

job.on('run', function start(proc) {
  proc.stdout.pipe(process.stdout);
  proc.stderr.pipe(process.stdout);
  console.log("----> job", proc.pid);
});

job.on('die', function fault(code, signal) {
  console.log("----> die", code, signal);
});

job.on('end', function finish() {
  console.log("----> end");
});
```

## Details

1. supervise always creates pipes to the child process,
   so you should do something with them
2. child process error events are caught and send to `job.error`
