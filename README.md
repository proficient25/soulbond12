# For Musk 💌

A one-page romantic website — a digital love letter, sealed with wax, with
shayaris, a photo, and background music.

## Adding your real photo and audio

I didn't receive the actual photo or MP3 — only a screenshot of your VS Code
explorer came through. The site is fully built and works right now with a
graceful placeholder (a soft heart icon) instead of the photo, and the play
button will just do nothing until you add real audio. To finish it:

1. **Photo** — copy your image into the `images/` folder and name it
   `musk-1.jpeg` (or update the filename in `index.html`, search for
   `id="galleryImg"`).
2. **Audio** — copy your mp3 into the `audio/` folder and name it
   `our-song.mp3` (or update the filename in `index.html`, search for
   `<source src="audio/our-song.mp3"`).

That's it — no code changes needed if you use those exact filenames.

## Customizing the shayaris

All 10 lines live near the top of `script.js` in the `shayaris` array.
Edit the `text` freely — the `\n` inside a string is just a line break.

## Running it

Just open `index.html` in a browser. For local testing, using a simple local
server (e.g. VS Code's "Live Server" extension) avoids any autoplay/CORS
quirks with audio.

## Notes on autoplay

Browsers block audio from playing before a user interacts with the page.
This site works around that by treating the "break the seal" click as the
trigger — the music tries to start the moment Musk opens the letter.
If her browser still blocks it, the play button on the music card lets her
start it manually.
