var events = require('events');
var spawn  = require('child_process').spawn;
var util   = require('util');

var PIPE = 'pipe';

function Job(job) {  
  // super inheritance nonsense
  events.EventEmitter(this);

  this.exec = job.exec;
  this.args = job.args || [];
  this.envs = job.envs || process.env;
  this.cwd  = job.cwd  || process.cwd();
  this.uid  = job.uid  || process.getuid();
  this.gid  = job.gid  || process.getgid();

  this.proc = null;
}

util.inherits(Job, events.EventEmitter);

Job.prototype._proc = function _proc() {
  var exec = this.exec;
  var args = this.args;
  var opts = {
    cwd   : this.cwd,
    uid   : this.uid,
    gid   : this.gid,
    env   : this.envs,
    stdio : PIPE
  };
  var proc = spawn(exec, args, opts);

  return proc;
}

// start monitoring the processes
Job.prototype.start = function start() {
  if (this.proc) return;

  var self = this;
  var proc = this.proc = this._proc();

  // forward errors
  proc.on('error', function (err) {
    self.emit('error', err);
  });

  // we need to pass the new process each time one starts
  // people may want to pipe to proc.stdin, etc
  // remember that this happens synchronously
  self.emit('run', proc);

  // the decision to restart on death or not is delegated
  // the the restart method. If you want to restart, it's easy:
  // just call job.start() again
  // 
  // the restart function is a single function, not an
  // event because you really only want one function handling
  // the restart decisions, adding multiple listeners could be bad
  proc.on('exit', function (code, signal) {
    self.proc = null;
    self.emit('die', code, signal);
  });
};

function start(stanza) {
  var job = new Job(stanza);
  
  // nextTick the start event because the returned
  // event emitter needs to have listeners attached
  // otherwise we're going to miss catching the first process
  process.nextTick(function () {
    job.start();
  });

  return job;
}

module.exports       = start;
module.exports.Job   = Job;
