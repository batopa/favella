# Favella

**Favella** (*faˈvɛlla*) is an Italian word that means "speech" or better the "power of speech".

The idea behind **Favella** is to **make your console error speaks** to you.
No need to read errors, simply listen it.

I developed this simple library playing with [Web Speech API](https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html),
in particular with [Speech Synthesis API](https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html#tts-section)
a web API for controlling a text-to-speech output.

Unfortunately that API lacking of support in most of main browsers
so you can expect to work only in Chrome >= 43, Safari >= 8 and Opera >= 32.
More info on [caniuse.com](http://caniuse.com/#search=speechsynthesis).

From 0.3.0 version also [speech recognition](https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html#speechreco-section) is supported [in few browsers](http://caniuse.com/#feat=speech-recognition) :-(

## Install

### Install with bower

You can use [bower](https://bower.io) to install **Favella** in your app.

```bash
$ bower install favella
```

If you want to install and add it to your `bower.json` dependencies

```bash
# to add as dependencies
$ bower install favella --save

# to add as devDependencies
$ bower install favella --save-dev
```

Then you find it in `bower_components` folder.

### Install by hand

Download the [latest release](https://github.com/batopa/favella/releases) and link
`dist/favella.min.js` or `dist/favella.js` in your project.

## How it works

It is simple. Every time a `console.error()` is triggered the error message is read to you.
So, turn up your speakers, open your js console and write

```js
console.error('what a beautiful error');
```

## Favella API

#### `Favella.speak(message, options)`

**Favella** speaks to you reading a `message`. You can use `options` to customize some `SpeechSynthesisUtterance` attributes.

```js
Favella.speak('Ciao mondo', {
    // the volume from 0 to 1
    volume: 1,
    // the rate from 0.1 to 10
    rate: 2,
    // the pitch from 0 to 2
    pitch: 1,
    // lang to use. If it's not available use en-US
    lang: 'it-IT',
    // fired when Favella starts to speak
    onstart: function(e) {},
    // fired when Favella ends to speak
    onend: function(e) {},
     // fired when there was an error
    onerror: function(e) {},
     // fired when Favella is paused
    onpause: function(e) {},
     // fired when the spoken utterance reaches a word or sentence boundary
    onboundary: function(e) {},
     // fired when the spoken utterance reaches a named "mark" tag in SSML
    onmark: function(e) {}
});
```

#### `Favella.listen(options)`

**Favella** listen to you using [speech recognition feature](https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html#speechreco-section).
You can use `options` to customize some `SpeechRecognition` attributes.

> Pages hosted on HTTP need to ask permission each time they want to make an audio capture in a similar way to requesting access to other items via the browser.
> Pages on HTTPS do not have to repeatedly request access.

```js
Favella.listen({
    // the language you want Favella listens
    lang: 'it-IT',
    // set true to make Favella continuously listens
    continuous: false,
    // controls whether interim results are returned
    interimResults: false,
    // fired when audio capture started
    onaudiostart: function(e) {},
    // fired when some sound has been detected
    onsoundstart: function(e) {},
    // fired when the speech that will be used for speech recognition has started
    onspeechstart: function(e) {},
    // fired when the speech that will be used for speech recognition has ended
    onspeechend: function(e) {},
    // fired when sound is no longer detected
    onsoundend: function(e) {},
    // fired when audio capture ended
    onaudioend: function(e) {},
    // fired when speech recognizer returns a result
    // In additions to the SpeechRecognitionEvent Object it has as second argument a special result object containing useful information:
    // - isFinal: true if it's the final result of a recognition, false if it's an interim result
    // - interim: the interim transcript (if any)
    // - final:  the complete final transcript
    // - partial: the partial transcript useful if Favella.listen() is used with continuous = true
    onresult: function(e, result) {},
    // fired when speech recognizer returns a final result with no recognition hypothesis that meet or exceed the confidence threshold
    onnomatch: function(e) {},
    // fired when a speech recognition error occurs
    onerror: function(e) {},
    // fired when a speech recognition service has begun
    onstart: function(e) {},
    // fired when a speech recognition service has disconnected
    onend: function(e) {}
});
```

#### `Favella.setup(options)`

Setup default **Favella** options.

```js
Favella.setup({
    // list of curses that will be randomly appended at `console.error` messages.
    // Simply funny. Ok ok, Italian people will go wild :)
    curses: ['Damn', 'Shit', 'You, bastard'],
    // set true for mute the curses (false is the default)
    parentalControl: false,
    // options seen above in Favella.speak
    speakOptions: {},
    // define if console.error() speaks or not
    // set to 'console' to mute it
    mute: 'console',
    // options to speech recognition. See Favella.listen() to a complete list
    recognitionOptions: {}
});
```

#### `Favella.getConfig(name)`

Return **Favella** configuration or a specific conf if `name` was specified.

#### `Favella.mute(what)`

C'mon, **Favella** shut up!

If `what` is `'console'` the `console.error()` is muted
while `Favella.speak()` continue to work.

#### `Favella.unmute()`

Ehi, I was joking. Talk to me, please!

#### `Favella.isMute(what)`

Is **Favella** disabled?

If `what` is `'console'` return the mute state of `console.error()``

#### `Favella.getVoice(lang)`

Return the `speechSynthesisVoices` corresponding to `lang`.
If it is not found return `speechSynthesisVoices` for `en-US`.

#### `Favella.getVoices(force)`

Return a list of `SpeechSynthesisVoice` object available.
It's a wrapper of `speechsynthesis.getVoices()` that save it in a private var.
Use `force = true` to force reloading from `speechsynthesis.getVoices()`.

#### `Favella.pause()`

Pause **Favella** if it was spoken.
It's a wrapper of `speechsynthesis.pause()`

#### `Favella.resume()`

Resume **Favella** if it was paused.
It's a wrapper of `speechsynthesis.resume()`

#### `Favella.cancel()`

Stop speaking and remove all utterances from the queue.
It's a wrapper of `speechsynthesis.cancel()`

#### `Favella.isSpeaking()`

Is **Favella** speaking?
It's a wrapper of `speechsynthesis.speaking`.

#### `Favella.isPending()`

Return true if there are utterances in the queue that have not yet started speaking.
It's a wrapper of `speechsynthesis.pending`.

#### `Favella.isPaused()`

Return true if **Favella** is paused.
It's a wrapper of `speechsynthesis.paused`.

#### `Favella.isListening()`

Is Favella listening to you? (Speech recognition status)

#### `Favella.stopListen(abort)`

Immediately stop speech recognition using `SpeechRecognition.stop()`.
Pass `abort = true` to use `SpeechRecognition.abort()` instead.

### Useless but funny API

#### `Favella.parrotMode(lang)`

Toggle parrot mode. When it is active **Favella** listens to and repeats.
`lang` is required when you want to switch on parrot mode to say to **Favella**
which language is to be expected.

```js
Favella.parrotMode('it-IT');
```

#### `Favella.me(fail)`

How do you say **Favella** in Italian?

```js
Favella.me();
```

And what happens if Italian voice missing? Simulate it

```js
Favella.me(true);
```
