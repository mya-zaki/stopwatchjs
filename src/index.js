const stopWatch = (function() {
  "use strict";

  const STATUS_PAUSE = 0;
  const STATUS_RUNNING = 1;

  const stopWatch = function(options) {
    let sw = new stopWatch.prototype.init(options);
    if (sw.getStatus() == STATUS_RUNNING) {
      sw.status = STATUS_PAUSE;
      sw.start();
    }
    return sw;
  };

  // static
  stopWatch.getStatus = function(name) {
    let sw = new stopWatch.prototype.init({
      name: name || null
    });
    return sw.getStatus();
  };
  stopWatch.getCurrent = function(name) {
    let sw = new stopWatch.prototype.init({
      name: name || null
    });
    return sw.getCurrent();
  };
  stopWatch.getTags = function(name) {
    let sw = new stopWatch.prototype.init({
      name: name || null
    });
    return sw.getTags();
  };
  stopWatch.isRunning = function(name) {
    let sw = new stopWatch.prototype.init({
      name: name || null
    });
    return sw.isRunning();
  };
  stopWatch.canUseLocalStorage = function(name) {
    let sw = new stopWatch.prototype.init({
      name: name || null
    });
    return sw.canUseLocalStorage();
  };

  stopWatch.prototype = {
    init: function(options) {
      options = options || {};

      this.timer = null;
      this.gmt = new Date().getTimezoneOffset() / 60;
      this.millisec = 0;
      this.sec100th = 0;
      this.sec = 0;
      this.min = 0;
      this.hour = 0;

      // alarm
      this.timeout = 0;
      this.alarm = null;

      this.name = options.name || "default";
      this.tags = options.tags || [];
      this.interval = options.interval || 10;

      this.render = function() {
        let render = options.render || function() {};
        render(
          this.getStrHour(),
          this.getStrMin(),
          this.getStrSec(),
          this.getStrSec100th()
        );
      };

      this.restore();
    },

    getCurrent: function() {
      return (
        this.hour * 60 * 60 * 1000 +
        this.min * 60 * 1000 +
        this.sec * 1000 +
        this.millisec
      );
    },

    getStatus: function() {
      return this.status;
    },
    isRunning: function() {
      return this.status == STATUS_RUNNING;
    },

    canUseLocalStorage: function() {
      try {
        if ("localStorage" in window && window.localStorage !== null) {
          localStorage.setItem("__sw-test__", "sw-test");
          return true;
        } else {
          console.error("cannot use localStorage");
        }
      } catch (e) {
        console.error(e);
      }
      return false;
    },

    store: function() {
      try {
        localStorage.setItem(
          "sw-" + this.name,
          btoa(
            JSON.stringify({
              startTime: this.startTime,
              current: this.getCurrent(),
              status: this.status,
              tags: this.tags
            })
          )
        );
      } catch (e) {
        console.error(e);
      }
    },
    restore: function() {
      let itemtext;
      let item = {};

      try {
        itemtext = localStorage.getItem("sw-" + this.name);
      } catch (e) {
        console.error(e);
      }

      if (itemtext) {
        try {
          item = JSON.parse(atob(itemtext));
        } catch (e) {
          console.error(e);
        }
      }
      this.status = item.status || STATUS_PAUSE;
      if (this.tags.length == 0) {
        this.tags = item.tags || [];
      }
      if (this.status == STATUS_RUNNING) {
        this.startTime = item.startTime || new Date().getTime();
        if (isNaN(this.startTime)) {
          this.startTime = new Date().getTime();
        }
      } else {
        let current = item.current || 0;
        if (isNaN(current)) {
          current = 0;
        }
        this.startTime = new Date().getTime() - current;
      }
      this.run();
    },
    delete: function() {
      try {
        localStorage.removeItem("sw-" + this.name);
      } catch (e) {
        console.error(e);
      }
    },
    getTags: function() {
      return this.tags;
    },

    run: function() {
      let difftime = new Date().getTime() - this.startTime;

      this.millisec = difftime % 1000;
      this.sec100th = Math.floor(this.millisec / 10);
      this.sec = Math.floor(difftime / 1000) % 60;
      this.min = Math.floor(difftime / 1000 / 60) % 60;
      this.hour = Math.floor(difftime / 1000 / 60 / 60) % 60;

      this.render.call(this);

      if (
        this.timeout > 0 &&
        typeof this.alarm === "function" &&
        difftime >= this.timeout
      ) {
        this.alarm.call();
        this.stop();
        this.reset();
      }
    },

    start: function() {
      if (this.status == STATUS_RUNNING) {
        return;
      }
      this.status = STATUS_RUNNING;
      this.timer = setInterval(this.run.bind(this), this.interval);
      this.startTime = new Date().getTime() - this.getCurrent();
      this.store();
    },

    stop: function() {
      clearInterval(this.timer);
      this.status = STATUS_PAUSE;
      this.render.call(this);
      this.store();
    },

    reset: function() {
      if (this.status == STATUS_RUNNING) {
        return;
      }
      this.timer = null;
      this.startTime = null;
      this.millisec = 0;
      this.sec100th = 0;
      this.sec = 0;
      this.min = 0;
      this.hour = 0;

      this.render.call(this);
      this.delete();
    },

    setTimer: function(timeout, callback) {
      this.timeout = timeout;
      this.alarm = callback;
      this.start();
    },

    getHour: function() {
      return this.hour;
    },
    getMin: function() {
      return this.min;
    },

    getStartTime: function() {
      return this.startTime;
    },

    getStrHour: function() {
      let strHour = this.hour.toString();
      if (strHour.length < 2) {
        strHour = "0" + strHour;
      }
      return strHour;
    },
    getStrMin: function() {
      let strMin = this.min.toString();
      if (strMin.length < 2) {
        strMin = "0" + strMin;
      }
      return strMin;
    },
    getStrSec: function() {
      let strSec = this.sec.toString();
      if (strSec.length < 2) {
        strSec = "0" + strSec;
      }
      return strSec;
    },
    getStrSec100th: function() {
      let strSec100th = this.sec100th.toString();
      if (strSec100th.length < 2) {
        strSec100th = "0" + strSec100th;
      }
      return strSec100th;
    }
  };

  stopWatch.prototype.init.prototype = stopWatch.prototype;

  return stopWatch;
})();

export default stopWatch;
