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
        this.create();
        this.events();
        // add bindings for user-provided controls
        //this.bindEnv();
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
    trigger(event, opts) {
        if (this.evt.hasOwnProperty(event)) {
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
        return this.players[!this.active];
    }
    next() {
        return (this.active + 1) % this.players.length;
    }
    play(src = null) {
        this.delegate().mount(src)
        this.delegate().play();
    }
    pause() {
        this.delegate().play();
    }
    setVolume(vol, id = null) {
        if (!id) {
            dictate('volume', vol);
        } else {

        }
    }
    dictate(prop, value) {
        for (i = this.players.length - 1; i >= 0; i--) {
            this.players[i][prop] = value;
        }
    }
}

class Agastopia {
    constructor(parent, ref, active) {
        this.id = randomizer();
        this.ref = ref;
        this.parent = parent;
        this.active = active;
        this.playing = false;
        this.whole = true;
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
        this.parent.trigger(event, value);
    }
    binder() {
        let self = this,
            dom = self.dom, // decompose...
            video = dom.video; // dedecompose...

        video.onended = function() {
            self.ended();
        };
        video.ontimeupdate = function() {
            self.time();
        };
        dom.video.onvolumechange = function() {
            self.volume();
        };

        video.ondurationchange = function() {
            self.duration();
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
            video.volume = dom.volume.value / 100;
            self.updateVolumeIcon();
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
    ended(ref) {
        this.shout('ended');
        this.dom.play.className = 'play-control video-control';
        this.dom.video.currentTime = 0;
        this.playing = false;
    }
    play() {
        this.playing = true;
        setTimeout(() => {
            this.dom.play.className = 'play-control video-control playing';
            this.dom.video.play();
            this.duration();
        }, 50);
    }
    time() {
        if (Math.floor(this.dom.video.currentTime) === this.lastTime) {
            this.preciseTime();
            return;
        }
        this.shout('time', Math.floor(this.dom.video.currentTime));
        this.lastTime = Math.floor(this.dom.video.currentTime);
        if (!self.isSeeking) {
            this.dom.progress.value = this.dom.video.currentTime * 100;
        }
    }
    preciseTime() {
        this.shout('timePrecise', this.dom.video.currentTime);
    };
    duration() {
        this.shout('duration', this.dom.video.duration)
        this.dom.progress.max = this.dom.video.duration * 100;
    }
    pause() {
        this.dom.play.className = 'play-control video-control';
        this.playing = false;
        this.dom.video.pause();
    }
    volume() {
        this.shout('volume', this.dom.video.volume);
        this.dom.volume.value = this.dom.video.volume * 100;
    }
    mount(src = null) {
        if (this.dom.video.src && !src || this.dom.video.src === src) {
            return false;
        }
        this.dom.video.src = src;
    }
}

export default Noisy;
window.Noisy = Noisy;
