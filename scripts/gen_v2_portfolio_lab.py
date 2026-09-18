#!/usr/bin/env python3
"""
gen_v2_portfolio_lab.py  --  Axone V2 · Historical Portfolio Lab (Track C)

READ-ONLY generator. Reads Track C portfolio-matrix outputs from the V2 research
root and emits public/data/v2_portfolio_lab.json for the dashboard.

Source (read-only, never mutated):
  <V2_ROOT>/TRACK_C_portfolio_matrix/profiles/<profileKey>/
      equity_curve_daily.csv    (ts,equity)
      trade_log.jsonl           (one closed/open trade per line)
      missed_entries.jsonl      (rejected entries: no_slot etc.)

Graceful degradation: the FULL expected profile matrix is enumerated. Profiles
present on disk are computed from real data; profiles not yet produced are
emitted with status "awaiting" and NO fabricated numbers.

Nothing is invented. Every number is derived from the real files. Absent data
is reported as absent.
"""

import csv
import glob
import hashlib
import json
import math
import os
from datetime import datetime

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V2_ROOT = "/Users/julesdevaux/.openclaw/agents/axone/workspace/AXONE_V2_RESEARCH_20260918"
TRACK_C = os.path.join(V2_ROOT, "TRACK_C_portfolio_matrix")
PROFILES_DIR = os.path.join(TRACK_C, "profiles")
OUT = os.path.join(REPO, "public", "data", "v2_portfolio_lab.json")

TRADE_SAMPLE = 400  # most-recent trades shipped for the trade table

# Full expected Track C matrix (task spec): $500/$1,000/$10,000 x 5/10 positions
# x 10%/20% max allocation, plus the $100,000 reference portfolio.
EQUITIES = [500, 1000, 10000]
POSITIONS = [5, 10]
ALLOCS = [10, 20]


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def short(s):
    return s[:12] if s else s


def parse_profile_key(key):
    """eq1000_p5_a10 -> (1000, 5, 10)."""
    try:
        parts = key.split("_")
        eq = int(parts[0][2:])
        pos = int(parts[1][1:])
        alloc = int(parts[2][1:])
        return eq, pos, alloc
    except Exception:
        return None, None, None


def expected_matrix():
    keys = []
    for eq in EQUITIES:
        for p in POSITIONS:
            for a in ALLOCS:
                keys.append(f"eq{eq}_p{p}_a{a}")
    return keys


def load_equity_curve(path):
    pts = []
    with open(path, newline="") as f:
        r = csv.DictReader(f)
        for row in r:
            try:
                eq = float(row["equity"])
            except (KeyError, ValueError):
                continue
            pts.append({"t": row["ts"], "equity": round(eq, 4)})
    return pts


def compute_drawdown(curve):
    """Return running-drawdown pct series + max drawdown detail."""
    peak = None
    dd = []
    max_dd = 0.0
    max_dd_at = None
    peak_at = None
    for pt in curve:
        eq = pt["equity"]
        if peak is None or eq > peak:
            peak = eq
            peak_at = pt["t"]
        d = 0.0 if peak in (None, 0) else (eq / peak - 1.0) * 100.0
        dd.append({"t": pt["t"], "dd": round(d, 4)})
        if d < max_dd:
            max_dd = d
            max_dd_at = pt["t"]
    return dd, {
        "maxDrawdownPct": round(max_dd, 4),
        "maxDrawdownAt": max_dd_at,
        "priorPeakAt": peak_at if max_dd_at else None,
    }


def iter_jsonl(path):
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                yield json.loads(line)
            except json.JSONDecodeError:
                continue


def summarise_trades(trade_path):
    n = 0
    n_open = 0
    wins = 0
    losses = 0
    gross_win_usd = 0.0
    gross_loss_usd = 0.0
    net_usd = 0.0
    sum_win_bps = 0.0
    sum_loss_bps = 0.0
    sum_hold = 0
    per_symbol = {}
    recent = []  # rolling buffer of last TRADE_SAMPLE
    for t in iter_jsonl(trade_path):
        n += 1
        still_open = bool(t.get("still_open"))
        if still_open:
            n_open += 1
        net = float(t.get("net_pnl_usd", 0.0) or 0.0)
        net_bps = float(t.get("net_pnl_bps", 0.0) or 0.0)
        net_usd += net
        if not still_open:
            if net > 0:
                wins += 1
                gross_win_usd += net
                sum_win_bps += net_bps
            elif net < 0:
                losses += 1
                gross_loss_usd += -net
                sum_loss_bps += net_bps
        sum_hold += int(t.get("hold_bars", 0) or 0)
        sym = t.get("symbol", "?")
        ps = per_symbol.setdefault(sym, {"symbol": sym, "trades": 0, "netUsd": 0.0, "wins": 0, "losses": 0})
        ps["trades"] += 1
        ps["netUsd"] += net
        if not still_open:
            if net > 0:
                ps["wins"] += 1
            elif net < 0:
                ps["losses"] += 1
        recent.append({
            "symbol": sym,
            "direction": t.get("direction"),
            "entryTs": t.get("entry_ts"),
            "exitTs": t.get("exit_ts"),
            "entryPrice": t.get("entry_price"),
            "exitPrice": t.get("exit_price"),
            "committedUsd": t.get("committed_capital_usd"),
            "netPnlUsd": round(net, 6),
            "netPnlBps": round(net_bps, 4),
            "holdBars": t.get("hold_bars"),
            "stillOpen": still_open,
        })
        if len(recent) > TRADE_SAMPLE:
            recent.pop(0)

    closed = wins + losses
    decided = closed if closed else 1
    win_rate = round(100.0 * wins / decided, 2) if closed else None
    profit_factor = round(gross_win_usd / gross_loss_usd, 4) if gross_loss_usd > 0 else None
    contrib = sorted(per_symbol.values(), key=lambda x: x["netUsd"], reverse=True)
    for c in contrib:
        c["netUsd"] = round(c["netUsd"], 4)
        cd = c["wins"] + c["losses"]
        c["winRate"] = round(100.0 * c["wins"] / cd, 1) if cd else None
    return {
        "nTrades": n,
        "nOpen": n_open,
        "nClosed": closed,
        "wins": wins,
        "losses": losses,
        "winRatePct": win_rate,
        "profitFactor": profit_factor,
        "netPnlUsd": round(net_usd, 4),
        "grossWinUsd": round(gross_win_usd, 4),
        "grossLossUsd": round(gross_loss_usd, 4),
        "avgWinBps": round(sum_win_bps / wins, 2) if wins else None,
        "avgLossBps": round(sum_loss_bps / losses, 2) if losses else None,
        "avgHoldBars": round(sum_hold / n, 1) if n else None,
        "symbolContribution": contrib,
        "tradeSample": recent,
        "tradeSampleCount": len(recent),
    }


def summarise_missed(path):
    total = 0
    by_reason = {}
    by_symbol = {}
    for m in iter_jsonl(path):
        total += 1
        r = m.get("reason", "?")
        by_reason[r] = by_reason.get(r, 0) + 1
        s = m.get("symbol", "?")
        by_symbol[s] = by_symbol.get(s, 0) + 1
    top_syms = sorted(by_symbol.items(), key=lambda kv: kv[1], reverse=True)[:12]
    return {
        "total": total,
        "byReason": by_reason,
        "topSymbols": [{"symbol": k, "count": v} for k, v in top_syms],
    }


def build_profile(key):
    eq, pos, alloc = parse_profile_key(key)
    pdir = os.path.join(PROFILES_DIR, key)
    label = f"${eq:,} · {pos} pos · {alloc}% alloc" if eq else key
    base = {
        "key": key,
        "label": label,
        "startEquity": eq,
        "maxPositions": pos,
        "maxAllocPct": alloc,
        "slotSizeUsd": round(eq * alloc / 100.0, 2) if eq and alloc else None,
    }
    eqp = os.path.join(pdir, "equity_curve_daily.csv")
    trp = os.path.join(pdir, "trade_log.jsonl")
    msp = os.path.join(pdir, "missed_entries.jsonl")

    if not (os.path.isfile(eqp) and os.path.isfile(trp)):
        base["status"] = "awaiting"
        return base

    curve = load_equity_curve(eqp)
    dd, dd_detail = compute_drawdown(curve)
    trades = summarise_trades(trp)
    missed = summarise_missed(msp) if os.path.isfile(msp) else {"total": 0, "byReason": {}, "topSymbols": []}

    start_eq = curve[0]["equity"] if curve else eq
    end_eq = curve[-1]["equity"] if curve else None
    total_ret = round((end_eq / start_eq - 1.0) * 100.0, 4) if (start_eq and end_eq) else None

    # daily-return based volatility / rough annualised Sharpe (0 rf), diagnostic only
    rets = []
    for i in range(1, len(curve)):
        p0 = curve[i - 1]["equity"]
        if p0:
            rets.append(curve[i]["equity"] / p0 - 1.0)
    sharpe = None
    if len(rets) > 2:
        mean = sum(rets) / len(rets)
        var = sum((r - mean) ** 2 for r in rets) / (len(rets) - 1)
        sd = math.sqrt(var)
        if sd > 0:
            sharpe = round(mean / sd * math.sqrt(365.0), 3)

    hashes = {}
    for name, p in (("equity_curve_daily.csv", eqp), ("trade_log.jsonl", trp), ("missed_entries.jsonl", msp)):
        if os.path.isfile(p):
            hashes[name] = short(sha256_file(p))

    base.update({
        "status": "ready",
        "range": {"startUtc": curve[0]["t"] if curve else None,
                   "endUtc": curve[-1]["t"] if curve else None,
                   "days": len(curve)},
        "summary": {
            "startEquity": round(start_eq, 4) if start_eq else None,
            "endEquity": round(end_eq, 4) if end_eq else None,
            "totalReturnPct": total_ret,
            "maxDrawdownPct": dd_detail["maxDrawdownPct"],
            "maxDrawdownAt": dd_detail["maxDrawdownAt"],
            "sharpeApprox": sharpe,
            "nTrades": trades["nTrades"],
            "nClosed": trades["nClosed"],
            "nOpen": trades["nOpen"],
            "winRatePct": trades["winRatePct"],
            "profitFactor": trades["profitFactor"],
            "netPnlUsd": trades["netPnlUsd"],
            "avgWinBps": trades["avgWinBps"],
            "avgLossBps": trades["avgLossBps"],
            "avgHoldBars": trades["avgHoldBars"],
            "missedEntries": missed["total"],
        },
        "equityCurve": curve,
        "drawdown": dd,
        "symbolContribution": trades["symbolContribution"],
        "tradeSample": trades["tradeSample"],
        "tradeSampleCount": trades["tradeSampleCount"],
        "missed": missed,
        "sourceHashes": hashes,
    })
    return base


def main():
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    exists = os.path.isdir(PROFILES_DIR)

    # union of expected matrix + any profile dirs actually present
    expected = expected_matrix()
    present = sorted(
        [os.path.basename(p) for p in glob.glob(os.path.join(PROFILES_DIR, "*")) if os.path.isdir(p)]
    ) if exists else []
    ordered = expected + [k for k in present if k not in expected]

    profiles = [build_profile(k) for k in ordered]

    # $100,000 reference portfolio (config not specified by Track C spec yet)
    ref_key = "eq100000_reference"
    ref_dir = os.path.join(PROFILES_DIR, ref_key)
    if os.path.isdir(ref_dir):
        ref = build_profile(ref_key)
    else:
        ref = {
            "key": ref_key,
            "label": "$100,000 · reference portfolio",
            "startEquity": 100000,
            "maxPositions": None,
            "maxAllocPct": None,
            "slotSizeUsd": None,
            "status": "awaiting",
        }
    profiles.append(ref)

    ready = [p for p in profiles if p.get("status") == "ready"]
    awaiting = [p for p in profiles if p.get("status") != "ready"]

    out = {
        "schema": "v2_portfolio_lab.v1",
        "track": "TRACK_C_portfolio_matrix",
        "generatedAtUtc": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "sourceRoot": TRACK_C,
        "trackPresent": exists,
        "profileCountExpected": len(profiles),
        "profileCountReady": len(ready),
        "profileCountAwaiting": len(awaiting),
        "profiles": profiles,
        "provenance": {
            "note": "Historical walk-forward simulation (Track C). NOT live or paper trading. "
                    "Every figure is derived from the real Track C output files; profiles not "
                    "yet produced are marked 'awaiting' with no fabricated numbers.",
            "tradeSampleCap": TRADE_SAMPLE,
        },
    }

    with open(OUT, "w") as f:
        json.dump(out, f, separators=(",", ":"))
    out_sha = sha256_file(OUT)
    size_kb = os.path.getsize(OUT) / 1024.0
    print(f"[portfolio-lab] track present={exists}  profiles ready={len(ready)} awaiting={len(awaiting)}")
    for p in profiles:
        st = p.get("status")
        extra = ""
        if st == "ready":
            s = p["summary"]
            extra = f"ret={s['totalReturnPct']}% dd={s['maxDrawdownPct']}% trades={s['nTrades']}"
        print(f"           {p['key']:22s} {st:8s} {extra}")
    print(f"[portfolio-lab] wrote {os.path.relpath(OUT, REPO)}  {size_kb:.0f}KB  sha256={short(out_sha)}")


if __name__ == "__main__":
    main()
