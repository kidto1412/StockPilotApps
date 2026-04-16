import {
  ApiAutoRecommendation,
  ApiMarketData,
  ApiRecommendation,
  RecommendationAction,
  StockRecommendation,
  StockSnapshot,
  StrategyPlan,
  TradingStyle,
} from '@/types/stock-analyzer';

/**
 * Map API recommendation response to UI model format
 */
export const mapApiRecommendationToUI = (
  apiRec: ApiRecommendation,
): StockRecommendation[] => {
  if (!apiRec || typeof apiRec !== 'object') {
    return [];
  }

  const results: StockRecommendation[] = [];
  const styles: TradingStyle[] = ['day', 'swing', 'scalping'];
  const apiStyleMap: Record<
    TradingStyle,
    keyof NonNullable<ApiRecommendation['strategies']>
  > = {
    day: 'dayTrading',
    swing: 'swingTrading',
    scalping: 'scalping',
  };

  const symbol =
    apiRec.symbol ||
    apiRec.tradingView?.symbol?.replace('IDX:', '') ||
    'UNKNOWN';

  const foreignFlow = Number(apiRec.brokerSummary?.foreignFlowBillion || 0);
  const top3Flow = Number(apiRec.brokerSummary?.top3BrokerNetBuyBillion || 0);
  const interpretation = apiRec.brokerSummary?.interpretation || '';
  const marketBias = apiRec.marketBias || 'NEUTRAL';
  const score = Number((apiRec.scoring?.mlProbabilityBuy || 0) * 100);
  const confidence = apiRec.scoring?.confidence || 'LOW';
  const tvSymbol = apiRec.tradingView?.symbol || `IDX:${symbol}`;
  const tvIndicators = apiRec.tradingView?.indicators || [];

  // Create stock snapshot from market data
  const stock: StockSnapshot = {
    symbol: symbol.replace('.JK', ''),
    name: symbol,
    sector: 'Market',
    price: Math.round(Math.max(1, foreignFlow * 100)),
    changePct: 0,
    indicators: {
      rsi: 0,
      macdHistogram: 0,
      ema20: 0,
      ema50: 0,
      volumeRatio: 0,
    },
    liquiditySweep: {
      isDetected: marketBias !== 'NEUTRAL',
      zone: marketBias === 'BULLISH' ? 'support' : 'resistance',
      confirmation: 0.7,
    },
    bidOffer: {
      bidVolume: 0,
      offerVolume: 0,
      imbalance: 1.0,
    },
    brokerSummary: [
      {
        broker: 'Foreign',
        buyValueBn: Math.max(0, foreignFlow),
        sellValueBn: Math.max(0, -foreignFlow),
      },
      {
        broker: 'Top3',
        buyValueBn: Math.max(0, top3Flow),
        sellValueBn: Math.max(0, -top3Flow),
      },
    ],
  };

  // Map each style
  styles.forEach((style: TradingStyle) => {
    const apiStyle = apiStyleMap[style];
    const apiStrategy = apiRec.strategies?.[apiStyle];

    if (!apiStrategy) {
      return;
    }

    const strategy: StrategyPlan = {
      style,
      timeframe: '1D',
      entryPrice: Math.round(Number(apiStrategy.entry || 0)),
      entryRule: apiStrategy.note || 'Menunggu konfirmasi sinyal berikutnya.',
      takeProfit1: Math.round(Number(apiStrategy.takeProfit || 0)),
      takeProfit2: Math.round(Number(apiStrategy.takeProfit || 0) * 1.2),
      trailingStop: Math.round(Number(apiStrategy.trailingStop || 0)),
      cutLoss: Math.round(Number(apiStrategy.cutLoss || 0)),
    };

    const action: RecommendationAction =
      apiStrategy.recommendation === 'BUY'
        ? 'BUY'
        : apiStrategy.recommendation === 'HOLD' ||
            apiStrategy.recommendation === 'WATCH'
          ? 'WATCH'
          : 'AVOID';

    const reasons = [
      `Trade style: ${style}`,
      `Signal: ${apiStrategy.recommendation}`,
      ...interpretation.split('.').filter(r => r.trim()),
    ];

    results.push({
      stock,
      style,
      score,
      action,
      confidence,
      reasons,
      strategy,
      tradingViewSymbol: tvSymbol,
      activeIndicators: tvIndicators,
    });
  });

  return results.length > 0 ? results.sort((a, b) => b.score - a.score) : [];
};

/**
 * Map API auto recommendation to UI model
 */
export const mapApiAutoRecommendationToUI = (
  apiAutoRec: ApiAutoRecommendation,
): StockRecommendation[] => {
  if (!apiAutoRec || typeof apiAutoRec !== 'object') {
    return [];
  }

  const recommendation =
    apiAutoRec.recommendation ?? apiAutoRec.marketData?.recommendation;

  if (!recommendation) {
    return [];
  }

  return mapApiRecommendationToUI(recommendation);
};

/**
 * Convert market data to stock snapshot for comparison
 */
export const mapMarketDataToSnapshot = (
  data: ApiMarketData,
  name?: string,
): StockSnapshot => {
  if (!data || typeof data !== 'object') {
    return {
      symbol: 'UNKNOWN',
      name: name || 'UNKNOWN',
      sector: 'IDX',
      price: 0,
      changePct: 0,
      indicators: {
        rsi: 0,
        macdHistogram: 0,
        ema20: 0,
        ema50: 0,
        volumeRatio: 0,
      },
      liquiditySweep: {
        isDetected: false,
        zone: 'none',
        confirmation: 0,
      },
      bidOffer: {
        bidVolume: 0,
        offerVolume: 0,
        imbalance: 1,
      },
      brokerSummary: [],
    };
  }

  const symbol = data.symbol || 'UNKNOWN';
  const rsi = Number(data.indicators?.rsi || 0);

  return {
    symbol: symbol.replace('.JK', ''),
    name: name || symbol,
    sector: 'IDX',
    price: Math.round(Number(data.livePrice ?? data.closePrice ?? 0)),
    changePct: 0,
    indicators: {
      rsi,
      macdHistogram: Number(data.indicators?.macdHistogram || 0),
      ema20: Number(data.indicators?.ema20 || 0),
      ema50: Number(data.indicators?.ema50 || 0),
      volumeRatio: Number(data.indicators?.volumeRatio || 0),
    },
    liquiditySweep: {
      isDetected: true,
      zone: rsi > 50 ? 'support' : 'resistance',
      confirmation: 0.7,
    },
    bidOffer: {
      bidVolume: 0,
      offerVolume: 0,
      imbalance: 1.1,
    },
    brokerSummary: [],
  };
};
