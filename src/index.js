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
        let self = this;
        this.dom.play.addEventListener('click', function() {
            if (self.playing) {
                self.pause()
            } else {
                self.play();
            }
        });
        this.dom.video.ontimeupdate = function() {
            self.shout('time', self.dom.video.currentTime);

            if (!self.isSeeking) {
                self.dom.progress.value = self.dom.video.currentTime;
            }
        };
        this.dom.video.onended = function() {
            self.hasEnded();
        };
        this.dom.video.onended = function() {
            self.hasEnded();
        };
        this.dom.video.ondurationchange = function() {
            self.dom.progress.max = self.dom.video.duration;
        };
        this.dom.progress.addEventListener('change', function() {
            self.dom.video.currentTime = self.dom.progress.value;
        });
        this.dom.progress.addEventListener('mousedown', function() {
            self.isSeeking = true
        });
        this.dom.progress.addEventListener('mouseup', function() {
            self.isSeeking = false;
        });
        this.dom.video.onvolumechange = function() {
            self.dom.volume.value = self.dom.video.volume * 100;
        };
        this.dom.volume.addEventListener('change', function() {
            self.dom.video.volume = self.dom.volume.value / 100;
            self.updateVolumeIcon();
        });
        self.dom.volume.value = self.dom.video.volume * 100;
        this.dom.mute.addEventListener('click', function() {
            self.dom.video.muted = !self.dom.video.muted;
            if (self.dom.video.muted) {
                self.dom.mute.className = "sound-control video-control muted";
            } else {
                self.updateVolumeIcon();
            }
        });
        this.dom.fullScreen.addEventListener('click', function() {
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
        this.dom.play.className = 'play-control video-control';
        this.dom.video.currentTime = 0;
        this.isPlaying = false;
    }
    play() {
        this.playing = true;
        setTimeout(() => {
            this.dom.play.className = 'play-control video-control playing';
            this.dom.video.play();
        }, 50);
    }
    pause() {
        this.dom.play.className = 'play-control video-control';
        this.playing = false;
        this.dom.video.pause();
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
