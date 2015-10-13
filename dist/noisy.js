(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

exports.__esModule = true;
var createTree = function createTree(target, active, id) {
    var root = document.querySelector(target),
        dom = {},
        docFrag = document.createDocumentFragment(),
        display = active ? '' : ' hidden';
    dom.container = newNode("div", docFrag, {
        id: "nsycontainer" + id,
        'class': "video-container" + display
    });
    dom.video = newNode("video", dom.container, {
        id: "nsyvideo" + id,
        'class': "video"
    });
    dom.timeleft = newNode("div", dom.container, {
        id: "nsytimeleft" + id,
        'class': "video-timeleft"
    });
    dom.timeleftvalue = newNode("p", dom.timeleft, {
        id: "nsytimeleftinner" + id
    });
    dom.visit = newNode("div", dom.container, {
        id: "nsyvisit/" + id,
        'class': "video-visit"
    });
    dom.visitvalue = newNode("p", dom.visit, {
        id: "nsytimeleftinner" + id
    });
    dom.controls = newNode("div", dom.container, {
        id: "nsycontrols" + id,
        'class': "video-control-bar"
    });
    dom.play = newNode("button", dom.controls, {
        id: "nsyplay" + id,
        'class': "play-control video-control",
        tabindex: "0",
        role: "button",
        type: "button",
        'aria-live': "polite"
    });
    dom.mute = newNode("button", dom.controls, {
        id: "nsymute" + id,
        'class': "sound-control video-control low",
        tabindex: "0",
        role: "button",
        type: "button",
        'aria-live': "polite"
    });

    dom.volume = newNode("input", dom.controls, {
        id: "nsyvolume" + id,
        'class': "input-range video-control volume-bar",
        'type': "range",
        'value': "0",
        'min': "0",
        'max': "100"
    });
    dom.progress = newNode("input", dom.controls, {
        id: "nsyprogress" + id,
        'class': "input-range video-control seek-bar",
        'type': "range",
        'value': "0",
        'min': "0",
        'max': "100"
    });
    dom.fullScreen = newNode("button", dom.controls, {
        id: "fullScreen" + id,
        'class': "fullScreen-control video-control",
        tabindex: "0",
        role: "button",
        type: "button",
        'aria-live': "polite"
    });

    root.appendChild(docFrag);
    return dom;
};

var newNode = function newNode() {
    var type = arguments.length <= 0 || arguments[0] === undefined ? "div" : arguments[0];
    var target = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
    var opts = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
    var evts = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

    var element = document.createElement(type);
    if (opts !== null) {
        for (var key in opts) {
            if (opts.hasOwnProperty(key)) {
                element.setAttribute(key, opts[key]);
            }
        }
    }
    target.appendChild(element);
    if (evts && evts.length) {
        for (var key in evts) {
            element.addEventListener(key, evts[key]);
        }
    }
    return element;
};
exports.createTree = createTree;

},{}],2:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utils = require('./utils');

var _dom = require('./dom');

var Noisy = (function () {
    function Noisy() {
        var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, Noisy);

        this.bootstrap(opts);
        this.events();
        this.binder();
        this.create();
    }

    Noisy.prototype.bootstrap = function bootstrap(opts) {
        this.id = _utils.randomizer();
        var defaultOpts = {
            playElement: '#play_' + this.id,
            pauseElement: '#pause_' + this.id,
            seekElement: '#seek_' + this.id,
            playerElement: '#player_' + this.id,
            targetElement: null,
            width: 640,
            height: 360,
            type: 'video'

        };
        this.options = _utils.checkOpts(defaultOpts, opts);
        if (this.options.targetElement === null) {
            throw 'you should provide a target where the player will be inserted';
        }
        this.ready = this.id;
        this.players = [];
        this.active = false;
        this.whole = true;
        this.queue = [];
        this.behaving = true;
        this.robbing = false;
        this.playing = false;
        this.seeking = false;
    };

    Noisy.prototype.create = function create() {
        this.players[0] = new Agastopia(this, 0, true);
        this.players[1] = new Agastopia(this, 1, false);
        this.active = 0;
    };

    Noisy.prototype.events = function events() {
        this.evt = {
            play: [],
            pause: [],
            ended: [],
            seek: [],
            time: [],
            timePrecise: [],
            duration: [],
            mute: [],
            volume: [],
            fullscreen: []
        };
    };

    Noisy.prototype.binder = function binder() {
        var self = this;
        this.on('volume', function (vol) {
            self.reflect().volume(vol);
        });
        this.on('ended', function () {
            if (self.delegate().playing && self.reflect().mounted) {
                self.toggle();
                self.reflect().dom.video.src = '';
                self.delegate().play();
            } else {
                self.delegate().dom.video.src = '';
                self.delegate().pause();
                this.active = false;
            }
            self.handleQueue();
        });
    };

    Noisy.prototype.toggle = function toggle() {
        this.delegate().toggle();
        this.reflect().toggle();
        this.active = this.next();
    };

    Noisy.prototype.trigger = function trigger(ref, event, opts) {
        // prevent inactive player from bubbling...
        if (this.evt.hasOwnProperty(event) && ref === this.active) {
            this.evt[event].forEach(function (e) {
                return e(opts);
            });
        }
    };

    Noisy.prototype.on = function on(event, opts) {
        if (this.evt.hasOwnProperty(event) && typeof opts === 'function') {
            this.evt[event].forEach(function (i) {
                if (i == opts) {
                    console.log('doubling');
                }
            });
            this.evt[event].push(opts);
        } else {
            throw event + ' failed to register';
        }
    };

    Noisy.prototype.delegate = function delegate() {
        return this.players[this.active];
    };

    Noisy.prototype.reflect = function reflect() {
        return this.players[this.next()];
    };

    Noisy.prototype.next = function next() {
        return (this.active + 1) % this.players.length;
    };

    Noisy.prototype.play = function play() {
        this.delegate().play();
    };

    Noisy.prototype.pause = function pause() {
        this.delegate().pause();
    };

    Noisy.prototype.mute = function mute() {
        this.delegate().mute();
    };

    Noisy.prototype.volume = function volume(vol) {
        this.delegate().volume(vol);
    };

    Noisy.prototype.dictate = function dictate(prop, value) {
        for (i = this.players.length - 1; i >= 0; i--) {
            this.players[i][prop] = value;
        }
    };

    Noisy.prototype.mount = function mount() {
        var playlist = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

        // need to add some serious checks here
        if (playlist === null) {
            throw 'cannot mount an empty playlist';
        }
        for (var _iterator = playlist, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
            var _ref;

            if (_isArray) {
                if (_i >= _iterator.length) break;
                _ref = _iterator[_i++];
            } else {
                _i = _iterator.next();
                if (_i.done) break;
                _ref = _i.value;
            }

            var _i2 = _ref;

            this.queue.push(_i2);
        }
        this.handleQueue();
    };

    Noisy.prototype.handleQueue = function handleQueue() {
        if (this.queue.length < 1) {
            return;
        }
        if (!this.delegate().playing) {
            this.delegate().mount(this.queue.shift());
            this.delegate().play();
        } else if (!this.reflect().mounted) {
            this.reflect().mount(this.queue.shift());
        } else {
            return;
        }
        this.handleQueue();
    };

    return Noisy;
})();

var Agastopia = (function () {
    function Agastopia(parent, ref, active) {
        _classCallCheck(this, Agastopia);

        this.id = _utils.randomizer();
        this.ref = ref;
        this.parent = parent;
        this.active = active;
        this.playing = false;
        this.mounted = false;
        this.behaving = true;
        this.robbing = false;
        this.target = parent.options.targetElement;
        this.dom = null;
        this.lastTime = 0;
        this.create(this.target);
        this.binder();
    }

    Agastopia.prototype.create = function create() {
        this.dom = _dom.createTree(this.target, this.active, this.id);
    };

    Agastopia.prototype.shout = function shout(event, value) {
        this.parent.trigger(this.ref, event, value);
    };

    Agastopia.prototype.binder = function binder() {
        var self = this,
            dom = self.dom,
            // decompose...
        video = dom.video; // dedecompose...

        video.onended = function () {
            self.endedEvent();
        };
        video.ontimeupdate = function () {
            self.time();
        };
        dom.video.onvolumechange = function () {
            self.volumeEvent();
        };

        video.ondurationchange = function () {
            self.durationEvent();
        };
        dom.play.addEventListener('click', function () {
            if (self.playing) {
                self.pause();
            } else {
                self.play();
            }
        });
        dom.progress.addEventListener('change', function () {
            video.currentTime = dom.progress.value / 100;
        });
        dom.progress.addEventListener('mousedown', function () {
            self.isSeeking = true;
        });
        dom.progress.addEventListener('mouseup', function () {
            self.isSeeking = false;
        });
        dom.volume.addEventListener('change', function () {
            self.volume(dom.volume.value / 100);
        });
        dom.mute.addEventListener('click', function () {
            video.muted = !video.muted;
            if (video.muted) {
                dom.mute.className = "sound-control video-control muted";
            } else {
                self.updateVolumeIcon();
            }
        });
        dom.fullScreen.addEventListener('click', function () {
            self.toggleFullScreen();
        });
        self.volumeEvent();
    };

    Agastopia.prototype.updateVolumeIcon = function updateVolumeIcon() {
        if (this.dom.video.volume > 0.66) {
            this.dom.mute.className = "sound-control video-control high";
        } else if (this.dom.video.volume > 0.33) {
            this.dom.mute.className = "sound-control video-control mid";
        } else if (this.dom.video.volume > 0) {
            this.dom.mute.className = "sound-control video-control low";
        } else {
            this.dom.mute.className = "sound-control video-control muted";
        }
    };

    Agastopia.prototype.toggleFullScreen = function toggleFullScreen() {
        if (this.dom.video && // alternative standard method
        !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
            // current working methods
            if (this.dom.video.requestFullscreen) {
                this.dom.video.requestFullscreen();
            } else if (this.dom.video.msRequestFullscreen) {
                this.dom.video.msRequestFullscreen();
            } else if (this.dom.video.mozRequestFullScreen) {
                this.dom.video.mozRequestFullScreen();
            } else if (this.dom.video.webkitRequestFullscreen) {
                this.dom.video.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    };

    Agastopia.prototype.endedEvent = function endedEvent(ref) {
        if (this.media.hasOwnProperty('after') && typeof this.media.after === 'function') {
            this.media.after();
        }
        this.mounted = false;
        this.shout('ended');
        this.dom.play.className = 'play-control video-control';
        this.playing = false;
    };

    Agastopia.prototype.play = function play() {
        var _this = this;

        if (this.dom.video.src === '') {
            return;
        }
        if (this.media.hasOwnProperty('before') && typeof this.media.before === 'function') {
            this.media.before();
        }
        this.parent.playing = true;
        this.playing = true;
        setTimeout(function () {
            _this.dom.play.className = 'play-control video-control playing';
            _this.dom.video.play();
            _this.durationEvent();
        }, 50);
    };

    Agastopia.prototype.time = function time() {
        if (Math.floor(this.dom.video.currentTime) === this.lastTime) {
            this.preciseTimeEvent();
        } else {
            this.shout('time', Math.floor(this.dom.video.currentTime));
            this.lastTime = Math.floor(this.dom.video.currentTime);
            this.dom.timeleftvalue.innerHTML = Math.floor(this.dom.video.duration - this.dom.video.currentTime) + " secs.";
        }
        if (!this.isSeeking) {
            this.dom.progress.value = Math.floor(this.dom.video.currentTime * 100);
        }
    };

    Agastopia.prototype.preciseTimeEvent = function preciseTimeEvent() {
        this.shout('timePrecise', this.dom.video.currentTime);
    };

    Agastopia.prototype.durationEvent = function durationEvent() {
        this.shout('duration', this.dom.video.duration);
        this.dom.progress.max = Math.floor(this.dom.video.duration * 100);
        this.dom.timeleftvalue.innerHTML = Math.floor(this.dom.video.duration - this.dom.video.currentTime) + " secs.";
    };

    Agastopia.prototype.pause = function pause() {
        this.dom.play.className = 'play-control video-control';
        this.playing = false;
        this.dom.video.pause();
    };

    Agastopia.prototype.volume = function volume(vol) {
        if (parseInt(vol) < 1) {
            this.dom.volume.value = vol * 100;
            this.dom.video.volume = vol;
            this.updateVolumeIcon();
        }
    };

    Agastopia.prototype.volumeEvent = function volumeEvent() {
        this.shout('volume', this.dom.video.volume);
        this.dom.volume.value = this.dom.video.volume * 100;
        this.updateVolumeIcon();
    };

    Agastopia.prototype.mount = function mount(obj) {
        if (this.dom.video.src && !obj.src || this.dom.video.src === obj.src) {
            return false;
        }
        this.media = obj;
        if (this.media.hasOwnProperty('ads') && this.media.ads !== null) {
            this.dom.controls.className = "video-control-bar hidden";
            this.dom.timeleft.className = "video-timeleft video-has-ads";
            this.dom.visit.className = "video-visit video-has-ads";
            this.dom.visit.innerHTML = '<a href="' + this.media.ads.clickthrough + '" target="_blank">Visiter</a>';
        } else {
            this.dom.controls.className = "video-control-bar";
            this.dom.timeleft.className = "video-timeleft";
            this.dom.visit.className = "video-visit";
        }
        this.mounted = true;
        this.dom.video.src = this.media.src;
        this.dom.video.currentTime = 0;
    };

    Agastopia.prototype.show = function show() {
        this.active = true;
        this.dom.container.className = "video-container";
    };

    Agastopia.prototype.hide = function hide() {
        this.active = false;
        this.dom.container.className = "video-container hidden";
    };

    Agastopia.prototype.toggle = function toggle() {
        this.active = !this.active;
        var hidden = this.active ? "" : " hidden";
        this.dom.container.className = "video-container" + hidden;
    };

    return Agastopia;
})();

exports['default'] = Noisy;

window.Noisy = Noisy;
module.exports = exports['default'];

},{"./dom":1,"./utils":3}],3:[function(require,module,exports){
'use strict';

exports.__esModule = true;
var checkOpts = function checkOpts(defaults, options) {
    for (var key in options) {
        if (defaults.hasOwnProperty(key)) {
            if (checkTag(key, options[key])) {
                defaults[key] = options[key];
            }
        } else {
            throw key + " is not a supported option...";
        }
    }
    return defaults;
};

var checkTag = function checkTag(key, tag) {
    // Si le nom ne contient pas "Element", ne pas vérifier sa présence dans le DOM.
    if (key.indexOf('Element') < 0) {
        return true;
    };
    if (getTag(tag)) {
        return true;
    };
    throw tag + ' is not present in your DOM';
};

var getTag = function getTag(tag) {
    return tag === null ? null : document.querySelector(tag);
};

var randomizer = function randomizer() {
    return "nsy" + Math.random().toString(36).substring(7);
};

var setElement = function setElement() {
    var type = arguments.length <= 0 || arguments[0] === undefined ? "div" : arguments[0];
    var opts = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    var element = document.createElement(type);
    if (opts === null) {
        return element;
    }
    for (var key in opts) {
        if (opts.hasOwnProperty(key)) {
            element.setAttribute(key, opts[key]);
        }
    }
    return element;
};

var poster = function poster() {
    return "data:image/png;base64,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";
};

exports.checkOpts = checkOpts;
exports.randomizer = randomizer;
exports.getTag = getTag;
exports.poster = poster;

},{}]},{},[2]);
