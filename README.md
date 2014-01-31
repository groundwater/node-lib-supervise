# Supervise

## Install

```
npm install --save lib-supervise
```

## Usage

```javascript
var Supervisor = require('lib-supervisor')();
var supervisor = Supervisor.NewFromObject({ 
  exec : 'ls'
});

supervisor.events.on('start', function (proc) {
  // new proccess started
});

supervisor.events.on('exit', function (code, signal) {
  // current process exited

  // restart
  supervisor.start();
});

supervisor.start();
```
