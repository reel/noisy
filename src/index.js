import {
    checkOpts,
    randomizer,
    getTag,
    poster,
    setElement
}
from './utils';

import {
    createTree
}
from './dom'

class Noisy {
    constructor(opts = {}) {
        this.bootstrap(opts);
        this.events();
        this.binder();
        this.create();
    };
    bootstrap(opts) {
        this.id = randomizer();
        const defaultOpts = {
            playElement: '#play_' + this.id,
            pauseElement: '#pause_' + this.id,
            seekElement: '#seek_' + this.id,
            playerElement: '#player_' + this.id,
            targetElement: null,
            width: 640,
            height: 360,
            type: 'video'

        }
        this.options = checkOpts(defaultOpts, opts);
        if (this.options.targetElement === null) {
            throw 'you should provide a target where the player will be inserted';
        }
        this.ready = this.id;
        this.players = [];
        this.active = null;
        this.whole = true;
        this.queue = [];
        this.behaving = true;
        this.robbing = false;
        this.playing = false;
        this.seeking = false;
    };
    create() {
        this.players[0] = new Agastopia(this, 0, true);
        this.players[1] = new Agastopia(this, 1, false);
        this.active = 0;
    };
    events() {
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
        }
    }
    binder() {
        let self = this;
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
            }
            self.handleQueue();
        })

    }
    toggle() {
        this.delegate().toggle();
        this.reflect().toggle();
        this.active = this.next();
    }
    trigger(ref, event, opts) {
        // prevent inactive player from bubbling...
        if (this.evt.hasOwnProperty(event) && ref === this.active) {
            this.evt[event].forEach((e) => (e)(opts));
        }
    };
    on(event, opts) {
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
    }
    delegate() {
        return this.players[this.active];
    }
    reflect() {
        return this.players[this.next()];
    }
    next() {
        return (this.active + 1) % this.players.length;
    }
    play() {
        this.handleQueue();
    }
    pause() {
        this.delegate().play();
    }
    mute() {
        this.delegate().mute();
    }
    volume(vol) {
        this.delegate().volume(vol);
    }
    dictate(prop, value) {
        for (i = this.players.length - 1; i >= 0; i--) {
            this.players[i][prop] = value;
        }
    }
    mount(playlist = null) {
        // need to add some serious checks here
        if (playlist === null) {
            throw 'cannot mount an empty playlist';
        }
        for (let i of playlist) {
            this.queue.push(i);
        }
        this.handleQueue();
    }
    handleQueue() {
        if (this.queue.length < 1) {
            return;
        }
        if (!this.delegate().playing) {
            this.delegate().mount(this.queue.shift());
            this.delegate().play();
        } else if (!this.reflect().mounted){
            this.reflect().mount(this.queue.shift());
        } else {
            return;
        }
        this.handleQueue();
    }
}

class Agastopia {
    constructor(parent, ref, active) {
        this.id = randomizer();
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
    create() {
        this.dom = createTree(this.target, this.active, this.id);
    }
    shout(event, value) {
        this.parent.trigger(this.ref, event, value);
    }
    binder() {
        let self = this,
            dom = self.dom, // decompose...
            video = dom.video; // dedecompose...

        video.onended = function() {
            self.endedEvent();
        };
        video.ontimeupdate = function() {
            self.time();
        };
        dom.video.onvolumechange = function() {
            self.volumeEvent();
        };

        video.ondurationchange = function() {
            self.durationEvent();
        };
        dom.play.addEventListener('click', function() {
            if (self.playing) {
                self.pause()
            } else {
                self.play();
            }
        });
        dom.progress.addEventListener('change', function() {
            video.currentTime = dom.progress.value / 100;
        });
        dom.progress.addEventListener('mousedown', function() {
            self.isSeeking = true
        });
        dom.progress.addEventListener('mouseup', function() {
            self.isSeeking = false;
        });
        dom.volume.addEventListener('change', function() {
            self.volume(dom.volume.value / 100);
        });
        dom.mute.addEventListener('click', function() {
            video.muted = !video.muted;
            if (video.muted) {
                dom.mute.className = "sound-control video-control muted";
            } else {
                self.updateVolumeIcon();
            }
        });
        dom.fullScreen.addEventListener('click', function() {
            self.toggleFullScreen();
        });
        self.volumeEvent();

    }
    updateVolumeIcon() {
        if (this.dom.video.volume > 0.66) {
            this.dom.mute.className = "sound-control video-control high";
        } else if (this.dom.video.volume > 0.33) {
            this.dom.mute.className = "sound-control video-control mid";
        } else if (this.dom.video.volume > 0) {
            this.dom.mute.className = "sound-control video-control low";
        } else {
            this.dom.mute.className = "sound-control video-control muted";
        }
    }
    toggleFullScreen() {
        if (this.dom.video && // alternative standard method
            !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) { // current working methods
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
    }
    endedEvent(ref) {
        this.mounted = false;
        this.shout('ended');
        this.dom.play.className = 'play-control video-control';
        this.playing = false;
    }
    play() {
        if (this.dom.video.src === '') {
            return;
        }
        this.playing = true;
        setTimeout(() => {
            this.dom.play.className = 'play-control video-control playing';
            this.dom.video.play();
            this.durationEvent();
        }, 50);
    }
    time() {
        if (Math.floor(this.dom.video.currentTime) === this.lastTime) {
            this.preciseTimeEvent();
            return;
        }
        this.shout('time', Math.floor(this.dom.video.currentTime));
        this.lastTime = Math.floor(this.dom.video.currentTime);
        if (!self.isSeeking) {
            this.dom.progress.value = this.dom.video.currentTime * 100;
        }
    }
    preciseTimeEvent() {
        this.shout('timePrecise', this.dom.video.currentTime);
    }
    durationEvent() {
        this.shout('duration', this.dom.video.duration)
        this.dom.progress.max = this.dom.video.duration * 100;
    }
    pause() {
        this.dom.play.className = 'play-control video-control';
        this.playing = false;
        this.dom.video.pause();
    }
    volume(vol) {
        if (parseInt(vol) < 1) {
            this.dom.volume.value = vol * 100;
            this.dom.video.volume = vol;
            this.updateVolumeIcon();
        }
    }
    volumeEvent() {
        this.shout('volume', this.dom.video.volume);
        this.dom.volume.value = this.dom.video.volume * 100;
        this.updateVolumeIcon();
    }
    mount(obj) {
        if (this.dom.video.src && !obj.src || this.dom.video.src === obj.src) {
            return false;
        }
        if (obj.hasOwnProperty('ads') && obj.ads !== null) {
            this.dom.controls.className = "video-control-bar hidden";
        } else {
            this.dom.controls.className = "video-control-bar";
        }
        this.mounted = true;
        this.dom.video.src = obj.src;
        this.dom.video.currentTime = 0;
    }
    show() {
        this.active = true;
        this.dom.container.className = "video-container";
    }
    hide() {
        this.active = false;
        this.dom.container.className = "video-container hidden";
    }
    toggle() {
        this.active = !this.active;
        let hidden = this.active ? "" : " hidden"
        this.dom.container.className = "video-container" + hidden;
    }
}

export default Noisy;
window.Noisy = Noisy;
