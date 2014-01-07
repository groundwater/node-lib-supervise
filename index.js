var spawn = require('child_process').spawn;

var PIPE = 'pipe';

function Job(job) {
  this._exec = job.exec;
  this._args = job.args || [];
  this._cwd  = job.cwd  || process.cwd();
  this._envs = job.envs || process.env;
  
  // trap is a public property
  // the default restart behavior will only restart
  // if this.trap is true
  this.trap = true;
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

// code == 0, success
// code != 0, failure
Job.prototype.restart = function (cb) {
  cb(this.trap);
}

// start a process that will be restarted if it dies
Job.prototype.start = function start(ee) {
  var self = this;
  var proc = this._proc();

  // either restart the process, or emit an end event 
  // once the end event is emitted, the process no
  // longer restart or runs
  function retry(ok) {
    if (ok) {
      self.start(ee);
    } else {
      ee.emit('end');
    }
  };

  // we need to pass the new process each time one starts
  // people may want to pipe to proc.stdin, etc
  // remember that this happens synchronously
  ee.emit('run', proc);

  // on exit, we need to decide about restarting or quitting
  // the restart logic is entirely governed by this.restart
  // users can feel free to replace this.restart as they like
  proc.on('exit', function (code, signal) {
    ee.emit('die', code, signal);

    self.restart(retry);
  });
};

module.exports = function (job) {
  return new Job(job);
}
