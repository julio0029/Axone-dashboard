#!/usr/bin/env python3
"""
gen_wally_trades.py — Build the Wally historical-research dataset for the dashboard.

READ-ONLY against all Axone evidence. Sole write target: this repo's public/data/.

For each symbol we join three coherent views of the SAME Wally V3 baseline_0.05 walk:
  1. Oracle decision-eval  (retrospective): entry_close/exit_close PRICES, entry/exit
     efficiency, MFE/MAE, mfe_capture_ratio, wally_signal_strength (conviction=dom_w),
     optimal delays, counterfactual, decision-quality score.
  2. all_trades.jsonl      (completed-trade view): actual_pnl_gross/net (bps), cost_bps,
     mfe/mae (bps), mfe_capture, hold_bars/minutes, regime.
  3. per-symbol ledger      (decision-level): opp_w (opposing weight) at ENTER, the count
     of HOLD decisions during the trade, and the exact EXIT decision label.
Prices come from Oracle entry_close/exit_close. Candlesticks come from canonical 5m OHLCV.

Every join is asserted 1:1. Nothing is fabricated: fields genuinely absent are omitted and
surfaced by the UI as "N/A — not recorded".
"""
import json, hashlib, os, sys, datetime as dt
from pathlib import Path
import pyarrow.parquet as pq

# ---- roots (read-only) -----------------------------------------------------
ORACLE   = Path("/Users/julesdevaux/.openclaw/agents/oracle/workspace/EVALUATIONS/oracle_eval_v1_0_0")
BASELINE = Path("/Users/julesdevaux/.openclaw/agents/wally/workspace/EVIDENCE/WALLY_V3_CANDIDATE/baseline_0.05")
OHLCV    = Path("/Users/julesdevaux/.openclaw/workspace/DATA/historical")
OUT      = Path(__file__).resolve().parent.parent / "public" / "data"

SYMBOLS = ["BTCUSDT","ETHUSDT","BNBUSDT","XRPUSDT","SOLUSDT",
           "DOGEUSDT","PEPEUSDT","SHIBUSDT","FETUSDT","SUIUSDT"]

# The variant is a first-class dimension: {id -> ledger source bundle}.
# Future portfolio-simulation variants (Variant C, capital-reallocation runs, ...) are
# added here as new entries; the page reads whatever variants this index advertises.
VARIANT = {
    "id": "baseline_0.05",
    "label": "V3 Baseline (conv 0.05)",
    "oracle_dir": str(ORACLE),
    "trades_file": str(BASELINE / "all_trades.jsonl"),
    "ledger_glob": str(BASELINE / "ledger_{SYM}.jsonl"),
    "note": "Wally V3 candidate walk, conviction-closure baseline 0.05.",
}

PAD_MS = 2 * 86_400_000  # 2-day pad around the trade span for the OHLCV window


def sha256_head(path: Path, limit=64 * 1024 * 1024) -> str:
    """sha256 of up to `limit` bytes — provenance fingerprint for huge ledgers."""
    h = hashlib.sha256()
    with open(path, "rb") as f:
        h.update(f.read(limit))
    return h.hexdigest()


def load_oracle_enters(sym: str):
    """decision_id -> oracle row, restricted to ENTER_* rows (one per completed trade)."""
    out = {}
    with open(ORACLE / f"{sym}_decisions_eval.jsonl") as f:
        for line in f:
            d = json.loads(line)
            if str(d.get("wally_action", "")).startswith("ENTER"):
                out[int(d["timestamp"])] = d
    return out


def load_trades(sym: str):
    out = {}
    with open(BASELINE / "all_trades.jsonl") as f:
        for line in f:
            d = json.loads(line)
            if d["symbol"] == sym:
                out[int(d["entry_ts_ms"])] = d
    return out


def load_ledger(sym: str):
    """Sequentially reconstruct trades from the decision ledger to capture opp_w at ENTER,
    the HOLD count during the position, and the EXIT decision label. Keyed by entry ts."""
    out = {}
    open_ts = None
    hold = 0
    dom_w = opp_w = None
    with open(BASELINE / f"ledger_{sym}.jsonl") as f:
        for line in f:
            d = json.loads(line)
            dec = d["decision"]
            if dec.startswith("ENTER"):
                open_ts = int(d["ts_ms"]); hold = 0
                dom_w = d.get("dom_w"); opp_w = d.get("opp_w")
            elif dec == "HOLD":
                if open_ts is not None:
                    hold += 1
            elif dec.startswith("EXIT"):
                if open_ts is not None:
                    out[open_ts] = {
                        "hold_decisions": hold,
                        "enter_dom_w": dom_w,
                        "enter_opp_w": opp_w,
                        "exit_decision": dec,
                        "exit_dom_w": d.get("dom_w"),
                        "exit_opp_w": d.get("opp_w"),
                    }
                    open_ts = None
    return out


def load_ohlcv_window(sym: str, lo: int, hi: int):
    tbl = pq.read_table(OHLCV / sym / "5m" / "compacted.parquet",
                        columns=["timestamp", "open", "high", "low", "close", "volume"])
    df = tbl.to_pandas()
    ts = (df["timestamp"].astype("int64") // 1_000_000).to_numpy()  # ns -> ms
    mask = (ts >= lo) & (ts <= hi)
    ts = ts[mask]
    o = df["open"].to_numpy()[mask]
    h = df["high"].to_numpy()[mask]
    l = df["low"].to_numpy()[mask]
    c = df["close"].to_numpy()[mask]
    v = df["volume"].to_numpy()[mask]

    def rnd(x):
        ax = abs(x)
        return round(float(x), 8 if ax < 1 else 6 if ax < 100 else 2)

    return {
        "t": [int(x) for x in ts],
        "o": [rnd(x) for x in o],
        "h": [rnd(x) for x in h],
        "l": [rnd(x) for x in l],
        "c": [rnd(x) for x in c],
        "v": [round(float(x), 3) for x in v],
    }


def build_symbol(sym: str):
    oracle = load_oracle_enters(sym)
    trades = load_trades(sym)
    ledger = load_ledger(sym)

    ot, tt = set(oracle), set(trades)
    assert ot == tt, (f"{sym}: oracle ENTER set != all_trades set "
                      f"(oracle-only={len(ot-tt)}, trades-only={len(tt-ot)})")

    rows = []
    for ets in sorted(trades):
        o = oracle[ets]
        t = trades[ets]
        lg = ledger.get(ets, {})
        direction = t["direction"]  # LONG / SHORT
        exit_ts = int(t["exit_ts_ms"])
        assert exit_ts > ets, f"{sym}: non-positive duration at {ets}"
        dom_w = lg.get("enter_dom_w", o.get("wally_signal_strength"))
        opp_w = lg.get("enter_opp_w")
        vote_margin = (dom_w - opp_w) if (dom_w is not None and opp_w is not None) else None
        rows.append({
            "id": o.get("decision_id") or f"{sym}_{ets}_ENTER_{direction}",
            "symbol": sym,
            "direction": direction,
            "entry_ts": ets,
            "exit_ts": exit_ts,
            "entry_price": o.get("entry_close"),
            "exit_price": o.get("exit_close"),
            "hold_bars": t.get("hold_bars"),
            "hold_minutes": t.get("hold_minutes"),
            "regime": t.get("regime"),
            # conviction / vote
            "conviction": dom_w,
            "opp_w": opp_w,
            "vote_margin": round(vote_margin, 4) if vote_margin is not None else None,
            # pnl (bps)
            "pnl_gross": t.get("actual_pnl_gross"),
            "pnl_net": t.get("actual_pnl_net"),
            "cost_bps": t.get("cost_bps"),
            "mfe": t.get("actual_mfe"),
            "mae": t.get("actual_mae"),
            "mfe_capture": t.get("mfe_capture"),
            "hit": bool(t.get("cf_hit")) if t.get("cf_hit") is not None else None,
            # ledger decision context
            "hold_decisions": lg.get("hold_decisions"),
            "exit_decision": lg.get("exit_decision"),
            "exit_type": o.get("exit_type"),
            # oracle retrospective (NOT available to Wally at decision time)
            "oracle": {
                "entry_efficiency": o.get("entry_efficiency"),
                "exit_efficiency": o.get("exit_efficiency"),
                "mfe_capture_ratio": o.get("mfe_capture_ratio"),
                "optimal_direction": o.get("optimal_direction"),
                "optimal_entry_delay_bars": o.get("optimal_entry_delay_bars"),
                "optimal_exit_delay_bars": o.get("optimal_exit_delay_bars"),
                "cf_optimal_action": o.get("cf_optimal_action"),
                "cf_pnl_bps": o.get("cf_pnl_bps"),
                "counterfactual_long_return": o.get("counterfactual_long_return"),
                "counterfactual_short_return": o.get("counterfactual_short_return"),
                "missed_upside": o.get("missed_upside"),
                "missed_downside": o.get("missed_downside"),
                "decision_quality_score": o.get("decision_quality_score"),
                "net_score": o.get("net_score"),
            },
        })

    lo = min(r["entry_ts"] for r in rows) - PAD_MS
    hi = max(r["exit_ts"] for r in rows) + PAD_MS
    ohlcv = load_ohlcv_window(sym, lo, hi)
    assert len(ohlcv["t"]) > 0, f"{sym}: empty OHLCV window"

    prov = {
        "symbol": sym,
        "variant": VARIANT["id"],
        "trade_count": len(rows),
        "oracle_source": f"oracle_eval_v1_0_0/{sym}_decisions_eval.jsonl",
        "trades_source": "WALLY_V3_CANDIDATE/baseline_0.05/all_trades.jsonl",
        "ledger_source": f"WALLY_V3_CANDIDATE/baseline_0.05/ledger_{sym}.jsonl",
        "ohlcv_source": f"DATA/historical/{sym}/5m/compacted.parquet",
        "oracle_sha256_head": sha256_head(ORACLE / f"{sym}_decisions_eval.jsonl"),
        "ledger_sha256_head": sha256_head(BASELINE / f"ledger_{sym}.jsonl"),
        "window_start": dt.datetime.utcfromtimestamp(ohlcv["t"][0] / 1000).isoformat() + "Z",
        "window_end": dt.datetime.utcfromtimestamp(ohlcv["t"][-1] / 1000).isoformat() + "Z",
        "ohlcv_bars": len(ohlcv["t"]),
        "ledger_matched": sum(1 for r in rows if r["hold_decisions"] is not None),
    }
    return {"symbol": sym, "variant": VARIANT["id"], "ohlcv": ohlcv,
            "trades": rows, "provenance": prov}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    index = {
        "generated_at": dt.datetime.utcnow().isoformat() + "Z",
        "variants": [VARIANT],
        "symbols": [],
        "note": ("WALLY HISTORICAL RESEARCH — historical simulation only, "
                 "no live/paper trades executed."),
    }
    for sym in SYMBOLS:
        try:
            data = build_symbol(sym)
        except FileNotFoundError as e:
            print(f"  SKIP {sym}: {e}")
            continue
        p = OUT / f"wally_trades_{sym.lower()}.json"
        p.write_text(json.dumps(data, separators=(",", ":")))
        mb = p.stat().st_size / 1e6
        index["symbols"].append({
            "symbol": sym,
            "trade_count": data["provenance"]["trade_count"],
            "ohlcv_bars": data["provenance"]["ohlcv_bars"],
            "window_start": data["provenance"]["window_start"],
            "window_end": data["provenance"]["window_end"],
        })
        print(f"  OK  {sym}: {data['provenance']['trade_count']} trades, "
              f"{data['provenance']['ohlcv_bars']} bars, {mb:.1f} MB")
    (OUT / "wally_index.json").write_text(json.dumps(index, indent=1))
    total = sum(s["trade_count"] for s in index["symbols"])
    print(f"DONE: {len(index['symbols'])} symbols, {total} trades total -> {OUT}")


if __name__ == "__main__":
    main()
