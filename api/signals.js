export const config = { runtime: 'edge' };

const TD_KEY = "3756d0bde86c420495eb067177adefca";

async function fetchIndicator(symbol, indicator, params = "") {
  const url = `https://api.twelvedata.com/${indicator}?symbol=${encodeURIComponent(symbol)}&interval=15min&apikey=${TD_KEY}&outputsize=3${params}`;
  const res = await fetch(url);
  return res.json();
}

function calcAction(rsi, emaFast, emaSlow, price) {
  const pricef = parseFloat(price);
  const rsif = parseFloat(rsi);
  const ef = parseFloat(emaFast);
  const es = parseFloat(emaSlow);
  if (isNaN(rsif) || isNaN(ef) || isNaN(es)) return { action: "WAIT", strength: 50 };

  let score = 0;
  if (ef > es) score += 30; else score -= 30;
  if (pricef > ef) score += 20; else score -= 20;
  if (rsif < 40) score += 25;
  else if (rsif > 60) score -= 25;
  else score += 0;

  if (score >= 30) return { action: "BUY", strength: Math.min(95, 60 + score) };
  if (score <= -30) return { action: "SELL", strength: Math.min(95, 60 + Math.abs(score)) };
  return { action: "WAIT", strength: 50 };
}

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol') || 'XAU/USD';
  const tf = searchParams.get('tf') || 'M15';

  const tfMap = { M1:'1min', M5:'5min', M15:'15min', M30:'30min', H1:'1h', H4:'4h', D1:'1day' };
  const interval = tfMap[tf] || '15min';

  try {
    const [priceData, rsiData, ema9Data, ema21Data] = await Promise.all([
      fetch(`https://api.twelvedata.com/price?symbol=${encodeURIComponent(symbol)}&apikey=${TD_KEY}`).then(r => r.json()),
      fetch(`https://api.twelvedata.com/rsi?symbol=${encodeURIComponent(symbol)}&interval=${interval}&time_period=14&apikey=${TD_KEY}&outputsize=1`).then(r => r.json()),
      fetch(`https://api.twelvedata.com/ema?symbol=${encodeURIComponent(symbol)}&interval=${interval}&time_period=9&apikey=${TD_KEY}&outputsize=1`).then(r => r.json()),
      fetch(`https://api.twelvedata.com/ema?symbol=${encodeURIComponent(symbol)}&interval=${interval}&time_period=21&apikey=${TD_KEY}&outputsize=1`).then(r => r.json()),
    ]);

    const price = priceData.price || "0";
    const rsi = rsiData.values?.[0]?.rsi || "50";
    const emaFast = ema9Data.values?.[0]?.ema || price;
    const emaSlow = ema21Data.values?.[0]?.ema || price;
    const { action, strength } = calcAction(rsi, emaFast, emaSlow, price);

    return new Response(JSON.stringify({
      symbol, price, rsi: parseFloat(rsi).toFixed(2),
      ema9: parseFloat(emaFast).toFixed(2),
      ema21: parseFloat(emaSlow).toFixed(2),
      action, strength,
      basis: "EMA9/EMA21 + RSI14",
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 's-maxage=60',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
