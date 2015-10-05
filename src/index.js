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
        this.bindEnv();
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
            height: 360

        }
        this.options = checkOpts(defaultOpts, opts);
        if (this.options.targetElement === null) {
            throw 'you should provide a target where the player will be inserted';
        }
        this.ready = this.id;
        this.isPlaying = false;
        this.isSeeking = false;
    };
    create() {
        if (this.ready !== this.id) {
            throw "something went horribly wrong";
        }
        this.dom = createTree(this);
    };
    play(src = null) {
        if (!this.dom.video.src && !src) {
            return false;
        }
        if (src) {
            this.dom.video.src = src;
        }
        this.dom.play.className = 'play-control video-control playing';
        this.isPlaying = true;
        setTimeout(() => {
            this.dom.video.play();
        }, 150);
    }
    pause() {
        this.dom.play.className = 'play-control video-control';
        this.isPlaying = false;
        this.dom.video.pause();
    }
    hasEnded() {
        this.dom.play.className = 'play-control video-control';
        this.dom.video.currentTime = 0;
        this.isPlaying = false;
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
    bindEnv() {
        let self = this;
        this.dom.play.addEventListener('click', function() {
            if (self.isPlaying) {
                self.pause()
            } else {
                self.play();
            }
        });
        this.dom.video.ontimeupdate = function() {
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
}

export default Noisy;
window.Noisy = Noisy;
