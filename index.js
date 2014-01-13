var spawn = require('child_process').spawn;

var PIPE = 'pipe';

function Job(job) {
  this.exec = job.exec;
  this.args = job.args || [];
  this.cwd  = job.cwd  || process.cwd();
  this.envs = job.envs || process.env;
}

Job.prototype._proc = function _proc() {
  var exec = this.exec;
  var args = this.args;
  var opts = {
    cwd   : this.cwd,
    stdio : PIPE
  };
  var proc = spawn(exec, args, opts);

  return proc;
}

// start a process
// this function is actually stateless,
// calling it with two separate event emitters will
// start two disjoint processes
Job.prototype.start = function start(ee) {
  var self = this;
  var proc = this._proc();

  // we need to pass the new process each time one starts
  // people may want to pipe to proc.stdin, etc
  // remember that this happens synchronously
  ee.emit('run', proc);

  // the decision to restart on death or not is delegated
  // the the event emitter. If you want to restart, it's easy:
  // just call job.start(ee) again
  proc.on('exit', function (code, signal) {
    ee.emit('die', code, signal, self);
  });
};

// if the process dies with non-zero exit code,
// wait 100ms and try again to avoid peggin the CPU
function default_retry(code, signal, job) {
  var ee = this;
  if (code!==0) setTimeout(function () {
    job.start(ee);
  }, 100)
  else ee.emit('end');
}

module.exports = function (stanza, option_retry) {
  var retry = option_retry || default_retry;

  module.exports.start(stanza, retry);
}

module.exports.start = function (stanza, retry) {
  var ee  = new (require('events').EventEmitter)();
  var job = new Job(stanza);
  
  ee.on('die', retry);

  // nextTick the start event because the returned
  // event emitter needs to have listeners attached
  // otherwise we're going to miss catching the first process
  process.nextTick(function () {
    job.start(ee);
  });

  return ee;
}

module.exports.Job = Job;
