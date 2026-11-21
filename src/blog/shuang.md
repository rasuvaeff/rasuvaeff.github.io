---
title: "shuang: the VPN kill switch I built in Rust after two days of my proxy flapping"
description: "A per-app VPN kill switch that freezes Claude Code the moment the tunnel drops and resumes it when the exit returns. 6 releases, 3 platforms, one native GUI — and a home-IP leak detector that found 145 leaks in two days of my own traffic."
date: 2026-11-21T23:59:59Z
outline: [2, 3]
figures:
  - ["7", "protective guards"]
  - ["3", "platforms with a tray"]
  - ["~10s → ~1s", "leak window"]
  - ["145", "home-IP leaks caught"]
---

Every guide about running Claude Code behind a VPN ends with the same advice: make sure your traffic goes through the exit. None of them tell you what happens when it doesn't.

## Install

Copy and run:

```bash
curl -fsSL https://raw.githubusercontent.com/rasuvaeff/shuang/master/scripts/install.sh | sh
```

Native panel, tray icon, three platforms. No server, no telemetry.

My setup is a local proxy client ([happ](https://github.com/username/happ)) whose tunnel drops a few times a day. When it drops, my traffic does not stop — it **falls back to my real address** and keeps flowing. Browsing does not notice: keep-alive connections survive, pages load from cache. Claude Code does notice, because it opens a fresh connection per request — and each one left with my home address.

## The idea

The fix is a per-app kill switch: freeze the process the instant the exit is wrong, resume it when the exit returns. Not kill-and-restart (sessions die), not a firewall rule for the whole system (everything stops, including your work).

Freezing a process is one syscall (`SIGSTOP` on Unix, `NtSuspendProcess` on Windows). Everything else is the hard part.

## What actually took time

**Verifying the exit correctly.** "Check the IP" sounds trivial. In practice: 4 IP services must **agree** (a single lying service must not open the gate), IPv6 needs five states (disabled / confirmed / conflict / required / unavailable), a country match covers IPv4 but **not** IPv6, and a datacenter-flagged exit needs its own guard.

**The home-IP leak detector.** My first diagnostic pass found something I did not expect: 145 episodes where the exit was my **residential address** (an ISP from my region, `proxy: false, hosting: false`). Not a second VPN node — my real address leaking through the tunnel. shuang now names this explicitly: a `home-ip-leak` event, a critical desktop alert, and a frozen tree until the tunnel is back.

**Resuming safely.** "PID 12345 is frozen, resume it" breaks when the OS reuses the PID for your browser. The freeze journal stores **PID + start time** as an identity, binds each record to a supervisor identity and a config scope, and clears itself on reboot. A stale record is skipped, not blindly continued.

**The GUI.** A tray app with a panel should feel native, not like a browser tab. On Linux the webview sits in a GTK window, on Windows/macOS in a tao window — same panel, same code, per-platform windowing. The panel is bilingual (RU/EN) with a plain-language explanation of every setting.

## The guards

| Guard | Against |
|---|---|
| Quorum (≥2 services agree) | One lying IP service |
| IPv6 five-state check | A leak through a path IPv4 does not see |
| Transport probe (1 s TCP) | A dead tunnel detected in ~1 s instead of ~10 s |
| Proxy-client watchdog | A proxy process that dies without moving routes |
| Paranoid mode | Freeze on a network event **before** re-checking |
| Reputation guard | An exit flagged proxy/datacenter |
| Stability gate | A flapping exit reaching the app |
| Home-IP leak detector | The residential address behind a dead tunnel |

Every guard is a panel toggle with a plain-language explanation. The panel also shows, per app: current status, the reason for a freeze, and time until a forced stop.

## What I would tell myself two days ago

1. **The tunnel does not fail loudly.** A dead tunnel looks like "everything works, just from the wrong address". You need a canary that samples new connections, not a user noticing slowness.
2. **One IP is not one IP.** IPv4 and IPv6 are independent exits with independent failure modes.
3. **A frozen process is a promise, not a syscall.** Verify it stopped. Verify the PID is still the same process. Verify the supervisor that froze it is still alive.

## Links

- Source and releases: [github.com/rasuvaeff/shuang](https://github.com/rasuvaeff/shuang)
- Install: `curl -fsSL https://raw.githubusercontent.com/rasuvaeff/shuang/master/scripts/install.sh | sh`
- GPL-3.0, no server, no telemetry, all checks are visible in the source.
