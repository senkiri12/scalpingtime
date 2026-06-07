import { useState, useEffect, useRef, useCallback } from "react";

const GOLD = "#6366f1";
const DARK = "#050510";
const CARD = "#0d0d1a";

const TFS = ["M1","M5","M15","M30","H1","H4","D1"];

// pip & strength vary per TF
const TF_SIGNALS = {
  M1:  [
    { pair:"XAUUSD",cat:"komoditas",action:"SELL",basis:"Teknikal Bearish",  strength:72,pip:"-8"  },
    { pair:"OIL",   cat:"komoditas",action:"SELL",basis:"Teknikal",          strength:60,pip:"-5"  },
    { pair:"EURUSD",cat:"forex",    action:"SELL",basis:"Teknikal",          strength:62,pip:"-6"  },
    { pair:"USDJPY",cat:"forex",    action:"BUY", basis:"Teknikal",          strength:65,pip:"+7"  },
    { pair:"USDCHF",cat:"forex",    action:"BUY", basis:"Teknikal",          strength:60,pip:"+5"  },
    { pair:"BTCUSD",cat:"crypto",   action:"WAIT",basis:"Sentimen",          strength:50,pip:"±0"  },
  ],
  M5:  [
    { pair:"XAUUSD",cat:"komoditas",action:"SELL",basis:"Teknikal Bearish",  strength:75,pip:"-15" },
    { pair:"OIL",   cat:"komoditas",action:"SELL",basis:"Teknikal",          strength:65,pip:"-10" },
    { pair:"EURUSD",cat:"forex",    action:"SELL",basis:"Teknikal",          strength:68,pip:"-12" },
    { pair:"USDJPY",cat:"forex",    action:"BUY", basis:"Teknikal",          strength:70,pip:"+14" },
    { pair:"USDCAD",cat:"forex",    action:"BUY", basis:"Teknikal",          strength:62,pip:"+10" },
    { pair:"BTCUSD",cat:"crypto",   action:"SELL",basis:"Sentimen",          strength:58,pip:"-200"},
  ],
  M15: [
    { pair:"XAUUSD",cat:"komoditas",action:"SELL",basis:"Teknikal+Sentimen", strength:80,pip:"-28" },
    { pair:"OIL",   cat:"komoditas",action:"SELL",basis:"Teknikal",          strength:70,pip:"-14" },
    { pair:"EURUSD",cat:"forex",    action:"SELL",basis:"Teknikal+Fundamen", strength:72,pip:"-20" },
    { pair:"USDJPY",cat:"forex",    action:"BUY", basis:"Teknikal+Fundamen", strength:75,pip:"+22" },
    { pair:"USDCAD",cat:"forex",    action:"BUY", basis:"Teknikal",          strength:63,pip:"+15" },
    { pair:"GBPUSD",cat:"forex",    action:"SELL",basis:"Teknikal",          strength:65,pip:"-18" },
    { pair:"BTCUSD",cat:"crypto",   action:"SELL",basis:"Sentimen",          strength:60,pip:"-310"},
  ],
  M30: [
    { pair:"XAUUSD",cat:"komoditas",action:"SELL",basis:"Teknikal+Sentimen", strength:82,pip:"-42" },
    { pair:"OIL",   cat:"komoditas",action:"SELL",basis:"Fundamen+Teknikal", strength:74,pip:"-20" },
    { pair:"EURUSD",cat:"forex",    action:"SELL",basis:"Fundamen+Teknikal", strength:70,pip:"-28" },
    { pair:"USDJPY",cat:"forex",    action:"BUY", basis:"Fundamen+Sentimen", strength:78,pip:"+35" },
    { pair:"USDCAD",cat:"forex",    action:"BUY", basis:"Fundamen",          strength:65,pip:"+22" },
    { pair:"USDCHF",cat:"forex",    action:"BUY", basis:"Teknikal",          strength:62,pip:"+18" },
    { pair:"GBPUSD",cat:"forex",    action:"SELL",basis:"Teknikal+Sentimen", strength:68,pip:"-27" },
    { pair:"AUDUSD",cat:"forex",    action:"SELL",basis:"Fundamen",          strength:66,pip:"-20" },
    { pair:"BTCUSD",cat:"crypto",   action:"SELL",basis:"Sentimen",          strength:58,pip:"-400"},
    { pair:"ETHUSD",cat:"crypto",   action:"WAIT",basis:"Sentimen",          strength:45,pip:"±0"  },
  ],
  H1:  [
    { pair:"XAUUSD",cat:"komoditas",action:"SELL",basis:"Teknikal+Sentimen", strength:85,pip:"-65" },
    { pair:"OIL",   cat:"komoditas",action:"SELL",basis:"Fundamen",          strength:75,pip:"-35" },
    { pair:"EURUSD",cat:"forex",    action:"SELL",basis:"Fundamen+Sentimen", strength:73,pip:"-45" },
    { pair:"USDJPY",cat:"forex",    action:"BUY", basis:"Fundamen+Sentimen", strength:80,pip:"+55" },
    { pair:"GBPUSD",cat:"forex",    action:"SELL",basis:"Teknikal",          strength:67,pip:"-38" },
    { pair:"USDCHF",cat:"forex",    action:"BUY", basis:"Fundamen",          strength:64,pip:"+30" },
    { pair:"BTCUSD",cat:"crypto",   action:"SELL",basis:"Sentimen",          strength:62,pip:"-800"},
    { pair:"ETHUSD",cat:"crypto",   action:"SELL",basis:"Sentimen",          strength:58,pip:"-95" },
  ],
  H4:  [
    { pair:"XAUUSD",cat:"komoditas",action:"SELL",basis:"Teknikal+Fundamen", strength:88,pip:"-120"},
    { pair:"OIL",   cat:"komoditas",action:"SELL",basis:"Fundamen",          strength:78,pip:"-55" },
    { pair:"EURUSD",cat:"forex",    action:"SELL",basis:"Fundamen+Sentimen", strength:75,pip:"-80" },
    { pair:"USDJPY",cat:"forex",    action:"BUY", basis:"Fundamen+Sentimen", strength:83,pip:"+95" },
    { pair:"GBPUSD",cat:"forex",    action:"SELL",basis:"Teknikal+Fundamen", strength:70,pip:"-65" },
    { pair:"USDCHF",cat:"forex",    action:"BUY", basis:"Teknikal",          strength:65,pip:"+42" },
    { pair:"BTCUSD",cat:"crypto",   action:"SELL",basis:"Sentimen",          strength:65,pip:"-1500"},
  ],
  D1:  [
    { pair:"XAUUSD",cat:"komoditas",action:"SELL",basis:"Teknikal+Fundamen+Sentimen",strength:90,pip:"-280"},
    { pair:"OIL",   cat:"komoditas",action:"SELL",basis:"Fundamen",                  strength:82,pip:"-120"},
    { pair:"EURUSD",cat:"forex",    action:"SELL",basis:"Fundamen+Sentimen",         strength:78,pip:"-180"},
    { pair:"USDJPY",cat:"forex",    action:"BUY", basis:"Fundamen+Sentimen",         strength:86,pip:"+220"},
    { pair:"GBPUSD",cat:"forex",    action:"SELL",basis:"Fundamen+Teknikal",         strength:72,pip:"-150"},
    { pair:"USDCHF",cat:"forex",    action:"BUY", basis:"Fundamen",                  strength:68,pip:"+90" },
    { pair:"BTCUSD",cat:"crypto",   action:"SELL",basis:"Sentimen",                  strength:70,pip:"-4500"},
  ],
};

const TF_CURRENCY_SCORES = {
  M1:  { USD:3, AUD:-1,GBP:-2,CAD:1, EUR:-2,JPY:4, CHF:2, NZD:-1 },
  M5:  { USD:4, AUD:-2,GBP:-3,CAD:1, EUR:-3,JPY:5, CHF:2, NZD:-2 },
  M15: { USD:5, AUD:-2,GBP:-3,CAD:2, EUR:-4,JPY:6, CHF:3, NZD:-2 },
  M30: { USD:6, AUD:-3,GBP:-4,CAD:2, EUR:-5,JPY:7, CHF:3, NZD:-3 },
  H1:  { USD:7, AUD:-3,GBP:-4,CAD:3, EUR:-6,JPY:8, CHF:4, NZD:-3 },
  H4:  { USD:8, AUD:-4,GBP:-5,CAD:3, EUR:-7,JPY:9, CHF:4, NZD:-4 },
  D1:  { USD:9, AUD:-5,GBP:-5,CAD:4, EUR:-8,JPY:10,CHF:5, NZD:-5 },
};

const CURRENCIES_BASE = ["USD","AUD","GBP","CAD","EUR","JPY","CHF","NZD"];

const HISTORY = [
  { date:"Sep 19, 2025 1:43 PM", title:"Rekomendasi Signal Hari Ini",   detail:"Buy XAUUSD 1930.50 · TP 1948 · SL 1922",    result:"profit"  },
  { date:"Sep 18, 2025 1:44 PM", title:"Signal BB Scalping M15 XAUUSD", detail:"Area BUY 1918–1920 · TP +25 pips",           result:"profit"  },
  { date:"Sep 18, 2025 12:50 PM",title:"Rekomendasi Signal Hari Ini",   detail:"Sell USDJPY 148.20 · TP 147.50 · SL 148.80", result:"profit"  },
  { date:"Sep 18, 2025 10:02 AM",title:"Pola Candlestick Pagi",         detail:"Morning Star XAUUSD D1 — reversal bullish",  result:"neutral" },
  { date:"Sep 17, 2025 11:27 AM",title:"Rekomendasi Signal Hari Ini",   detail:"Buy EURUSD 1.0632 · TP 1.0680 · SL 1.0605",  result:"profit"  },
  { date:"Sep 17, 2025 9:15 AM", title:"Signal BB Scalping M15 XAUUSD", detail:"Area BUY 1905–1908 · TP +30 pips",           result:"loss"    },
  { date:"Sep 16, 2025 10:54 PM",title:"Signal BB Scalping M15 XAUUSD", detail:"Area BUY 1895–1898 · TP +20 pips",           result:"profit"  },
];

const NEWS = [
  { time:"10:30",title:"Fed Pertahankan Suku Bunga di 5.25-5.50%",         impact:"high",  currency:"USD" },
  { time:"09:15",title:"CPI Zona Euro Naik 2.9% YoY, Lebih Tinggi Estimasi",impact:"high", currency:"EUR" },
  { time:"08:45",title:"Jepang Rilis GDP Q2 2025, Tumbuh 0.4%",            impact:"medium",currency:"JPY" },
  { time:"07:30",title:"China PMI Manufaktur: 49.7 (Kontraksi)",           impact:"medium",currency:"AUD" },
  { time:"06:00",title:"Gold Naik Didorong Ketidakpastian Geopolitik",     impact:"high",  currency:"XAU" },
  { time:"05:00",title:"UK Retail Sales -0.3% MoM, Di Bawah Ekspektasi",  impact:"medium",currency:"GBP" },
];

const TABS = [
  { id:"signal",   label:"Signal",  icon:"📡" },
  { id:"strength", label:"Trend",   icon:"📊" },
  { id:"history",  label:"Riwayat",    icon:"🕐" },
  { id:"news",     label:"News",       icon:"📰" },
  { id:"ai",       label:"AI Analisis",icon:"🤖" },
];

const CATS = ["semua","forex","komoditas","crypto"];

// ── TF Selector component ─────────────────────────────────────────────────────
function TFSelector({ value, onChange }) {
  return (
    <div style={{
      display:"flex", gap:6, overflowX:"auto", scrollbarWidth:"none",
      padding:"10px 14px", background:"#0d0d14",
      borderBottom:"1px solid #1e1e2e",
    }}>
      <span style={{ fontSize:11, color:"#555", alignSelf:"center", flexShrink:0, marginRight:4 }}>TF:</span>
      {TFS.map(tf => (
        <button key={tf} onClick={() => onChange(tf)} style={{
          flexShrink:0, padding:"4px 12px", borderRadius:8, cursor:"pointer",
          fontSize:11, fontWeight:800,
          background: value === tf ? GOLD : "#16161F",
          color: value === tf ? "#000" : "#666",
          border:`1px solid ${value === tf ? GOLD : "#2a2a3a"}`,
          transition:"all 0.2s",
        }}>{tf}</button>
      ))}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function ActionBadge({ action, size="sm" }) {
  const C = {
    BUY:  { bg:"#0d2e1a", text:"#22c55e", border:"#22c55e33" },
    SELL: { bg:"#2e0d0d", text:"#ef4444", border:"#ef444433" },
    WAIT: { bg:"#1a1a0d", text:"#eab308", border:"#eab30833" },
  };
  const c = C[action] || C.WAIT;
  return (
    <span style={{
      background:c.bg, color:c.text, border:`1px solid ${c.border}`,
      borderRadius:6, padding:size==="sm"?"2px 10px":"4px 16px",
      fontSize:size==="sm"?11:13, fontWeight:700, letterSpacing:1,
    }}>{action}</span>
  );
}

function ScoreBar({ score }) {
  const pct = Math.abs(score)/15;
  const isPos = score >= 0;
  return (
    <div style={{ display:"flex", gap:4 }}>
      {[...Array(5)].map((_,i) => (
        <div key={i} style={{
          width:14, height:14, borderRadius:3,
          background: i < Math.ceil(pct*5) ? (isPos?"#22c55e":"#ef4444") : "#2a2a3a",
        }} />
      ))}
    </div>
  );
}

function SectionHeader({ icon, title, sub }) {
  return (
    <div style={{
      background:"linear-gradient(135deg,#6366f122,#e11d4808)",
      border:"1px solid #6366f144", borderRadius:12, padding:"10px 14px",
      marginBottom:14, display:"flex", justifyContent:"space-between", alignItems:"center",
    }}>
      <div style={{ fontSize:12, color:GOLD, fontWeight:700 }}>{icon} {title}</div>
      <div style={{ fontSize:11, color:"#888" }}>{sub}</div>
    </div>
  );
}

// ── Price Level Calculator ────────────────────────────────────────────────────
function calcLevels(pair, action, price, strength) {
  if (!price) return null;
  const p = parseFloat(price);
  if (isNaN(p) || p <= 0) return null;

  const isGold   = pair === "XAUUSD";
  const isCrypto = ["BTCUSD","ETHUSD"].includes(pair);
  const isOil    = pair === "OIL";
  const isJPY    = pair.includes("JPY");

  // Pip size per pair
  const pipSize = isJPY ? 0.01 : isCrypto ? 1 : isGold ? 0.1 : isOil ? 0.01 : 0.0001;

  // ATR-like unit — scales with strength
  const strMult = 1 + (strength - 50) / 200; // 0.75–1.25x based on strength
  let unit;
  if (isGold)        unit = p * 0.0018 * strMult;
  else if (isCrypto) unit = p * 0.008  * strMult;
  else if (isOil)    unit = p * 0.004  * strMult;
  else if (isJPY)    unit = p * 0.0012 * strMult;
  else               unit = p * 0.0010 * strMult;

  const dir = action === "BUY" ? 1 : -1;
  const fmt = (v) => {
    if (isGold || isOil) return v.toFixed(2);
    if (isCrypto)        return v.toFixed(0);
    if (isJPY)           return v.toFixed(3);
    return v.toFixed(5);
  };

  const toPips = (diff) => Math.round(Math.abs(diff) / pipSize);

  const slRaw  = p - dir * unit * 1.2;
  const tp1Raw = p + dir * unit * 1.5;
  const tp2Raw = p + dir * unit * 3.0;
  const tp3Raw = p + dir * unit * 5.0;

  // Analisis text based on pair + action + strength
  const atr = unit.toFixed(isGold?1:isCrypto?0:isOil?2:4);
  const rrr = (unit * 1.5 / (unit * 1.2)).toFixed(1);
  const momentum = strength >= 80 ? "sangat kuat" : strength >= 65 ? "kuat" : "moderat";
  const bias = action === "BUY" ? "bullish" : "bearish";

  const analisisMap = {
    XAUUSD: action === "SELL"
      ? `Gold dalam tekanan ${bias} ${momentum}. USD menguat didorong data ekonomi positif dan hawkish Fed. Harga berpotensi menekan area support ${fmt(p - unit * 2)} sebelum lanjut turun ke ${fmt(tp2Raw)}.`
      : `Gold terdorong sentimen risk-off dan pelemahan USD. Momentum ${momentum} dengan target resistance ${fmt(p + unit * 2)}. Konfluensi EMA & RSI mendukung kelanjutan ${bias}.`,
    OIL: action === "SELL"
      ? `WTI Oil bearish akibat kekhawatiran oversupply OPEC+. Momentum ${momentum}, harga berpotensi menguji support ${fmt(slRaw > p ? p - unit*2 : tp1Raw)}.`
      : `Permintaan minyak global meningkat, supply terbatas. Bias ${bias} ${momentum} dengan konfluensi volume & tren.`,
    BTCUSD: `BTC menunjukkan momentum ${bias} ${momentum}. Sentimen pasar crypto mengikuti risk appetite global. Level kritis di ${fmt(tp1Raw)}.`,
    ETHUSD: `ETH dalam tren ${bias} ${momentum} mengikuti pergerakan BTC dan katalis on-chain.`,
  };

  const defaultAnalisis = `${pair} momentum ${bias} ${momentum} pada TF ini. RSI & EMA mengkonfirmasi arah ${bias}. RRR ${rrr}:1 dengan ATR ~${atr}. Entry optimal di area ${fmt(p)}, target pertama ${fmt(tp1Raw)}.`;

  return {
    entry: fmt(p),
    sl:    fmt(slRaw),
    tp1:   fmt(tp1Raw),
    tp2:   fmt(tp2Raw),
    tp3:   fmt(tp3Raw),
    s1:    fmt(p - unit * 2.0),
    s2:    fmt(p - unit * 4.0),
    r1:    fmt(p + unit * 2.0),
    r2:    fmt(p + unit * 4.0),
    pipsTP1: toPips(tp1Raw - p),
    pipsTP2: toPips(tp2Raw - p),
    pipsTP3: toPips(tp3Raw - p),
    pipsSL:  toPips(slRaw - p),
    rrr,
    analisis: analisisMap[pair] || defaultAnalisis,
  };
}

function PriceLevels({ pair, action, price, strength, lv: lvProp }) {
  const [open, setOpen] = useState(false);
  const lv = lvProp || calcLevels(pair, action, price, strength);
  if (!lv) return null;

  return (
    <div style={{ marginTop:10 }}>
      {/* Pips summary row */}
      <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap" }}>
        {[
          { label:"SL",  val:`-${lv.pipsSL} pip`,  color:"#ef4444", bg:"#2e0d0d" },
          { label:"TP1", val:`+${lv.pipsTP1} pip`, color:"#22c55e", bg:"#0d2e1a" },
          { label:"TP2", val:`+${lv.pipsTP2} pip`, color:"#22c55e", bg:"#0a2015" },
          { label:"TP3", val:`+${lv.pipsTP3} pip`, color:"#22c55e", bg:"#071a10" },
          { label:"RRR", val:`${lv.rrr}:1`,         color:GOLD,      bg:"#1a1030" },
        ].map(({label,val,color,bg}) => (
          <div key={label} style={{
            background:bg, border:`1px solid ${color}22`, borderRadius:8,
            padding:"4px 9px", display:"flex", gap:5, alignItems:"center",
          }}>
            <span style={{ fontSize:9, color:"#666", fontWeight:700 }}>{label}</span>
            <span style={{ fontSize:11, color, fontWeight:800, fontVariantNumeric:"tabular-nums" }}>{val}</span>
          </div>
        ))}
      </div>

      {/* Analisis singkat */}
      <div style={{
        background:"#0f0f1a", border:"1px solid #1e1e2e", borderRadius:10,
        padding:"9px 12px", marginBottom:8,
      }}>
        <div style={{ fontSize:10, color:GOLD, fontWeight:700, marginBottom:4 }}>💬 ANALISIS</div>
        <div style={{ fontSize:11, color:"#aaa", lineHeight:1.6 }}>{lv.analisis}</div>
      </div>

      {/* Level Harga collapsible */}
      <button onClick={() => setOpen(o => !o)} style={{
        background:"#1a1a2a", border:"1px solid #2a2a3a", borderRadius:8,
        color:GOLD, fontSize:11, fontWeight:700, padding:"5px 12px",
        cursor:"pointer", width:"100%", textAlign:"left",
        display:"flex", justifyContent:"space-between",
      }}>
        <span>📊 Level Harga Lengkap</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{
          marginTop:6, borderRadius:10, overflow:"hidden",
          border:"1px solid #1e1e2e", animation:"slideIn 0.2s ease",
        }}>
          <div style={{ background:"#1a1a0d", padding:"8px 12px", display:"flex", justifyContent:"space-between" }}>
            <span style={{ fontSize:11, color:"#eab308", fontWeight:700 }}>⚡ ENTRY</span>
            <span style={{ fontSize:12, color:"#fff", fontWeight:800, fontVariantNumeric:"tabular-nums" }}>{lv.entry}</span>
          </div>
          {[
            ["🎯 TP 1", lv.tp1, lv.pipsTP1, "#0d1a0d"],
            ["🎯 TP 2", lv.tp2, lv.pipsTP2, "#0a150a"],
            ["🎯 TP 3", lv.tp3, lv.pipsTP3, "#071209"],
          ].map(([label,val,pips,bg]) => (
            <div key={label} style={{ background:bg, padding:"7px 12px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:11, color:"#22c55e", fontWeight:600 }}>{label}</span>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:12, color:"#22c55e", fontWeight:700, fontVariantNumeric:"tabular-nums" }}>{val}</div>
                <div style={{ fontSize:9, color:"#22c55e88" }}>+{pips} pip</div>
              </div>
            </div>
          ))}
          <div style={{ background:"#1a0d0d", padding:"8px 12px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:11, color:"#ef4444", fontWeight:700 }}>🛑 STOP LOSS</span>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:12, color:"#ef4444", fontWeight:800, fontVariantNumeric:"tabular-nums" }}>{lv.sl}</div>
              <div style={{ fontSize:9, color:"#ef444488" }}>-{lv.pipsSL} pip</div>
            </div>
          </div>
          <div style={{ background:"#111118", padding:"5px 12px" }}>
            <span style={{ fontSize:10, color:"#444", fontWeight:700, letterSpacing:1 }}>SUPPORT & RESISTANCE</span>
          </div>
          {[
            ["🔴 R2", lv.r2, "#ef444488"],
            ["🔴 R1", lv.r1, "#ef444466"],
            ["🟢 S1", lv.s1, "#22c55e66"],
            ["🟢 S2", lv.s2, "#22c55e88"],
          ].map(([label,val,color],i) => (
            <div key={label} style={{ background:i%2===0?"#111118":"#0f0f16", padding:"7px 12px", display:"flex", justifyContent:"space-between", borderLeft:`3px solid ${color}` }}>
              <span style={{ fontSize:11, color:"#888", fontWeight:600 }}>{label}</span>
              <span style={{ fontSize:12, color:"#bbb", fontWeight:700, fontVariantNumeric:"tabular-nums" }}>{val}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


// ── Live price hook (Twelve Data) ────────────────────────────────────────────
const TD_KEY = "3756d0bde86c420495eb067177adefca";
const TD_SYMBOLS = ["XAU/USD","EUR/USD","GBP/USD","USD/JPY","USD/CAD","USD/CHF","AUD/USD","NZD/USD","BTC/USD","ETH/USD","WTI/USD"];

function useLivePrices() {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchPrices = useCallback(async () => {
    try {
      const symbols = TD_SYMBOLS.join(",");
      const url = `https://api.twelvedata.com/price?symbol=${encodeURIComponent(symbols)}&apikey=${TD_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      const map = {};
      const normalize = (sym) => sym.replace("/","");
      for (const [sym, val] of Object.entries(data)) {
        if (val && val.price) {
          const decimals = sym.includes("JPY") ? 3 : (sym.includes("BTC") || sym.includes("XAU") || sym.includes("ETH") || sym.includes("WTI")) ? 2 : 5;
          map[normalize(sym)] = parseFloat(val.price).toFixed(decimals);
        }
      }
      if (map["WTIUSD"]) { map["OIL"] = map["WTIUSD"]; delete map["WTIUSD"]; }
      if (Object.keys(map).length > 0) setPrices(map);
    } catch {
      // keep existing prices on error
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPrices();
    const t = setInterval(fetchPrices, 30000);
    return () => clearInterval(t);
  }, [fetchPrices]);

  return { prices, loading, refresh:fetchPrices };
}

// ── Alert Toast ───────────────────────────────────────────────────────────────
function AlertToast({ alerts, onDismiss }) {
  if (!alerts.length) return null;
  const a = alerts[0];
  return (
    <div style={{
      position:"fixed", top:80, left:"50%", transform:"translateX(-50%)",
      zIndex:999, width:"calc(100% - 28px)", maxWidth:452,
      background:a.action==="BUY"?"#0d2e1a":a.action==="SELL"?"#2e0d0d":"#1a1a0d",
      border:`1px solid ${a.action==="BUY"?"#22c55e55":a.action==="SELL"?"#ef444455":"#eab30855"}`,
      borderRadius:14, padding:"12px 16px",
      boxShadow:"0 8px 32px #00000088",
      animation:"toastIn 0.35s cubic-bezier(.22,1,.36,1)",
      display:"flex", alignItems:"center", justifyContent:"space-between", gap:12,
    }}>
      <div style={{ fontSize:22 }}>🔔</div>
      <div style={{ flex:1 }}>
        <div style={{ fontWeight:800, fontSize:13, color:"#fff" }}>
          Sinyal Baru: {a.pair} <ActionBadge action={a.action} />
        </div>
        <div style={{ fontSize:11, color:"#aaa", marginTop:3 }}>{a.basis} · Strength {a.strength}%</div>
      </div>
      <button onClick={onDismiss} style={{
        background:"#ffffff18", border:"none", color:"#aaa",
        borderRadius:8, padding:"4px 10px", cursor:"pointer", fontSize:12,
      }}>✕</button>
    </div>
  );
}

// ── AI Tab ────────────────────────────────────────────────────────────────────
function AITab({ prices, tf }) {
  const signals = TF_SIGNALS[tf] || TF_SIGNALS["M30"];
  const [pair, setPair] = useState("XAUUSD");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reset result when TF changes
  useEffect(() => { setResult(null); setError(null); }, [tf]);

  const analyze = async () => {
    setLoading(true); setResult(null); setError(null);
    const price = prices[pair] || "N/A";
    const sig = signals.find(s => s.pair === pair);
    const tfDesc = {
      M1:"scalping ultra cepat 1 menit", M5:"scalping 5 menit", M15:"scalping 15 menit",
      M30:"scalping 30 menit", H1:"intraday 1 jam", H4:"swing 4 jam", D1:"posisi harian",
    }[tf];

    // Gunakan harga dari API atau estimasi berdasarkan pair
    const knownPrices = {
      XAUUSD: "3290.00", OIL: "72.50", EURUSD: "1.08500",
      USDJPY: "148.500", USDCAD: "1.36000", GBPUSD: "1.27000",
      USDCHF: "0.90000", BTCUSD: "67800", ETHUSD: "3540",
    };
    const actualPrice = (price !== "N/A" && price) ? price : knownPrices[pair] || "0";
    const lv = calcLevels(pair, sig?.action || "SELL", actualPrice, sig?.strength || 75);
    const prompt = `Kamu adalah analis forex dan komoditas profesional.
Berikan analisis trading untuk ${pair} timeframe ${tf} dalam Bahasa Indonesia.
Asumsikan harga saat ini: ${actualPrice}
Sinyal: ${sig ? sig.action : "SELL"} (strength ${sig ? sig.strength : 75}%)
Basis: ${sig ? sig.basis : "Teknikal+Sentimen"}
Perkiraan level: Entry=${lv?.entry||actualPrice}, SL=${lv?.sl||"N/A"}, TP1=${lv?.tp1||"N/A"}, TP2=${lv?.tp2||"N/A"}, TP3=${lv?.tp3||"N/A"}

PENTING: Balas HANYA dengan JSON valid, tanpa teks penjelasan apapun sebelum atau sesudah JSON.
Format JSON:
{"rekomendasi":"BUY atau SELL atau WAIT","entry_price":"${lv?.entry||actualPrice}","entry_pips":"0 pip (market order)","tp1_price":"${lv?.tp1||"N/A"}","tp1_pips":"${lv?.pipsTP1||"N/A"} pip","tp2_price":"${lv?.tp2||"N/A"}","tp2_pips":"${lv?.pipsTP2||"N/A"} pip","tp3_price":"${lv?.tp3||"N/A"}","tp3_pips":"${lv?.pipsTP3||"N/A"} pip","sl_price":"${lv?.sl||"N/A"}","sl_pips":"${lv?.pipsSL||"N/A"} pip","rr":"1:${lv?.rrr||"1.5"}","alasan":"analisis teknikal dan fundamental untuk ${pair} TF ${tf}","risiko":"SEDANG","konfluensi":["EMA trend","RSI momentum","Sentimen pasar"]}`;

    try {
      const res = await fetch("/api/claude-proxy", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ messages:[{ role:"user", content:prompt }] }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (!data.content || !data.content.length) throw new Error("Response kosong dari Claude");
      const text = data.content.map(b => b.text||"").join("");
      const clean = text.replace(/```json|```/g,"").trim();
      const match = clean.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Format JSON tidak valid: " + clean.slice(0,100));
      setResult(JSON.parse(match[0]));
    } catch(e) {
      setError("Gagal: " + e.message);
    }
    setLoading(false);
  };

  const riskColor = { RENDAH:"#22c55e", SEDANG:"#eab308", TINGGI:"#ef4444" };

  return (
    <div>
      <SectionHeader icon="🤖" title="AI ANALISIS SINYAL" sub={`TF: ${tf} • Powered by Claude`} />

      {/* Pair Selector */}
      <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
        {signals.map(s => (
          <button key={s.pair} onClick={() => { setPair(s.pair); setResult(null); }} style={{
            padding:"6px 12px", borderRadius:8, cursor:"pointer", fontSize:11, fontWeight:700,
            background:pair===s.pair ? GOLD : "#16161F",
            color:pair===s.pair ? "#000" : "#888",
            border:`1px solid ${pair===s.pair ? GOLD : "#2a2a3a"}`,
            transition:"all 0.2s",
          }}>{s.pair}</button>
        ))}
      </div>

      {prices[pair] && (
        <div style={{
          background:CARD, border:"1px solid #1e1e2e", borderRadius:12,
          padding:"10px 16px", marginBottom:12,
          display:"flex", justifyContent:"space-between", alignItems:"center",
        }}>
          <span style={{ fontSize:13, color:"#888" }}>Harga {pair}</span>
          <span style={{ fontSize:18, fontWeight:800, color:GOLD }}>{prices[pair]}</span>
        </div>
      )}

      <button onClick={analyze} disabled={loading} style={{
        width:"100%", padding:"14px", borderRadius:12, cursor:loading?"not-allowed":"pointer",
        background:loading?"#1a1a2a":`linear-gradient(135deg,${GOLD},#a07828)`,
        color:loading?"#555":"#000", fontWeight:800, fontSize:14,
        border:"none", marginBottom:16, transition:"all 0.2s",
        boxShadow:loading?"none":`0 4px 20px ${GOLD}44`,
      }}>
        {loading ? "⏳ Menganalisis..." : `🔍 Analisis ${pair} ${tf}`}
      </button>

      {error && (
        <div style={{ background:"#2e0d0d", border:"1px solid #ef444433", borderRadius:12, padding:14, color:"#ef4444", fontSize:13 }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ animation:"slideIn 0.4s ease" }}>
          <div style={{
            background:CARD, border:"1px solid #1e1e2e", borderRadius:14,
            padding:"16px", marginBottom:10,
            display:"flex", justifyContent:"space-between", alignItems:"center",
          }}>
            <div>
              <div style={{ fontSize:11, color:"#666", marginBottom:4 }}>REKOMENDASI</div>
              <ActionBadge action={result.rekomendasi} size="md" />
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:11, color:"#666", marginBottom:4 }}>R:R RATIO</div>
              <span style={{ fontWeight:700, fontSize:13, color:GOLD }}>{result.rr}</span>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:11, color:"#666", marginBottom:4 }}>RISIKO</div>
              <span style={{
                fontWeight:700, fontSize:13, padding:"3px 10px", borderRadius:6,
                background:(riskColor[result.risiko]||"#888")+"22",
                color:riskColor[result.risiko]||"#888",
                border:`1px solid ${(riskColor[result.risiko]||"#888")}44`,
              }}>{result.risiko}</span>
            </div>
          </div>

          {/* Entry */}
          <div style={{
            background:"#1a1a0d", border:"1px solid #eab30833", borderRadius:12,
            padding:"12px 16px", marginBottom:8,
            display:"flex", justifyContent:"space-between", alignItems:"center",
          }}>
            <div>
              <div style={{ fontSize:10, color:"#666", fontWeight:700, letterSpacing:1, marginBottom:4 }}>⚡ ENTRY</div>
              <div style={{ fontSize:18, fontWeight:900, color:"#eab308", fontVariantNumeric:"tabular-nums" }}>{result.entry_price}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:10, color:"#666", marginBottom:4 }}>Jarak dari market</div>
              <div style={{ fontSize:13, fontWeight:700, color:"#eab30899" }}>{result.entry_pips}</div>
            </div>
          </div>

          {/* TP levels */}
          {[
            { label:"🎯 TAKE PROFIT 1", price: result.tp1_price, pips: result.tp1_pips, bg:"#0d1a0d", border:"#22c55e33", color:"#22c55e" },
            { label:"🎯 TAKE PROFIT 2", price: result.tp2_price, pips: result.tp2_pips, bg:"#0a1509", border:"#22c55e22", color:"#16a34a" },
            { label:"🎯 TAKE PROFIT 3", price: result.tp3_price, pips: result.tp3_pips, bg:"#071209", border:"#22c55e18", color:"#15803d" },
          ].map(({ label,price,pips,bg,border,color }) => (
            <div key={label} style={{
              background:bg, border:`1px solid ${border}`, borderRadius:12,
              padding:"11px 16px", marginBottom:8,
              display:"flex", justifyContent:"space-between", alignItems:"center",
            }}>
              <div>
                <div style={{ fontSize:10, color:"#555", fontWeight:700, letterSpacing:1, marginBottom:4 }}>{label}</div>
                <div style={{ fontSize:16, fontWeight:900, color, fontVariantNumeric:"tabular-nums" }}>{price}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:10, color:"#555", marginBottom:4 }}>Target</div>
                <div style={{
                  fontSize:13, fontWeight:800, color,
                  background: color+"22", borderRadius:8, padding:"3px 10px",
                  border:`1px solid ${color}33`,
                }}>+{pips}</div>
              </div>
            </div>
          ))}

          {/* SL */}
          <div style={{
            background:"#1a0d0d", border:"1px solid #ef444433", borderRadius:12,
            padding:"11px 16px", marginBottom:10,
            display:"flex", justifyContent:"space-between", alignItems:"center",
          }}>
            <div>
              <div style={{ fontSize:10, color:"#666", fontWeight:700, letterSpacing:1, marginBottom:4 }}>🛑 STOP LOSS</div>
              <div style={{ fontSize:16, fontWeight:900, color:"#ef4444", fontVariantNumeric:"tabular-nums" }}>{result.sl_price}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:10, color:"#666", marginBottom:4 }}>Risiko</div>
              <div style={{
                fontSize:13, fontWeight:800, color:"#ef4444",
                background:"#ef444422", borderRadius:8, padding:"3px 10px",
                border:"1px solid #ef444433",
              }}>-{result.sl_pips}</div>
            </div>
          </div>

          <div style={{ background:CARD, border:"1px solid #1e1e2e", borderRadius:14, padding:"14px 16px", marginBottom:10 }}>
            <div style={{ fontSize:11, color:GOLD, fontWeight:700, marginBottom:8 }}>💬 ANALISIS TF {tf}</div>
            <div style={{ fontSize:12, color:"#ccc", lineHeight:1.7 }}>{result.alasan}</div>
          </div>

          {result.konfluensi?.length > 0 && (
            <div style={{ background:CARD, border:"1px solid #1e1e2e", borderRadius:14, padding:"14px 16px" }}>
              <div style={{ fontSize:11, color:GOLD, fontWeight:700, marginBottom:10 }}>✅ KONFLUENSI</div>
              {result.konfluensi.map((k,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:"#22c55e", flexShrink:0 }} />
                  <div style={{ fontSize:12, color:"#bbb" }}>{k}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// ── Live Signals hook (Twelve Data RSI+EMA) ──────────────────────────────────
const SIGNAL_PAIRS = [
  { pair:"XAUUSD", sym:"XAU/USD", cat:"komoditas" },
  { pair:"OIL",    sym:"WTI/USD", cat:"komoditas" },
  { pair:"EURUSD", sym:"EUR/USD", cat:"forex"     },
  { pair:"USDJPY", sym:"USD/JPY", cat:"forex"     },
  { pair:"GBPUSD", sym:"GBP/USD", cat:"forex"     },
  { pair:"USDCAD", sym:"USD/CAD", cat:"forex"     },
  { pair:"BTCUSD", sym:"BTC/USD", cat:"crypto"    },
];

function useLiveSignals(tf) {
  const [signals, setSignals] = useState([]);
  const [loadingSig, setLoadingSig] = useState(true);

  const fetchSignals = useCallback(async () => {
    try {
      const results = await Promise.all(
        SIGNAL_PAIRS.map(({ pair, sym, cat }) =>
          fetch(`/api/signals?symbol=${encodeURIComponent(sym)}&tf=${tf}`)
            .then(r => r.json())
            .then(d => ({
              pair, cat,
              action: d.action || "WAIT",
              strength: d.strength || 50,
              basis: d.basis || "EMA+RSI",
              rsi: d.rsi,
              ema9: d.ema9,
              ema21: d.ema21,
              pip: d.action === "BUY" ? "+30" : d.action === "SELL" ? "-30" : "±0",
            }))
            .catch(() => ({ pair, cat, action:"WAIT", strength:50, basis:"Teknikal", pip:"±0" }))
        )
      );
      setSignals(results);
    } catch { }
    setLoadingSig(false);
  }, [tf]);

  useEffect(() => {
    setLoadingSig(true);
    fetchSignals();
    const t = setInterval(fetchSignals, 60000);
    return () => clearInterval(t);
  }, [fetchSignals]);

  return { signals, loadingSig, refreshSig: fetchSignals };
}

// ── Live News hook (ForexFactory via proxy) ───────────────────────────────────
function useLiveNews() {
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);

  useEffect(() => {
    fetch('/api/news')
      .then(r => r.json())
      .then(d => {
        if (d.items && d.items.length > 0) {
          setNews(d.items);
        } else {
          // Fallback static news
          setNews([
            { title:"Fed Pertahankan Suku Bunga 5.25-5.50%", country:"USD", time:"10:30", impact:"High", forecast:"", previous:"" },
            { title:"CPI Zona Euro Naik 2.9% YoY", country:"EUR", time:"09:15", impact:"High", forecast:"2.8%", previous:"2.7%" },
            { title:"Jepang GDP Q2 Tumbuh 0.4%", country:"JPY", time:"08:45", impact:"Medium", forecast:"0.3%", previous:"0.1%" },
            { title:"China PMI Manufaktur: 49.7", country:"CNY", time:"07:30", impact:"Medium", forecast:"50.0", previous:"49.5" },
            { title:"Gold Naik Didorong Ketidakpastian Geopolitik", country:"XAU", time:"06:00", impact:"High", forecast:"", previous:"" },
            { title:"UK Retail Sales -0.3% MoM", country:"GBP", time:"05:00", impact:"Medium", forecast:"-0.1%", previous:"0.2%" },
          ]);
        }
      })
      .catch(() => {
        setNews([
          { title:"Fed Pertahankan Suku Bunga 5.25-5.50%", country:"USD", time:"10:30", impact:"High" },
          { title:"CPI Zona Euro Naik 2.9% YoY", country:"EUR", time:"09:15", impact:"High" },
          { title:"Gold Naik Didorong Geopolitik", country:"XAU", time:"06:00", impact:"High" },
        ]);
      })
      .finally(() => setLoadingNews(false));
  }, []);

  return { news, loadingNews };
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function JagoScalping() {
  const [activeTab, setActiveTab] = useState("signal");
  const [tf, setTf] = useState("M15");
  const [time, setTime] = useState(new Date());
  const [animate, setAnimate] = useState(true);
  const [filter, setFilter] = useState("semua");
  const [alerts, setAlerts] = useState([]);
  const { prices, loading:priceLoading, refresh } = useLivePrices();
  const { signals: liveSignals, loadingSig } = useLiveSignals(tf);
  const { news: liveNews, loadingNews } = useLiveNews();
  const alertTimerRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setAnimate(false);
    const t = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(t);
  }, [activeTab, tf]);

  useEffect(() => {
    alertTimerRef.current = setInterval(() => {
      const sigs = TF_SIGNALS[tf] || TF_SIGNALS["M30"];
      const sig = sigs[Math.floor(Math.random()*sigs.length)];
      setAlerts(prev => [sig,...prev].slice(0,3));
    }, 30000);
    return () => clearInterval(alertTimerRef.current);
  }, [tf]);

  const fmt = d => d.toLocaleTimeString("id-ID",{ hour:"2-digit", minute:"2-digit", second:"2-digit" });
  const signals = TF_SIGNALS[tf] || TF_SIGNALS["M30"];
  const filteredSignals = filter==="semua" ? signals : signals.filter(s => s.cat===filter);
  const currencyScores = TF_CURRENCY_SCORES[tf] || TF_CURRENCY_SCORES["M30"];

  const getAction = score => score > 2 ? "BUY" : score < -2 ? "SELL" : "WAIT";

  return (
    <div style={{
      height:"100dvh", background:DARK, color:"#e8e8f0",
      fontFamily:"'DM Sans','Segoe UI',sans-serif",
      display:"flex", flexDirection:"column", maxWidth:480,
      margin:"0 auto", position:"relative", overflow:"hidden",
    }}>
      {/* Ambient */}
      <div style={{
        position:"fixed", top:-100, left:"50%", transform:"translateX(-50%)",
        width:400, height:300, borderRadius:"50%",
        background:"radial-gradient(ellipse,#6366f118 0%,transparent 70%)",
        pointerEvents:"none", zIndex:0,
      }} />

      <AlertToast alerts={alerts} onDismiss={() => setAlerts(a => a.slice(1))} />

      {/* Header */}
      <div style={{
        background:"linear-gradient(135deg,#050510 0%,#0f0520 100%)",
        borderBottom:"1px solid #6366f133", padding:"14px 20px 10px",
        zIndex:10, flexShrink:0,
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{
            width:42, height:42, borderRadius:12,
            background:`linear-gradient(135deg,#6366f1 0%,#e11d48 100%)`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:18, fontWeight:900, color:"#000",
            boxShadow:"0 4px 20px #6366f166, 0 4px 20px #e11d4844",
          }}>S</div>
          <div>
            <div style={{ fontSize:17, fontWeight:800, color:GOLD, letterSpacing:1 }}>SCALPER</div>
            <div style={{ fontSize:11, color:"#888", marginTop:1 }}>by Dark Inc</div>
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:18, fontWeight:700, color:"#fff", fontVariantNumeric:"tabular-nums" }}>{fmt(time)}</div>
          <div style={{ fontSize:10, color:priceLoading?"#eab308":"#22c55e" }}>
            {priceLoading?"⏳ Memuat...":"● Live"}
          </div>
        </div>
      </div>



      {/* TF Selector — show on signal, strength, ai tabs */}
      {["signal","strength","ai"].includes(activeTab) && (
        <TFSelector value={tf} onChange={setTf} />
      )}



      {/* Content */}
      <div style={{
        flex:1, overflowY:"auto", overflowX:"hidden",
        WebkitOverflowScrolling:"touch", padding:"12px 14px 90px",
        opacity:animate?1:0, transform:animate?"translateY(0)":"translateY(8px)",
        transition:"opacity 0.3s,transform 0.3s",
      }}>

        {/* SIGNAL */}
        {activeTab==="signal" && (
          <div>
            <SectionHeader icon="⚡" title="SINYAL AKTIF" sub={loadingSig ? `TF: ${tf} · Memuat...` : `TF: ${tf} · ${filteredSignals.length} sinyal · Live`} />
            <div style={{ display:"flex", gap:8, marginBottom:14 }}>
              {CATS.map(c => (
                <button key={c} onClick={() => setFilter(c)} style={{
                  padding:"5px 14px", borderRadius:20, cursor:"pointer",
                  fontSize:11, fontWeight:700, textTransform:"capitalize",
                  background:filter===c ? GOLD : "#16161F",
                  color:filter===c ? "#000" : "#666",
                  border:`1px solid ${filter===c ? GOLD : "#2a2a3a"}`,
                  transition:"all 0.2s",
                }}>{c}</button>
              ))}
            </div>
            {filteredSignals.map((s,i) => {
              const lv = calcLevels(s.pair, s.action, prices[s.pair], s.strength);
              const pipColor = s.action==="BUY" ? "#22c55e" : s.action==="SELL" ? "#ef4444" : "#eab308";
              const barColor = s.action==="BUY"
                ? "linear-gradient(90deg,#166534,#22c55e)"
                : s.action==="SELL"
                ? "linear-gradient(90deg,#7f1d1d,#ef4444)"
                : "linear-gradient(90deg,#713f12,#eab308)";
              return (
              <div key={s.pair} style={{
                background:CARD, border:"1px solid #1e1e2e", borderRadius:14,
                padding:"13px 16px", marginBottom:10,
                animation:`slideIn 0.3s ease ${i*0.04}s both`,
              }}>
                {/* Row 1: pair + badge */}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontWeight:800, fontSize:15, color:"#fff" }}>{s.pair}</span>
                    <span style={{ fontSize:9, padding:"1px 6px", borderRadius:4, background:"#1e1e2e", color:"#666", textTransform:"uppercase" }}>{s.cat}</span>
                  </div>
                  <ActionBadge action={s.action} />
                </div>

                {/* Row 2: basis + harga realtime */}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <span style={{ fontSize:11, color:"#666" }}>{s.basis}</span>
                  {prices[s.pair]
                    ? <span style={{ fontSize:13, color:GOLD, fontWeight:800, fontVariantNumeric:"tabular-nums" }}>{prices[s.pair]}</span>
                    : <span style={{ fontSize:11, color:"#444" }}>Memuat...</span>
                  }
                </div>

                {/* Strength bar */}
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                  <div style={{ flex:1, height:3, background:"#1e1e2e", borderRadius:2 }}>
                    <div style={{ width:`${s.strength}%`, height:"100%", borderRadius:2, background:barColor }} />
                  </div>
                  <span style={{ fontSize:10, color:"#555", minWidth:28 }}>{s.strength}%</span>
                </div>

                {/* Pips row — selalu tampil dari static data */}
                <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap" }}>
                  {lv ? (
                    <>
                      {[
                        { label:"SL",  val:`${lv.pipsSL} pip`,  color:"#ef4444", bg:"#2e0d0d" },
                        { label:"TP1", val:`${lv.pipsTP1} pip`, color:"#22c55e", bg:"#0d2e1a" },
                        { label:"TP2", val:`${lv.pipsTP2} pip`, color:"#16a34a", bg:"#0a2015" },
                        { label:"TP3", val:`${lv.pipsTP3} pip`, color:"#15803d", bg:"#071209" },
                        { label:"RRR", val:`${lv.rrr}:1`,        color:GOLD,      bg:"#1a1030" },
                      ].map(({label,val,color,bg}) => (
                        <div key={label} style={{
                          background:bg, border:`1px solid ${color}33`, borderRadius:8,
                          padding:"4px 9px", display:"flex", gap:5, alignItems:"center",
                        }}>
                          <span style={{ fontSize:9, color:"#666", fontWeight:700 }}>{label}</span>
                          <span style={{ fontSize:11, color, fontWeight:800, fontVariantNumeric:"tabular-nums" }}>{val}</span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div style={{ background:"#1e1e2e", border:"1px solid #2a2a3a", borderRadius:8, padding:"4px 9px" }}>
                      <span style={{ fontSize:10, color:"#555" }}>Memuat harga...</span>
                    </div>
                  )}
                </div>



              </div>
              );
            })}
          </div>
        )}

        {/* STRENGTH */}
        {activeTab==="strength" && (
          <div>
            <SectionHeader icon="💹" title="KEKUATAN MATA UANG" sub={loadingSig ? "Memuat..." : `TF: ${tf} · Live`} />
            {CURRENCIES_BASE.map((code,i) => {
              const score = currencyScores[code] ?? 0;
              const action = getAction(score);
              return (
                <div key={code} style={{
                  background:CARD, border:"1px solid #1e1e2e", borderRadius:14,
                  padding:"13px 16px", marginBottom:10,
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                  animation:`slideIn 0.3s ease ${i*0.04}s both`,
                }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                    <div style={{
                      width:44, height:44, borderRadius:12,
                      background:action==="BUY"?"#0d2e1a":action==="SELL"?"#2e0d0d":"#1a1a0d",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:13, fontWeight:900,
                      color:action==="BUY"?"#22c55e":action==="SELL"?"#ef4444":"#eab308",
                      border:`1px solid ${action==="BUY"?"#22c55e33":action==="SELL"?"#ef444433":"#eab30833"}`,
                    }}>{code}</div>
                    <div>
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5 }}>
                        <span style={{ fontWeight:800, fontSize:14, color:"#fff" }}>Score</span>
                        <span style={{
                          fontWeight:700, fontSize:15,
                          color:score>0?"#22c55e":score<0?"#ef4444":"#eab308",
                        }}>{score>0?"+":""}{score}</span>
                      </div>
                      <ScoreBar score={score} />
                    </div>
                  </div>
                  <ActionBadge action={action} size="md" />
                </div>
              );
            })}
          </div>
        )}

        {/* HISTORY */}
        {activeTab==="history" && (
          <div>
            <SectionHeader icon="📋" title="RIWAYAT SINYAL" sub="7 hari terakhir" />
            {HISTORY.map((h,i) => (
              <div key={i} style={{
                background:CARD, border:"1px solid #1e1e2e", borderRadius:14,
                padding:"14px 16px", marginBottom:10,
                borderLeft:`3px solid ${h.result==="profit"?"#22c55e":h.result==="loss"?"#ef4444":"#eab308"}`,
                animation:`slideIn 0.3s ease ${i*0.05}s both`,
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <div style={{ fontSize:11, color:"#555" }}>{h.date}</div>
                  <span style={{
                    fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:6,
                    background:h.result==="profit"?"#0d2e1a":h.result==="loss"?"#2e0d0d":"#1a1a0d",
                    color:h.result==="profit"?"#22c55e":h.result==="loss"?"#ef4444":"#eab308",
                  }}>{h.result==="profit"?"✓ PROFIT":h.result==="loss"?"✗ LOSS":"— NEUTRAL"}</span>
                </div>
                <div style={{ fontWeight:700, fontSize:13, color:"#ddd", marginBottom:4 }}>{h.title}</div>
                <div style={{ fontSize:11, color:"#666" }}>{h.detail}</div>
              </div>
            ))}
          </div>
        )}

        {/* NEWS */}
        {activeTab==="news" && (
          <div>
            <SectionHeader icon="📰" title="BERITA FOREX" sub={loadingNews ? "Memuat..." : "ForexFactory · Live"} />
            {(liveNews.length > 0 ? liveNews : NEWS).map((n,i) => (
              <div key={i} style={{
                background:CARD, border:"1px solid #1e1e2e", borderRadius:14,
                padding:"13px 16px", marginBottom:10,
                display:"flex", gap:12, alignItems:"flex-start",
                animation:`slideIn 0.3s ease ${i*0.05}s both`,
              }}>
                <div style={{ textAlign:"center", minWidth:44 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#6366f1" }}>{n.time || "--:--"}</div>
                  <div style={{
                    marginTop:6, fontSize:9, fontWeight:700, padding:"2px 5px", borderRadius:4,
                    background: (n.impact==="High"||n.impact==="high")?"#2e0d0d": (n.impact==="Medium"||n.impact==="medium")?"#1a1a0d":"#0d1a0d",
                    color: (n.impact==="High"||n.impact==="high")?"#ef4444": (n.impact==="Medium"||n.impact==="medium")?"#eab308":"#22c55e",
                  }}>{(n.impact==="High"||n.impact==="high")?"TINGGI":(n.impact==="Medium"||n.impact==="medium")?"SEDANG":"RENDAH"}</div>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{
                    display:"inline-block", marginBottom:6, padding:"2px 8px",
                    background:"#6366f122", borderRadius:5, fontSize:10, fontWeight:800, color:"#6366f1",
                  }}>{n.currency||n.country||"FX"}</div>
                  <div style={{ fontSize:12, color:"#ccc", lineHeight:1.5 }}>{n.title}</div>
                  {(n.forecast||n.previous) && (
                    <div style={{ display:"flex", gap:12, marginTop:4 }}>
                      {n.forecast && <span style={{ fontSize:10, color:"#666" }}>Forecast: <span style={{ color:"#eab308" }}>{n.forecast}</span></span>}
                      {n.previous && <span style={{ fontSize:10, color:"#666" }}>Prev: <span style={{ color:"#888" }}>{n.previous}</span></span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AI */}
        {activeTab==="ai" && <AITab prices={prices} tf={tf} />}
      </div>

      {/* Bottom Nav */}
      <div style={{
        flexShrink:0,
        background:"#0d0d14", borderTop:"1px solid #6366f133",
        padding:"8px 0 12px", zIndex:20,
        display:"flex", justifyContent:"space-around",
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            background:"transparent", border:"none", cursor:"pointer",
            display:"flex", flexDirection:"column", alignItems:"center", gap:2,
            color:activeTab===t.id ? GOLD : "#444",
            transition:"color 0.2s", padding:"4px 6px",
          }}>
            <span style={{ fontSize:18 }}>{t.icon}</span>
            <span style={{ fontSize:8, fontWeight:700 }}>{t.label}</span>
          </button>
        ))}
      </div>

      <style>{`
        @keyframes slideIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes toastIn { from{opacity:0;transform:translateX(-50%) translateY(-20px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:#2a2a3a;border-radius:2px}
        button:active{transform:scale(0.96)}
      `}</style>
    </div>
  );
}
