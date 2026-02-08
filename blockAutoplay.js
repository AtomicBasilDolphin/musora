// ==UserScript==
// @name         Musora Stop Video Autoplay
// @namespace    http://tampermonkey.net/
// @version      7.0
// @description  Stop autoplay on page load and navigation
// @match        https://app.musora.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(() => {
    'use strict';

    let blockAutoplay = true;
    let userHasInteracted = false;

    // Block play() until user interacts
    const originalPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function() {
        if (blockAutoplay && !userHasInteracted) {
            return Promise.reject(new DOMException('Autoplay blocked', 'NotAllowedError'));
        }
        return originalPlay.call(this);
    };

    const startBlocking = () => {
        blockAutoplay = true;
        userHasInteracted = false;
    };

    const markInteraction = () => {
        userHasInteracted = true;
    };

    ['click', 'mousedown', 'touchstart', 'keydown'].forEach(event => {
        document.addEventListener(event, markInteraction, { once: true, capture: true });
    });

    // Intercept pushState and replaceState
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function() {
        originalPushState.apply(this, arguments);
        startBlocking();
        // Re-attach interaction listeners
        ['click', 'mousedown', 'touchstart', 'keydown'].forEach(event => {
            document.addEventListener(event, markInteraction, { once: true, capture: true });
        });
    };

    history.replaceState = function() {
        originalReplaceState.apply(this, arguments);
        startBlocking();
        // Re-attach interaction listeners
        ['click', 'mousedown', 'touchstart', 'keydown'].forEach(event => {
            document.addEventListener(event, markInteraction, { once: true, capture: true });
        });
    };

    // Also catch popstate
    window.addEventListener('popstate', () => {
        startBlocking();
        // Re-attach interaction listeners
        ['click', 'mousedown', 'touchstart', 'keydown'].forEach(event => {
            document.addEventListener(event, markInteraction, { once: true, capture: true });
        });
    });

    // Initial block on page load
    startBlocking();
})();
