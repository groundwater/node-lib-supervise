var assert = require('assert');

function Supervisor(Launcher) {

  this._Launcher = Launcher;

  // Supervisor
  this.launcher = null;

  // Process
  this.current  = null;

  // EventEmitter
  this.events   = null;
}

Supervisor.prototype.ERROR = {
  EXISTS: 0100
};

Supervisor.prototype.start = function () {
  var err = 0;
  if (this.current) {
    err = this.ERROR.EXISTS;
  } else {
    this.current = this.launcher.start();
    this.events.emit('start', this.current);
  }
  return err;
};

Supervisor.prototype.SIGNAL = {
  KILL: 'SIGKILL',
  QUIT: 'SIGQUIT'
};

Supervisor.prototype.stop = function () {
  this.current.kill(this.SIGNAL.QUIT);
};

Supervisor.prototype.kill = function () {
  this.current.kill(this.SIGNAL.KILL);
};

Supervisor.NewEmpty = function () {
  return new Supervisor(this.Launcher);
};

Supervisor.NewWithEmitter = function (ee) {
  var supervisor = this.NewEmpty();
  supervisor.events = ee;
  return supervisor;
};

Supervisor.NewFromObject = function (obj) {
  var supervisor    = this.New();
  var launch = this.Launcher.NewFromObject(obj);
  
  // bubble events
  launch.events.on('exit', function (code, signal) {
    supervisor.events.emit('exit', code, signal);
  });
  launch.events.on('error', function (err) {
    supervisor.events.emit('error', err);
  });

  supervisor.launcher = launch;

  return supervisor;
};

Supervisor.New = function () {
  return this.NewWithEmitter(this.emitter());
};

// custom injector
function inject(deps) {
  // assert dependencies
  assert(deps.Launcher, 'Launcher dependency required');

  return Object.create(Supervisor, deps);
};

// default injector
function defaults() {
  var EventEmitter = require('events').EventEmitter;
  var launcher     = require('lib-launcher');
  var deps  = {
    Launcher: {
      value: launcher()
    },
    emitter: {
      value: function () {
        return new EventEmitter();
      }
    }
  }
  return inject(deps);
};

// module method
function INIT(deps) {
  if (typeof deps === 'object') return inject(deps);
  else if (deps === undefined)  return defaults();
  else                          throw new Error('bad dependency injection');
};

INIT.inject      = inject;
INIT.defaults    = defaults;
INIT.Supervisor  = Supervisor;

module.exports   = INIT;
