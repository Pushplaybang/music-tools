# 🎵 Music Tools

A collection of free, open-source browser-based music tools for musicians at any level. No account, no installation, no server — each tool is a single HTML file that runs entirely in your browser.

Built with vanilla HTML, CSS, and JavaScript. Powered by the Web Audio API.

---

## 🗂️ Tools

| Tool | File | Live | Description |
|---|---|---|---|
| [Ear Trainer](docs/ear-trainer.md) | `src/ear-trainer.html` | [▶ Open](https://pushplaybang.github.io/music-tools/src/ear-trainer.html) | Scale visualiser, interval & chord ear training quiz |
| [Instrument Tuner](docs/instrument-tuner.md) | `src/tuner.html` | [▶ Open](https://pushplaybang.github.io/music-tools/src/tuner.html) | Chromatic strobe tuner for guitar, bass, ukulele & more |
| [Pulse](docs/pulse.md) | `src/pulse.html` | [▶ Open](https://pushplaybang.github.io/music-tools/src/pulse.html) | Visual metronome with tap tempo, subdivisions & swing |

---

## 🚀 Quick Start

Open `index.html` in any modern browser to see the collection home page, then launch any tool from there. You can also open tool files directly — no build step, no `npm install`, no server required.

---

## 🗂️ Project Structure

```
music-tools/
├── index.html                    # Collection home page
├── src/
│   ├── ear-trainer.html          # Ear Trainer app
│   ├── tuner.html                # Instrument Tuner app
│   └── pulse.html                # Pulse Visual Metronome app
├── music-tools-boilerplate.html  # Shared design system starter
├── docs/
│   ├── ear-trainer.md            # Ear Trainer documentation
│   ├── instrument-tuner.md       # Instrument Tuner documentation
│   └── pulse.md                  # Pulse documentation
└── README.md                     # This file
```

---

## 🎨 Shared Design System

All three tools share a 5-theme CSS custom property system. Themes switch instantly without a page reload and all settings persist in `localStorage` automatically.

| Theme | Fonts | Mood |
|---|---|---|
| Dark Gold | DM Serif Display + Space Mono | Warm, professional |
| Clean & Minimal | Instrument Serif + Syne | Light, editorial |
| Dark Studio | Syne + Space Mono | Dark, electronic |
| Retro Piano | Playfair Display | Vintage, warm dark |
| Bright & Playful | Nunito | Colourful, friendly |

`music-tools-boilerplate.html` contains the full design system — all theme tokens, CSS components, the theme switcher, modal system, localStorage helpers, and audio engine — ready to copy when building new tools in the same family.

---

## 🤝 Contributing

Issues and pull requests are welcome.

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Test in at least two browsers (Chrome and Firefox recommended)
4. Test all 5 themes after any CSS changes
5. Open a pull request with a clear description of what changed and why

---

## 📄 Licence

Licensed under the **Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0)**. Any commercial use — including incorporation into commercial products, revenue-generating activities, or distribution for a fee — is strictly prohibited without the express prior written permission of the copyright holder.

You are free to share and adapt this work for non-commercial purposes, provided you give appropriate credit and indicate any changes made.

Full licence text: [LICENSE.md](LICENSE.md) · [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/legalcode)

---

## 👤 Author

Made with ♥ by **Paul van Zyl**

*Built with Claude by Anthropic.*
