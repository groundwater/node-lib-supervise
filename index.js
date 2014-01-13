var spawn = require('child_process').spawn;

var PIPE = 'pipe';

function Job(job) {
  this._exec = job.exec;
  this._args = job.args || [];
  this._cwd  = job.cwd  || process.cwd();
  this._envs = job.envs || process.env;
}

Job.prototype._proc = function _proc() {
  var exec = this._exec;
  var args = this._args;
  var opts = {
    cwd   : this._cwd,
    stdio : PIPE
  };
  var proc = spawn(exec, args, opts);

  return proc;
}

// start a process that will be restarted if it dies
Job.prototype.start = function start(ee) {
  var self = this;
  var proc = this._proc();

  // we need to pass the new process each time one starts
  // people may want to pipe to proc.stdin, etc
  // remember that this happens synchronously
  ee.emit('run', proc);

  // on exit, we need to decide about restarting or quitting
  // the restart logic is entirely governed by this.restart
  // users can feel free to replace this.restart as they like
  proc.on('exit', function (code, signal) {
    ee.emit('die', code, signal, self);
  });
};

function default_retry(code, signal, job) {
  var ee = this;
  if (code!==0) setTimeout(function () {
    job.start(ee);
  }, 100)
  else ee.emit('end');
}

module.exports = function (stanza, retry) {
  var ee  = new (require('events').EventEmitter)();
  var job = new Job(stanza);
  
  ee.on('die', retry || default_retry);
  process.nextTick(function () {
    job.start(ee);
  });

  return ee;
}
module.exports.Job = Job;
