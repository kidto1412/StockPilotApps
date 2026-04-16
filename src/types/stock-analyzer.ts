export type TradingStyle = 'day' | 'swing' | 'scalping';

export type RecommendationAction = 'BUY' | 'WATCH' | 'AVOID';

export type LiquiditySweepStatus = 'BULLISH' | 'BEARISH' | 'NONE';

export type MarketBias = 'BULLISH' | 'BEARISH' | 'NEUTRAL';

export interface IndicatorSet {
  rsi: number;
  macdHistogram: number;
  ema20: number;
  ema50: number;
  volumeRatio: number;
}

export interface LiquiditySweepSignal {
  isDetected: boolean;
  zone: 'support' | 'resistance' | 'none';
  confirmation: number;
}

export interface BidOfferSignal {
  bidVolume: number;
  offerVolume: number;
  imbalance: number;
}

export interface BrokerFlow {
  broker: string;
  buyValueBn: number;
  sellValueBn: number;
}

export interface StockSnapshot {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  changePct: number;
  indicators: IndicatorSet;
  liquiditySweep: LiquiditySweepSignal;
  bidOffer: BidOfferSignal;
  brokerSummary: BrokerFlow[];
}

export interface StrategyPlan {
  style: TradingStyle;
  entryPrice: number;
  entryRule: string;
  takeProfit1: number;
  takeProfit2: number;
  trailingStop: number;
  cutLoss: number;
  timeframe: string;
}

export interface StockRecommendation {
  stock: StockSnapshot;
  style: TradingStyle;
  score: number;
  action: RecommendationAction;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  reasons: string[];
  strategy: StrategyPlan;
  tradingViewSymbol: string;
  activeIndicators: string[];
}

// === API Response Types ===
export interface ApiMarketData {
  symbol: string;
  closePrice: number;
  livePrice?: number;
  isRealTime?: boolean;
  lastUpdatedAt?: string;
  indicators: {
    rsi: number;
    macdHistogram: number;
    volumeRatio: number;
    ema20: number;
    ema50: number;
  };
  candles?: Array<{
    timestamp: number | string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
  }>;
  source: {
    provider: string;
    range: string;
    interval: string;
  };
  recommendation?: ApiRecommendation;
  marketBias?: MarketBias;
  strategies?: ApiRecommendation['strategies'];
  tradingView?: ApiRecommendation['tradingView'];
  scoring?: ApiRecommendation['scoring'];
}

export interface ApiStrategy {
  style: string;
  recommendation: 'BUY' | 'SELL' | 'HOLD' | 'WATCH';
  entry: number;
  takeProfit: number;
  trailingStop: number;
  stopLoss: number;
  cutLoss: number;
  note: string;
}

export interface ApiScoring {
  longScore: number;
  shortScore: number;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  mlProbabilityBuy: number;
  mlSignal: 'BUY' | 'SELL';
  mlNote: string;
}

export interface ApiRecommendation {
  symbol: string;
  generatedAt: string;
  methodology: string[];
  marketBias: MarketBias;
  scoring: ApiScoring;
  brokerSummary: {
    foreignFlowBillion: number;
    top3BrokerNetBuyBillion: number;
    interpretation: string;
  };
  strategies: {
    dayTrading: ApiStrategy;
    swingTrading: ApiStrategy;
    scalping: ApiStrategy;
  };
  tradingView: {
    symbol: string;
    defaultInterval: string;
    exchange: string;
    indicators: string[];
    chartUrl: string;
  };
  disclaimer: string;
}

export interface ApiAutoRecommendation {
  marketData: ApiMarketData;
  recommendation: ApiRecommendation;
}
