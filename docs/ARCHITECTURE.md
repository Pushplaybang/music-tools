# Architecture Reference

## Single-file tool pattern
Each tool HTML file follows this structure:
1. <style> — Full CSS with all 5 theme token blocks and responsive media queries
2. Modal overlays (help, score, etc.)
3. Theme bar with desktop pills + mobile flyout
4. .content wrapper with <header> and .card sections
5. .app-footer with "made with ♥ by Paul van Zyl"
6. <script> — All JS: persistence, themes, modals, audio, core logic, restoreSettings(), init

## Theme token blocks
Every tool MUST define tokens for ALL 5 themes. Copy from music-tools-boilerplate.html.

## Theme-specific CSS overrides that MUST be preserved:
- [data-theme="retro"] — italic card titles, ::before decorative stripe on cards, italic header p
- [data-theme="studio"] — uppercase h1, letter-spacing .14em, text-shadow glow, font-weight 800
- [data-theme="playful"] — font-weight 800 on h1, large border-radius (--r:20px, --br:50px)
- [data-theme="minimal"] — border-left:3px solid var(--accent) on .card

## Modal system
function openModal(id) { document.getElementById(id).classList.add('show'); document.body.style.overflow='hidden'; }
function closeModal(id) { document.getElementById(id).classList.remove('show'); document.body.style.overflow=''; }

Click-outside-to-close on overlays (except score overlay which requires button dismiss).

## Instrument tuning data (shared reference)
Guitar: Standard, Drop D, Open G/D/E/A, DADGAD, Half Step Down (8 presets)
Bass: Standard, Drop D, 5-String, Half Step Down (4 presets)
Ukulele: Soprano GCEA, Low G, Baritone, D Tuning, Open C (5 presets)
