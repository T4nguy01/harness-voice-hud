# Voice HUD for Harness Maxxing

A voice assistant page for [Harness Maxxing](https://harness-maxxing.com): an animated HUD, talk or type, answers read aloud, actions on your Harness server through Claude.

> **Runs code on your server.** Each message starts `claude -p` in your workspace with your own Claude sign-in, your skills and (except in *Careful* mode) the Bash / Write / Edit tools. Read `api.py` before installing, and keep the autonomy level at *Careful* or *Balanced* unless you accept that.

## What it does
- **Voice in**: the browser's speech recognition (Chrome/Edge, HTTPS) or a recording transcribed by your server's Whisper (Settings -> Voice in Harness).
- **Voice out**: the browser's speech synthesis. Voice, speed, volume and language (French / English) in the page settings.
- **Brain**: `claude -p` in the workspace, one exchange at a time, conversation kept between messages (or not: "no memory" option).
- **Autonomy**: *Careful* = read-only tools, changes nothing. *Balanced* = acts alone on reversible things. *Autonomous* = acts without asking. Deleting, restarting a service, publishing and installing third-party code always ask first.
- **Guard rails**: besides the prompt, destructive or outward commands (`rm`, `sudo`, `git push`, `curl`, `ssh`, service restarts, installs, `maxxing keys`...) and secret files (SSH keys, `.env`, Claude config) are denied to Claude. These rules match command text only: **best effort, not a sandbox**.
- **Limits**: daily cap (default 40, hard ceiling 200), 3 s between two exchanges, 300 s per exchange.
- **Privacy settings**: history kept none / 1 day / 7 days / 30 days / 1 year, settings export / import.

## What it needs and what it sends where
- No key, no external service of its own. The `claude` command must be installed and signed in on the server.
- Your messages go to Claude (through your own sign-in). With browser recognition the **audio goes to the browser vendor's speech service** (Google in Chrome); with the server mode it stays on your server.
- State (settings, history, session id) is stored in the extension's state folder on the server, readable by the server user only. Nothing else is written outside what Claude is asked to do.

## Install
1. Copy or clone this folder to `<workspace>/extensions/voice-hud`, then Settings -> Pages -> Rescan.
2. Optional skill: `ln -s <workspace>/extensions/voice-hud/skill/voice-hud <workspace>/.claude/skills/voice-hud`

## Remove
Delete the `extensions/voice-hud` folder (and the skill link `.claude/skills/voice-hud`), then Rescan. Its state folder can be deleted too; the page's "New conversation" button clears the history beforehand.

## Tests
`python3 -I tests/test_settings.py` (no dependency). `tests/test_job.py` needs `pytest`.

## Limits
No streaming yet (an answer takes one Claude turn). Languages: French and English.

MIT license.
