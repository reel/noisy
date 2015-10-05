'use strict';

var Noisy = require('../src/index.js');
var opts = {
    playElement: '#a' + Math.random().toString(36).substring(7),
    pauseElement: '#a' + Math.random().toString(36).substring(7),
    seekElement: '#a' + Math.random().toString(36).substring(7),
    playerElement: '#a' + Math.random().toString(36).substring(7),
    targetElement: '#a' + Math.random().toString(36).substring(7)
};
for (let key in opts) {
    var el = document.createElement("div");
    if (opts[key].charAt(0) === '#') {
        el.id = opts[key].slice(1);
    }
    if (opts[key].charAt(0) === '.') {
        el.className = opts[key].slice(1);
    }
    document.body.appendChild(el);
};
describe("The player constructor", function() {
    var noisy = new Noisy({targetElement: opts.targetElement});
    it("should be a function", function() {
        expect(noisy).toBeDefined();
    });
    it("should have a unique id", function() {
        var noisy2 = new Noisy({targetElement: opts.targetElement});
        expect(noisy.id).toBeDefined();
        expect(noisy).not.toEqual(noisy2);
    });
    it("should have some Elements parameters", function() {
        expect(noisy.options.playElement).toBe('#play_' + noisy.id);
        expect(noisy.options.pauseElement).toBe('#pause_' + noisy.id);
        expect(noisy.options.seekElement).toBe('#seek_' + noisy.id);
        expect(noisy.options.playerElement).toBe('#player_' + noisy.id);
    });
    describe("parameters should be customizable", function() {
        var noisy = new Noisy(opts);
        it("over all features", function() {
            expect(noisy.options.playElement).toBe(opts.playElement);
            expect(noisy.options.pauseElement).toBe(opts.pauseElement);
            expect(noisy.options.seekElement).toBe(opts.seekElement);
            expect(noisy.options.playerElement).toBe(opts.playerElement);
            expect(noisy.options.targetElement).toBe(opts.targetElement);
        });
        it("just one feature", function() {
            var noisy = new Noisy({
                playerElement: opts.playerElement,
                targetElement: opts.targetElement
            });
            expect(noisy.options.playerElement).toBe(opts.playerElement);
            expect(noisy.options.pauseElement).toBeDefined();
            expect(noisy.options.pauseElement).not.toBe(opts.pauseElement);
        });
    });
    describe("they should be validated", function() {
        var result = null;
        try {
            var noisy = new Noisy({
                playerElement: '#' + Math.random().toString(36).substring(7),
            });
        } catch (e) {
            result = e;
        }

        it("throw an error", function() {
            expect(result).not.toBeNull();
        });
        var result = null;
        try {
            var noisy = new Noisy();
        } catch (e) {
            result = e;
        }
        it("they should have a target", function() {
            expect(result).not.toBeNull();
        });
    });
});
