# Favella

**Favella** (*faˈvɛlla*) is an Italian word that means "speech" or better the "power of speech".

The idea behind **Favella** is to **make your console error speaks** to you.
No need to read errors, simply listen it.

I developed this simple library playing with [Web Speech API](https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html),
in particular with [Speech Synthesis API](https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html#tts-section)
a web API for controlling a text-to-speech output.

Unfortunately that API lacking of support in most of main browsers
so you can expect to work only in Chrome >= 43, Safari >= 8 and Opera >= 32.
More info on [canisue.com](http://caniuse.com/#search=speechsynthesis).

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
bower install favella --save-dev
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
    volume: 1, // 0 to 1
    rate: 2, // 0.1 to 10
    pitch: 1, // 0 to 2
    lang: 'it-IT' // lang to use. If it's not available use en-US
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
    speakOptions: {}
});
```

#### `Favella.mute()`

C'mon, **Favella** shut up!

#### `Favella.unmute()`

Ehi, I was joking. Talk to me, please!

#### `Favella.getVoice(lang)`

Return the `speechSynthesisVoices` corresponding to `lang`.
If it is not found return `speechSynthesisVoices` for `en-US`.

#### `Favella.me(fail)`

How do you say **Favella** in Italian?

```js
Favella.me();
```

And what happens if Italian voice missing? Simulate it

```js
Favella.me(true);
```
