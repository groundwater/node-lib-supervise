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
}

util.inherits(Job, events.EventEmitter);

Job.prototype._proc = function _proc() {
  var exec = this.exec;
  var args = this.args;
  var opts = {
    cwd   : this.cwd,
    uid   : this.uid,
    gid   : this.gid,
    stdio : PIPE
  };
  var proc = spawn(exec, args, opts);

  return proc;
}

// start a process
// this function is actually stateless,
// calling it with two separate event emitters will
// start two disjoint processes
Job.prototype.start = function start() {
  var self = this;
  var proc = this._proc();

  // forward errors
  proc.on('error', function (err) {
    self.emit('error', err);
  });

  // we need to pass the new process each time one starts
  // people may want to pipe to proc.stdin, etc
  // remember that this happens synchronously
  self.emit('run', proc);

  // the decision to restart on death or not is delegated
  // the the event emitter. If you want to restart, it's easy:
  // just call job.start() again
  proc.on('exit', function (code, signal) {
    self.emit('die', code, signal);
  });
};

// if the process dies with non-zero exit code,
// wait 100ms and try again to avoid peggin the CPU
function default_retry(code, signal) {
  var ee = this;
  if (code!==0) setTimeout(function () {
    ee.start();
  }, 100)
  else ee.emit('end');
}

function option_start(stanza, option_retry) {
  var retry = option_retry || default_retry;

  return start(stanza, retry);
}

function start(stanza, retry) {
  var job = new Job(stanza);
  
  job.on('die', retry);

  // nextTick the start event because the returned
  // event emitter needs to have listeners attached
  // otherwise we're going to miss catching the first process
  process.nextTick(function () {
    job.start();
  });

  return job;
}

module.exports       = option_start;
module.exports.start = start;
module.exports.Job   = Job;
