# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static marketing landing page for **PropPulse** — a DFW real estate market intelligence service at `proppulse.online`. No framework, no build step, no dependencies.

## Development

**To preview:** Open `index.html` directly in a browser — no build step or server required.

**To deploy:** Push to GitHub. Vercel auto-deploys from the `main` branch.

There are no lint, test, or build commands.

## Architecture

Three files make up the entire site:

- **`index.html`** — All page content and structure (single-page layout)
- **`styles.css`** — All styles; theme uses CSS custom properties (`--accent: #00BFFF`, dark bg `#0a0a0a`), max-width container is 1140px
- **`script.js`** — Vanilla JS: smooth scroll, mobile nav toggle, IntersectionObserver-based stat counters and card fade-ins, Formspree form handling

**Page sections (in DOM order):** Nav → Hero → Stats Bar → Services → AI Voice Agent (`#voice-agent`) → Why PropPulse → Comparison (`#vs`) → Pricing → Sample Report → Who It's For → Contact → Footer

**External integrations:**
- **Formspree** (`xkopeaad`) — contact form backend
- **Google Analytics** (`G-8EKBS66Y8B`) — embedded tracking
- **PayPal** — 1 payment link in the pricing section (Intel tier only)
- **Google Fonts** — Montserrat and Inter, preconnected

**Static assets:** `logo.png`, `bg.png`, and versioned PDF sample reports (`dfw-market-report-2026-04-v*.pdf`). When updating the sample report PDF, also update the download link `href` in `index.html`.

## Key Conventions

- The comparison section (`#vs`) positions PropPulse against PropStream, HouseCanary, and Attom — not generic competitors.
- Pricing tiers: **Intel ($199/mo)**, **PropPulse Pro ($497/mo — Intel + AI Voice Agent bundle)**, **White-Label ($1,500/mo)**.
- The AI Voice Agent section (`#voice-agent`) is a feature showcase — pricing lives in `#pricing` only.
- PayPal link and the Formspree endpoint are hardcoded in `index.html`.
- When adding new sections, follow the existing scroll-animate pattern: add the `fade-card` class and let the IntersectionObserver in `script.js` handle the entrance animation.
