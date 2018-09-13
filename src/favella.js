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
         * Configuration. Possible options are:
         *
         * - parentalControl: true to avoid using curses
         * - curses: list of curses to append to console.error() message
         * - speakOptions: speak options used in SpeechSynthesisUtterance object
         * - enabled: false to disable Favella.speak()
         * - muteConsole: true to mute only console.error()
         * 				  Favella.speak() will continue to work
         * - recognitionOptions: options used in SpeechRecognition object
         *
         * @type {Object}
         */
        var config = {
            parentalControl: false,
            curses: [],
            speakOptions: {
                voice: null,
                voiceName: null,
                voiceURI: null,
                volume: 1,
                rate: 1,
                pitch: 0,
                lang: 'en-US',
                onstart: function(e) {},
                onend: function(e) {},
                onerror: function(e) {},
                onpause: function(e) {},
                onboundary: function(e) {},
                onmark: function(e) {},
            },
            enabled: true,
            muteConsole: false,
            recognitionOptions: {
                lang: 'en-US',
                continuous: false,
                interimResults: false,
                onaudiostart: function(e) {},
                onsoundstart: function(e) {},
                onspeechstart: function(e) {},
                onspeechend: function(e) {},
                onsoundend: function(e) {},
                onaudioend: function(e) {},
                onresult: function(e, result) {},
                onnomatch: function(e) {},
                onerror: function(e) {},
                onstart: function(e) {},
                onend: function(e) {}
            }
        };

        /**
         * List of SpeechSynthesisVoice available
         * @type {Array}
         */
        var voices = [];

        /**
         * If speech recognition is active
         *
         * @type {SpeechRecognition}
         */
        var recognition = null;

        // Normalize SpeechRecognition object. For now only webkit prefix exists
        if (!('SpeechRecognition' in window) && ('webkitSpeechRecognition' in window)) {
            window.SpeechRecognition = window.webkitSpeechRecognition;
        }

        /**
         * Return an object with all keys present in defaultObj
         * If key is present in both defaultObj and obj use obj[key] value else use defaultObj[key] value
         *
         * @param {Object} obj the object on which add the defaults
         * @param {Object} defaultObj the referred default object
         * @return {Object}
         */
        var defaults = function(obj, defaultObj) {
            var result = {};
            Object.keys(defaultObj)
                .forEach(function(key) {
                    if (typeof obj[key] === 'undefined') {
                        result[key] = defaultObj[key];
                    } else if (typeof defaultObj[key] !== 'undefined') {
                        result[key] = obj[key];
                    }
                });
            return result;
        };

        var Favella = {

            /**
             * Return the current configuration or a specific key
             *
             * @param {string} name the name of config key
             * @return {Object}
             */
            getConfig: function(name) {
                var c = (name && typeof config[name] !== 'undefined') ? config[name] : config;
                return c;
            },

            /**
             * Setup speak options
             * @return {void}
             */
            setup: function(options) {
                if (options && typeof options == 'object') {
                    Object.keys(options)
                        .forEach(function(name) {
                            var value = options[name];
                            if ((name == 'speakOptions' || name == 'recognitionOptions') && typeof value == 'object') {
                                config[name] = defaults(options[name], config[name]);
                            } else if (name == 'curses' && Array.isArray(value)) {
                                config.curses = value;
                            } else if (name == 'parentalControl') {
                                config.parentalControl = !!value;
                            } else if (name == 'mute') {
                                if (value === true || value == 'console') {
                                    config.mute = value;
                                }
                            }
                        });
                }
                return this;
            },

            /**
             * Mute all or just console.error()
             *
             * @param {String} what if it is 'console' then just silence the console.error()
             * @return {void}
             */
            mute: function(what) {
                if (what && what == 'console') {
                    config.muteConsole = true;
                    console.log('console.error muted');
                } else {
                    config.enabled = false;
                    console.log('Ho perso la favella (I lost the power of speech)!');
                }
            },

            /**
             * Unmute what is silenced
             *
             * @return {void}
             */
            unmute: function() {
                // only for console.log() message
                if (!config.enabled) {
                    console.log('Ho riacquistato la favella (I recover the power of speech)!');
                } else if (config.muteConsole) {
                    console.log('console.error unmuted');
                }
                config.enabled = true;
                config.muteConsole = false;
            },

            /**
             * Is Favella mute?
             *
             * @param {String} what
             * @return {boolean}
             */
            isMute: function(what) {
                return (what && what == 'console') ? config.muteConsole : !config.enabled;
            },

            /**
             * If Favella is listening (speech recognition on)
             *
             * @return {Boolean}
             */
            isListening: function() {
                return !!recognition;
            },

            /**
             * Return the speechSynthesisVoices corresponding to `voice`.
             * If no corresponding voice was found, return the voice for 'en-US'.
             *
             * @param {String} voice A speechSynthesisVoices name or a lang as 'it-IT', 'en-US', ...
             * @return {Object} speechSynthesisVoices
             */
            getVoice: function (voice) {
                var voices = this.getVoices();
                if (voices.length) {
                    for (var i = 0; i < voices.length; i++) {
                        if ((voices[i].name === voice) || (voices[i].lang === voice)) {
                            return voices[i];
                        }
                    }

                    console.log('Sorry, ' + foundVoice + ' is not supported. Fallback to en-US.');
                    return this.getVoice('en-US');
                }
            },

            /**
             * Start speech recognition
             *
             * @param {Object} options params to configure SpeechRecognition.
             *                         See config.recognitionOptions for the defaults used
             * @return {Object} Favella
             */
            listen: function(options) {
                if (window.SpeechRecognition && !this.isListening()) {
                    var finalTranscript = '';
                    recognition = new SpeechRecognition();
                    options = options || {};
                    options = defaults(options, config.recognitionOptions);
                    Object.keys(options)
                        .forEach(function(name) {
                            if (name == 'onresult') {
                                recognition.onresult = function(e) {
                                    var tmpTranscript = '',
                                        interimTranscript = '',
                                        partialTranscript = '',
                                        prevFinalTranscript = finalTranscript;
                                    for (var i = e.resultIndex; i < e.results.length; ++i) {
                                        if (e.results[i].isFinal) {
                                            finalTranscript += e.results[i][0].transcript;
                                        } else {
                                            interimTranscript += e.results[i][0].transcript;
                                        }
                                    }
                                    partialTranscript = finalTranscript.replace(prevFinalTranscript, '');
                                    options.onresult(e, {
                                        isFinal: !interimTranscript,
                                        interim: interimTranscript,
                                        final:  finalTranscript,
                                        partial: partialTranscript
                                    });
                                };
                            } else if (name == 'onend') {
                                recognition.onend = function(e) {
                                    options.onend(e);
                                    recognition = null;
                                };
                            } else if (name == 'onerror') {
                                recognition.onerror = function(eventError) {
                                    console.error(eventError.type + ': ' + eventError.error);
                                };
                            } else {
                                recognition[name] = options[name];
                            }
                        });
                    recognition.start();
                }
                return this;
            },

            /**
             * Stop or abort speech recognition
             *
             * @param {Boolean} abort true to abort instead of stop
             * @return {void}
             */
            stopListen: function(abort) {
                if (this.isListening()) {
                    if (abort) {
                        recognition.abort();
                    } else {
                        recognition.stop();
                    }
                }
            },

            /**
             * Speak the message.
             * Eventually append a curse :)
             *
             * @param {String} message the text to speak
             * @param {Object} options params to configure the speaker.
             *                         see speakOptions for all options
             * @return {Object} Favella
             */
            speak: function(message, options) {
                if (!config.enabled) {
                    return false;
                }
                if (!message || typeof message != 'string') {
                    message = 'Something goes wrong';
                }

                options = options || {};
                options = defaults(options, config.speakOptions);
                var msg = new SpeechSynthesisUtterance();
                msg.voice = this.getVoice(options.voiceName || options.lang);
                console.log('Voice selected: ' + msg.voice.name);
                msg.voiceURI = msg.voice.voiceURI;
                msg.volume = options.volume; // 0 to 1
                msg.rate = options.rate; // 0.1 to 10
                msg.pitch = options.pitch; //0 to 2
                msg.lang = msg.voice.lang;
                msg.text = message;

                // add events
                ['onstart', 'onend', 'onerror', 'onboundary', 'onmark']
                    .forEach(function(name) {
                        if (options[name] && typeof options[name] == 'function') {
                            msg[name] = options[name];
                        }
                    });

                window.speechSynthesis.speak(msg);
                return this;
            },

            /**
             * Useless parrote mode on/off
             * Favella listen and repeat
             *
             * @param {String} lang the language to use
             * @return {void}
             */
            parrotMode: function(lang) {
                if (!this.isListening()) {
                    var v = this.getVoice(lang);
                    if (v.lang != lang) {
                        console.error('Language not supported. Parrot mode fail');
                        return;
                    }
                    var that = this;
                    this.speak('Parrot mode on', {
                        onend: function() {
                            var recOpt = {
                                lang: v.lang,
                                interimResults: false,
                                continuous: true,
                                onresult: function(e, result) {
                                    if (result.isFinal && result.partial) {
                                        console.log(result.partial);
                                        that.speak(result.partial, {
                                            lang: v.lang,
                                            volume: 1,
                                            rate: 1,
                                            pitch: 0.1
                                        });
                                    }
                                }
                            };
                            that.listen(recOpt);
                        }
                    });
                } else {
                    this.stopListen();
                    this.speak('Parrode mode off');
                }
            },

            /**
             * Wrap speechSynthesis.getVoices() and save it in private voices var
             * Return a list of SpeechSynthesisVoice available
             *
             * @param {boolean} force if you want to force to get voices from speechsynthesis
             * @return {void}
             */
            getVoices: function(force) {
                if (!voices.length || force) {
                    voices = window.speechSynthesis.getVoices();
                }
                return voices;
            },

            /**
             * Wrap speechSynthesis.pause()
             * Pause any utterances that are being spoken
             *
             * @return {void}
             */
            pause: function() {
                window.speechSynthesis.pause();
            },

            /**
             * Wrap speechSynthesis.resume()
             * Resume an utterances that was previously paused
             *
             * @return {void}
             */
            resume: function() {
                window.speechSynthesis.resume();
            },

            /**
             * Wrap speechSynthesis.cancel()
             * Stop speaking and remove all utterances from the queue
             *
             * @return {void}
             */
            cancel: function() {
                window.speechSynthesis.cancel();
            },

            /**
             * Wrap speechSynthesis.speaking
             * Return true if Favella is speaking
             *
             * @return {boolean}
             */
            isSpeaking: function() {
                return window.speechSynthesis.speaking;
            },

            /**
             * Wrap speechSynthesis.pending
             * Return true if there are utterances in the queue that have not yet started speaking
             *
             * @return {boolean}
             */
            isPending: function() {
                return window.speechSynthesis.pending;
            },

            /**
             * Wrap speechSynthesis.paused
             * Return true if Favella is paused
             *
             * @return {boolean}
             */
            isPaused: function() {
                return window.speechSynthesis.paused;
            },

            /**
             * How do you say "favella"?
             *
             * @param {boolean} fail used to test missing italian voice situation
             * @return {void}
             */
            me: function (fail) {
                var lang = 'it-IT';
                var voiceName = this.getConfig('speakOptions').voiceName;
                if (fail) {
                    lang = 'en-US';
                    voiceName = '';
                }
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

        // cancel pending speaking
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }

        // wait on voices to be loaded before fetching list
        window.speechSynthesis.onvoiceschanged = function() {
            Favella.getVoices(true);
        };

        /**
         * Override standard console.error()
         * Before write in console it speaks the error
         * @return {void}
         */
        window.console.error = function() {
            if (!Favella.isMute('console')) {
                var args = Array.prototype.slice.call(arguments);
                var message = args[0];
                var config = Favella.getConfig();
                if (!config.parentalControl && config.curses.length) {
                    message += '. ' +  config.curses[Math.floor(Math.random() * config.curses.length)] + '!';
                }
                Favella.speak(message);
            }
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
