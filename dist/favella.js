/**
 * favella.js
 *
 * Copyright (c) 2015 Alberto Pagliarini
 * Licensed under the MIT license
 * https://github.com/batopa/favella/blob/master/LICENSE
 */

if ('speechSynthesis' in window) {

    (function(window) {

        'use strict';

        /**
         * Save original console error function
         * @type {Object} console.error function
         */
        var consoleError = window.console.error;

        /**
         * Parental control
         * If it's true avoid to use curses
         * @type {Boolean}
         */
        var parentalControl = false;

        /**
         * An list of curses to append to console.error() message
         * @type {Array}
         */
        var curses = [];

        /**
         * Speak options
         * @type {Object}
         */
        var speakOptions = {
            voice: null,
            voiceURI: 'native',
            volume: 1,
            rate: 1,
            pitch: 0,
            lang: 'en-US'
        };

        /**
         * true to make Favella speaks
         * @type {Boolean}
         */
        var enabled = true;

        /**
         * List of speechSynthesisVoices available
         * @type {Array}
         */
        var voices = [];

        // wait on voices to be loaded before fetching list
        window.speechSynthesis.onvoiceschanged = function() {
            voices = window.speechSynthesis.getVoices();
        };

        var Favella = {

            /**
             * Setup speak options
             * @return {void}
             */
            setup: function(options) {
                if (options) {
                    if (options.parentalControl) {
                        parentalControl = options.parentalControl;
                    }
                    if (options.curses) {
                        curses = options.curses;
                    }
                    if (options.speakOptions) {
                        Object.keys(speakOptions)
                            .forEach(function(item) {
                                if (options.speakOptions[item]) {
                                    speakOptions[item] = options.speakOptions[item];
                                }
                            });
                    }
                }
            },

            /**
             * Mute it
             * @return {void}
             */
            mute: function() {
                enabled = false;
                console.log('Ho perso la favella');
            },

            /**
             * Unmute it
             * @return {void}
             */
            unmute: function() {
                enabled = true;
            },

            /**
             * Return the speechSynthesisVoices corresponding to lang
             * If no lang corresponding exists return 'en-US'
             *
             * @param {String} lang the language as it-IT, en-US,...
             * @return {Object} speechSynthesisVoices
             */
            getVoice: function(lang) {
                var voice = null;
                if (voices.length) {
                    voices.forEach(function(v) {
                        if (v.lang == lang) {
                            voice = v;
                        }
                    });
                    if (!voice) {
                        console.log('Sorry, ' + lang + ' is not supported. Fallback to en-US.');
                        voice = this.getVoice('en-US');
                    }
                }
                return voice;
            },

            /**
             * Speak the message.
             * Eventually append a curse :)
             *
             * @param {String} message the text to speak
             * @param {Object} options params to configure the speaker.
             *                         see speakOptions for all options
             * @return {void}
             */
            speak: function(message, options) {
                if (!enabled) {
                    return false;
                }
                if (!message || typeof message != 'string') {
                    message = 'Something goes wrong';
                }

                options = options || {};
                Object.keys(speakOptions)
                    .forEach(function(item) {
                        if (!options[item]) {
                            options[item] = speakOptions[item];
                        }
                    });
                var msg = new SpeechSynthesisUtterance();
                var voices = window.speechSynthesis.getVoices();
                msg.voice = this.getVoice(options.lang);
                console.log('Voice selected: ' + msg.voice.name);
                //msg.voiceURI = msg.voice.voiceURI;
                msg.volume = options.volume; // 0 to 1
                msg.rate = options.rate; // 0.1 to 10
                msg.pitch = options.pitch; //0 to 2
                msg.lang = msg.voice.lang;
                msg.text = message;

                msg.onend = function(e) {
                    console.log('Finished to speak');
                };

                msg.onerror = function(e) {
                    console.log(e);
                };

                speechSynthesis.speak(msg);
            },

            /**
             * How do you say "favella"?
             *
             * @param {Boolean} fail used to test missing italian voice situation
             * @return {void}
             */
            me: function(fail) {
                var lang = (fail) ? 'en-US' : 'it-IT';
                var voice = this.getVoice(lang);
                if (voice) {
                    var msg = [];
                    if (voice.lang == 'it-IT') {
                        msg.push('favella');
                    } else {
                        msg = [
                            'Sorry, I cannot pronunce properly because missing italian voice. I will try anyway.',
                            'favella.',
                            'Shit!'
                        ];
                    }
                    var that = this;
                    msg.forEach(function(m) {
                        that.speak(m, {
                            volume: 1,
                            rate: 1,
                            pitch: 0,
                            lang: voice.lang
                        });
                    });
                } else {
                    console.log('Missing voice :(');
                }
            }

        };

        /**
         * Override standard console.error()
         * Before write in console it speaks the error
         * @return {void}
         */
        window.console.error = function() {
            var args = Array.prototype.slice.call(arguments);
            var message = args[0];
            if (!parentalControl && curses.length) {
                message += '. ' +  curses[Math.floor(Math.random() * curses.length)] + '!';
            }
            Favella.speak(message);
            consoleError.apply(window.console, arguments);
        };

        // export Favella module
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = Favella;
        } else {
            window.Favella = Favella;
        }

    })(window);

} else {
    console.log('Sorry, speechSynthesis is not supported on this browser');
}
