export type TradingStyle = 'day' | 'swing' | 'scalping';

export type RecommendationAction = 'BUY' | 'WATCH' | 'AVOID';

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
