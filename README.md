# Supervise

## Install

```
npm install --save lib-supervise
```

## Usage

```javascript
var supervise = require('lib-supervise');

var ee = supervise({
  exec: 'node',
  args: ['server.js']
});

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
```
