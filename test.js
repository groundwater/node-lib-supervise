var assert = require('assert');

var Supervisor = require('./index.js')();
var supervisor = Supervisor.NewFromObject({ exec: process.argv[0], args: ['sleep.js', '5'] });

var i = 0;

supervisor.events.on('start', function (proc) {
  i += 0100;
});
supervisor.events.on('exit', function (code, signal) {
  clearTimeout(kill);
  if (signal !== 'SIGKILL') throw new Error();
  i += 0010;
});

if ( supervisor.start() !== 0) throw new Error();
if ( supervisor.start() === 0) throw new Error();

setTimeout(function () {
  i += 0001;
  supervisor.signal('SIGKILL');
}, 1000);

var kill = setTimeout(function () {
  throw new Error();
}, 2000);

process.on('exit', function () {
  assert.equal(i, 0111);
  console.log('ok');
});
