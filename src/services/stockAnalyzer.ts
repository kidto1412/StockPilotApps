import {
  StockRecommendation,
  StockSnapshot,
  StrategyPlan,
  TradingStyle,
} from '@/types/stock-analyzer';

const STOCK_SNAPSHOTS: StockSnapshot[] = [
  {
    symbol: 'BBCA',
    name: 'Bank Central Asia',
    sector: 'Perbankan',
    price: 10125,
    changePct: 1.46,
    indicators: {
      rsi: 58,
      macdHistogram: 0.42,
      ema20: 10020,
      ema50: 9880,
      volumeRatio: 1.34,
    },
    liquiditySweep: {
      isDetected: true,
      zone: 'support',
      confirmation: 0.73,
    },
    bidOffer: {
      bidVolume: 5_320_000,
      offerVolume: 3_120_000,
      imbalance: 1.7,
    },
    brokerSummary: [
      { broker: 'PD', buyValueBn: 122.1, sellValueBn: 84.3 },
      { broker: 'CC', buyValueBn: 103.4, sellValueBn: 74.2 },
      { broker: 'AK', buyValueBn: 82.7, sellValueBn: 66.1 },
    ],
  },
  {
    symbol: 'BBRI',
    name: 'Bank Rakyat Indonesia',
    sector: 'Perbankan',
    price: 5410,
    changePct: 0.92,
    indicators: {
      rsi: 52,
      macdHistogram: 0.25,
      ema20: 5360,
      ema50: 5290,
      volumeRatio: 1.21,
    },
    liquiditySweep: {
      isDetected: true,
      zone: 'support',
      confirmation: 0.68,
    },
    bidOffer: {
      bidVolume: 8_950_000,
      offerVolume: 6_470_000,
      imbalance: 1.38,
    },
    brokerSummary: [
      { broker: 'YP', buyValueBn: 98.8, sellValueBn: 76.5 },
      { broker: 'RX', buyValueBn: 76.1, sellValueBn: 61.4 },
      { broker: 'NI', buyValueBn: 62.9, sellValueBn: 53.8 },
    ],
  },
  {
    symbol: 'TLKM',
    name: 'Telkom Indonesia',
    sector: 'Telekomunikasi',
    price: 3770,
    changePct: -0.26,
    indicators: {
      rsi: 44,
      macdHistogram: -0.18,
      ema20: 3815,
      ema50: 3890,
      volumeRatio: 0.93,
    },
    liquiditySweep: {
      isDetected: false,
      zone: 'none',
      confirmation: 0.0,
    },
    bidOffer: {
      bidVolume: 4_420_000,
      offerVolume: 5_100_000,
      imbalance: 0.87,
    },
    brokerSummary: [
      { broker: 'AZ', buyValueBn: 43.3, sellValueBn: 57.2 },
      { broker: 'BK', buyValueBn: 36.5, sellValueBn: 44.8 },
      { broker: 'MG', buyValueBn: 29.1, sellValueBn: 38.5 },
    ],
  },
  {
    symbol: 'ASII',
    name: 'Astra International',
    sector: 'Otomotif',
    price: 4860,
    changePct: 1.21,
    indicators: {
      rsi: 61,
      macdHistogram: 0.33,
      ema20: 4785,
      ema50: 4690,
      volumeRatio: 1.41,
    },
    liquiditySweep: {
      isDetected: true,
      zone: 'support',
      confirmation: 0.64,
    },
    bidOffer: {
      bidVolume: 3_880_000,
      offerVolume: 2_700_000,
      imbalance: 1.43,
    },
    brokerSummary: [
      { broker: 'YU', buyValueBn: 54.9, sellValueBn: 31.5 },
      { broker: 'GR', buyValueBn: 48.6, sellValueBn: 26.9 },
      { broker: 'SQ', buyValueBn: 40.7, sellValueBn: 22.1 },
    ],
  },
  {
    symbol: 'BMRI',
    name: 'Bank Mandiri',
    sector: 'Perbankan',
    price: 6925,
    changePct: 0.34,
    indicators: {
      rsi: 49,
      macdHistogram: 0.12,
      ema20: 6890,
      ema50: 6830,
      volumeRatio: 1.1,
    },
    liquiditySweep: {
      isDetected: true,
      zone: 'support',
      confirmation: 0.52,
    },
    bidOffer: {
      bidVolume: 6_220_000,
      offerVolume: 5_630_000,
      imbalance: 1.1,
    },
    brokerSummary: [
      { broker: 'ZP', buyValueBn: 70.1, sellValueBn: 55.7 },
      { broker: 'LG', buyValueBn: 62.3, sellValueBn: 51.4 },
      { broker: 'CS', buyValueBn: 59.5, sellValueBn: 49.8 },
    ],
  },
];

interface StyleConfig {
  timeframe: string;
  entryBufferPct: number;
  takeProfit1Pct: number;
  takeProfit2Pct: number;
  trailingStopPct: number;
  cutLossPct: number;
  minScore: number;
}

const STYLE_CONFIG: Record<TradingStyle, StyleConfig> = {
  day: {
    timeframe: '5m - 30m',
    entryBufferPct: 0.15,
    takeProfit1Pct: 2.2,
    takeProfit2Pct: 3.8,
    trailingStopPct: 0.8,
    cutLossPct: 1.2,
    minScore: 58,
  },
  swing: {
    timeframe: '4H - 1D',
    entryBufferPct: 0.25,
    takeProfit1Pct: 6,
    takeProfit2Pct: 11,
    trailingStopPct: 2,
    cutLossPct: 3,
    minScore: 54,
  },
  scalping: {
    timeframe: '1m - 5m',
    entryBufferPct: 0.08,
    takeProfit1Pct: 0.8,
    takeProfit2Pct: 1.4,
    trailingStopPct: 0.35,
    cutLossPct: 0.5,
    minScore: 62,
  },
};

const ACTIVE_INDICATORS = ['RSI', 'MACD', 'EMA20/50', 'Volume Profile', 'VWAP'];

const toPrice = (price: number) => Math.round(price);

const pctToPrice = (price: number, pct: number) =>
  toPrice(price * (1 + pct / 100));

const pctToCut = (price: number, pct: number) =>
  toPrice(price * (1 - pct / 100));

const evaluateScore = (stock: StockSnapshot) => {
  let score = 50;
  const reasons: string[] = [];

  if (stock.indicators.rsi >= 45 && stock.indicators.rsi <= 68) {
    score += 10;
    reasons.push('RSI berada pada zona momentum sehat.');
  } else if (stock.indicators.rsi < 35 || stock.indicators.rsi > 75) {
    score -= 8;
    reasons.push('RSI terlalu ekstrem, risiko reversal meningkat.');
  }

  if (stock.indicators.macdHistogram > 0) {
    score += 8;
    reasons.push('MACD histogram positif menandakan dorongan bullish.');
  } else {
    score -= 7;
    reasons.push('MACD histogram negatif, momentum melemah.');
  }

  if (stock.indicators.ema20 > stock.indicators.ema50) {
    score += 10;
    reasons.push('EMA20 di atas EMA50, tren jangka pendek menguat.');
  } else {
    score -= 9;
    reasons.push('EMA20 masih di bawah EMA50, tren belum solid.');
  }

  if (stock.indicators.volumeRatio >= 1.2) {
    score += 8;
    reasons.push('Volume di atas rata-rata, validasi pergerakan harga.');
  }

  if (
    stock.liquiditySweep.isDetected &&
    stock.liquiditySweep.zone === 'support'
  ) {
    score += 12;
    reasons.push('Liquidity sweep area support terkonfirmasi.');
  } else if (
    stock.liquiditySweep.isDetected &&
    stock.liquiditySweep.zone === 'resistance'
  ) {
    score -= 6;
    reasons.push('Liquidity sweep terjadi di resistance, waspada distribusi.');
  }

  if (stock.bidOffer.imbalance >= 1.3) {
    score += 10;
    reasons.push('Bid lebih dominan dari offer, tekanan beli kuat.');
  } else if (stock.bidOffer.imbalance < 0.95) {
    score -= 7;
    reasons.push('Offer lebih dominan, risiko tekanan jual.');
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    reasons,
  };
};

const buildStrategy = (
  style: TradingStyle,
  stock: StockSnapshot,
): StrategyPlan => {
  const cfg = STYLE_CONFIG[style];
  const entryPrice = pctToPrice(stock.price, cfg.entryBufferPct);

  return {
    style,
    timeframe: cfg.timeframe,
    entryPrice,
    entryRule:
      'Entry bertahap setelah candle konfirmasi breakout/reclaim dengan volume > rata-rata.',
    takeProfit1: pctToPrice(entryPrice, cfg.takeProfit1Pct),
    takeProfit2: pctToPrice(entryPrice, cfg.takeProfit2Pct),
    trailingStop: pctToCut(entryPrice, cfg.trailingStopPct),
    cutLoss: pctToCut(entryPrice, cfg.cutLossPct),
  };
};

const deriveAction = (
  score: number,
  style: TradingStyle,
): StockRecommendation['action'] => {
  const minScore = STYLE_CONFIG[style].minScore;

  if (score >= minScore + 8) {
    return 'BUY';
  }

  if (score >= minScore) {
    return 'WATCH';
  }

  return 'AVOID';
};

const deriveConfidence = (score: number): StockRecommendation['confidence'] => {
  if (score >= 72) {
    return 'HIGH';
  }

  if (score >= 58) {
    return 'MEDIUM';
  }

  return 'LOW';
};

export const getStockSnapshots = () => STOCK_SNAPSHOTS;

export const getRecommendationsByStyle = (
  style: TradingStyle,
): StockRecommendation[] => {
  return STOCK_SNAPSHOTS.map(stock => {
    const evaluation = evaluateScore(stock);
    const strategy = buildStrategy(style, stock);
    const action = deriveAction(evaluation.score, style);

    return {
      stock,
      style,
      score: evaluation.score,
      action,
      confidence: deriveConfidence(evaluation.score),
      reasons: evaluation.reasons,
      strategy,
      tradingViewSymbol: `IDX:${stock.symbol}`,
      activeIndicators: ACTIVE_INDICATORS,
    };
  }).sort((a, b) => b.score - a.score);
};
