export const config = { runtime: 'edge' };

const TD_KEY = "3756d0bde86c420495eb067177adefca";

const PAIRS = [
  { pair: "XAUUSD", sym: "XAU/USD" },
  { pair: "EURUSD", sym: "EUR/USD" },
  { pair: "USDJPY", sym: "USD/JPY" },
  { pair: "GBPUSD", sym: "GBP/USD" },
  { pair: "BTCUSD", sym: "BTC/USD" },
  { pair: "OIL",    sym: "WTI/USD" },
];

function evaluateSignal(candles) {
  if (!candles || candles.length < 5) return null;

  // candles[0] = most recent, candles[4] = 5 bars ago (entry bar)
  const entry   = candles[4];
  const current = candles[0];
  if (!entry || !current) return null;

  const entryPrice   = parseFloat(entry.close);
  const currentPrice = parseFloat(current.close);
  const highSince    = Math.max(...candles.slice(0, 4).map(c => parseFloat(c.high)));
  const lowSince     = Math.min(...candles.slice(0, 4).map(c => parseFloat(c.low)));

  // Determine signal direction from EMA crossover approximation
  const ema5 = candles.slice(0, 5).reduce((s, c) => s + parseFloat(c.close), 0) / 5;
  const ema10 = candles.slice(0, Math.min(10, candles.length)).reduce((s, c) => s + parseFloat(c.close), 0) / Math.min(10, candles.length);

  const action = ema5 > ema10 ? "BUY" : "SELL";

  // Calculate pip size
  const isJPY    = false;
  const isGold   = entry.symbol === "XAU/USD";
  const isCrypto = ["BTC/USD"].includes(entry.symbol);
  const pipSize  = isGold ? 0.1 : isCrypto ? 1 : isJPY ? 0.01 : 0.0001;

  // Evaluate result
  let result = "neutral";
  let pips = 0;

  if (action === "BUY") {
    pips = Math.round((currentPrice - entryPrice) / pipSize);
    if (pips > 5) result = "profit";
    else if (pips < -5) result = "loss";
  } else {
    pips = Math.round((entryPrice - currentPrice) / pipSize);
    if (pips > 5) result = "profit";
    else if (pips < -5) result = "loss";
  }

  const fmt = (v, sym) => {
    if (sym === "XAU/USD" || sym === "WTI/USD") return parseFloat(v).toFixed(2);
    if (sym === "BTC/USD") return parseFloat(v).toFixed(0);
    return parseFloat(v).toFixed(5);
  };

  return {
    pair: entry.symbol,
    action,
    entryPrice: fmt(entryPrice, entry.symbol),
    currentPrice: fmt(currentPrice, entry.symbol),
    pips: (pips > 0 ? "+" : "") + pips,
    result,
    datetime: entry.datetime,
    high: fmt(highSince, entry.symbol),
    low: fmt(lowSince, entry.symbol),
  };
}

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const tf = searchParams.get('tf') || 'H1';
  const tfMap = { M15:'15min', M30:'30min', H1:'1h', H4:'4h', D1:'1day' };
  const interval = tfMap[tf] || '1h';

  try {
    const histories = await Promise.all(
      PAIRS.map(({ pair, sym }) =>
        fetch(`https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(sym)}&interval=${interval}&outputsize=10&apikey=${TD_KEY}`)
          .then(r => r.json())
          .then(d => {
            if (!d.values) return null;
            const candles = d.values.map(v => ({ ...v, symbol: sym }));
            const evaluated = evaluateSignal(candles);
            return evaluated ? { ...evaluated, pair } : null;
          })
          .catch(() => null)
      )
    );

    const results = histories.filter(Boolean).sort((a, b) =>
      new Date(b.datetime) - new Date(a.datetime)
    );

    return new Response(JSON.stringify({ history: results }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 's-maxage=120',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, history: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
