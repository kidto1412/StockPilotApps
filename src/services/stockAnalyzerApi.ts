import api from '@/services/api';
import { APIResponse } from '@/interfaces/base_respone.interface';

const STOCKPILOT_PREFIX = '/stockpilot';

export interface MarketDataResponse {
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
  candles?: ChartCandle[];
  source: {
    provider: string;
    range: string;
    interval: string;
  };
  recommendation?: RecommendationResponse;
  marketBias?: RecommendationResponse['marketBias'];
  strategies?: RecommendationResponse['strategies'];
  tradingView?: RecommendationResponse['tradingView'];
  scoring?: RecommendationResponse['scoring'];
}

export interface RecommendationRequest {
  symbol: string;
  closePrice: number;
  rsi: number;
  macdHistogram: number;
  volumeRatio: number;
  liquiditySweep: 'BULLISH' | 'BEARISH' | 'NONE';
  bidOfferImbalance: number;
  ema20: number;
  ema50: number;
  foreignFlowBillion: number;
  brokerNetBuyTop3Billion: number;
  tradingViewIndicators?: string[];
}

export interface StrategyResponse {
  style: string;
  recommendation: 'BUY' | 'SELL' | 'HOLD' | 'WATCH';
  entry: number;
  takeProfit: number;
  trailingStop: number;
  stopLoss: number;
  cutLoss: number;
  note: string;
}

export interface ScoringResponse {
  longScore: number;
  shortScore: number;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  mlProbabilityBuy: number;
  mlSignal: 'BUY' | 'SELL';
  mlNote: string;
}

export interface RecommendationResponse {
  symbol: string;
  generatedAt: string;
  methodology: string[];
  marketBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  scoring: ScoringResponse;
  brokerSummary: {
    foreignFlowBillion: number;
    top3BrokerNetBuyBillion: number;
    interpretation: string;
  };
  strategies: {
    dayTrading: StrategyResponse;
    swingTrading: StrategyResponse;
    scalping: StrategyResponse;
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

export interface AutoRecommendationRequest {
  symbol: string;
  liquiditySweep: 'BULLISH' | 'BEARISH' | 'NONE';
  bidOfferImbalance: number;
  foreignFlowBillion: number;
  brokerNetBuyTop3Billion: number;
  tradingViewIndicators?: string[];
}

export interface AutoRecommendationResponse {
  marketData: MarketDataResponse;
  recommendation: RecommendationResponse;
}

export interface TradingViewResponse {
  symbol: string;
  defaultInterval: string;
  exchange: string;
  indicators: string[];
  chartUrl: string;
}

export interface RecommendationStreamEvent {
  type?: string;
  symbol?: string;
  message?: string;
  [key: string]: unknown;
}

export interface RecommendationStreamOptions {
  intervalMs?: number;
  foreignFlowBillion?: number;
  brokerNetBuyTop3Billion?: number;
  indicators?: string[];
  style?: string;
}

export interface TechnicalSnapshot {
  source: string;
  symbol: string;
  snapshotAt: string;
  closePrice: number;
  volume: number;
  indicators: {
    rsi: number;
    macd: number;
    macdSignal: number;
    ema20: number;
    ema50: number;
  };
  rawPayload?: unknown;
  createdAt: string;
}

export interface MarketEventItem {
  source: string;
  type: 'CORPORATE_ACTION' | 'OFFICIAL_NEWS';
  symbol: string;
  title: string;
  eventDate: string;
  referenceUrl?: string;
  externalId?: string;
  rawPayload?: unknown;
  createdAt: string;
}

export interface MarketSyncStatus {
  source: string;
  startedAt: string;
  finishedAt?: string;
  status: string;
  message?: string;
  createdAt: string;
}

export type RecommendationStyle = 'DAILY' | 'SWING' | 'SCALPING';
export type RecommendationMode = 'COMBINED' | 'MACD_STOCH' | 'LIQUIDITY_SWEEP';

export interface MarketRecommendationQuery {
  style?: RecommendationStyle;
  mode?: RecommendationMode;
  source?: string;
  limit?: number;
  stochSetting?: string;
  stochBuyThreshold?: number;
  minVolumeRatio?: number;
}

export interface MarketRecommendationItem {
  symbol: string;
  name?: string;
  price?: number;
  score?: number;
  action?: 'BUY' | 'WATCH' | 'AVOID' | 'SELL' | 'HOLD';
  confidence?: 'LOW' | 'MEDIUM' | 'HIGH';
  mode?: RecommendationMode | string;
  style?: RecommendationStyle | string;
  source?: string;
  reasons?: string[];
  generatedAt?: string;
  candles?: Array<{
    timestamp?: number | string;
    time?: number | string;
    date?: string;
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    volume?: number;
    o?: number;
    h?: number;
    l?: number;
    c?: number;
    v?: number;
  }>;
  indicators?: {
    rsi?: unknown;
    macd?: unknown;
    stochastic?: unknown;
    ema?: unknown;
  };
  latest?: {
    rsi?: number;
    macdHistogram?: number;
    stochasticK?: number;
    stochasticD?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface ChartCandle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartDataResponse {
  symbol: string;
  interval: string;
  range: string;
  source?: {
    provider?: string;
    range?: string;
    interval?: string;
  };
  candles: ChartCandle[];
}

const toTimestamp = (value: unknown): number => {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return Date.now();
};

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseCandlesFromUnknown = (payload: unknown): ChartCandle[] => {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const root = payload as Record<string, unknown>;
  const nestedData =
    root.data && typeof root.data === 'object'
      ? (root.data as Record<string, unknown>)
      : null;

  const candidates = [
    root.candles,
    root.ohlcv,
    root.history,
    nestedData?.candles,
    nestedData?.ohlcv,
    nestedData?.history,
    nestedData?.prices,
  ];

  const rawSeries = candidates.find(Array.isArray);

  if (!Array.isArray(rawSeries)) {
    return [];
  }

  type CandleDraft = {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  } | null;

  const drafts: CandleDraft[] = rawSeries.map(entry => {
    if (Array.isArray(entry)) {
      return {
        timestamp: toTimestamp(entry[0]),
        open: toNumber(entry[1]),
        high: toNumber(entry[2]),
        low: toNumber(entry[3]),
        close: toNumber(entry[4]),
        volume: toNumber(entry[5], 0),
      };
    }

    if (!entry || typeof entry !== 'object') {
      return null;
    }

    const row = entry as Record<string, unknown>;
    return {
      timestamp: toTimestamp(
        row.timestamp ?? row.time ?? row.date ?? row.datetime,
      ),
      open: toNumber(row.open ?? row.o),
      high: toNumber(row.high ?? row.h),
      low: toNumber(row.low ?? row.l),
      close: toNumber(row.close ?? row.c),
      volume: toNumber(row.volume ?? row.v, 0),
    };
  });

  return drafts
    .filter((item): item is Exclude<CandleDraft, null> => {
      if (!item) {
        return false;
      }

      return (
        Number.isFinite(item.timestamp) &&
        Number.isFinite(item.open) &&
        Number.isFinite(item.high) &&
        Number.isFinite(item.low) &&
        Number.isFinite(item.close)
      );
    })
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(item => ({
      timestamp: item.timestamp,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume ?? 0,
    }));
};

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

const toArray = <T>(value: unknown): T[] => {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (
    value &&
    typeof value === 'object' &&
    Array.isArray((value as Record<string, unknown>).data)
  ) {
    return (value as Record<string, unknown>).data as T[];
  }

  return [];
};

const parseMarketRecommendations = (
  value: unknown,
): MarketRecommendationItem[] => {
  if (Array.isArray(value)) {
    return value as MarketRecommendationItem[];
  }

  if (!value || typeof value !== 'object') {
    return [];
  }

  const root = value as Record<string, unknown>;
  if (Array.isArray(root.data)) {
    return root.data as MarketRecommendationItem[];
  }

  if (root.data && typeof root.data === 'object') {
    const nested = root.data as Record<string, unknown>;
    if (Array.isArray(nested.items)) {
      return nested.items as MarketRecommendationItem[];
    }
    if (Array.isArray(nested.content)) {
      return nested.content as MarketRecommendationItem[];
    }
  }

  if (Array.isArray(root.items)) {
    return root.items as MarketRecommendationItem[];
  }

  if (Array.isArray(root.content)) {
    return root.content as MarketRecommendationItem[];
  }

  return [];
};

const buildStreamQuery = (options?: RecommendationStreamOptions) => {
  if (!options) {
    return '';
  }

  const pairs: string[] = [];
  const push = (key: string, value: string) => {
    pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  };

  if (typeof options.intervalMs === 'number') {
    push('intervalMs', String(options.intervalMs));
  }
  if (typeof options.foreignFlowBillion === 'number') {
    push('foreignFlowBillion', String(options.foreignFlowBillion));
  }
  if (typeof options.brokerNetBuyTop3Billion === 'number') {
    push('brokerNetBuyTop3Billion', String(options.brokerNetBuyTop3Billion));
  }
  if (Array.isArray(options.indicators) && options.indicators.length > 0) {
    push('indicators', options.indicators.join(','));
  }
  if (options.style) {
    push('style', options.style);
  }

  const query = pairs.join('&');
  return query ? `?${query}` : '';
};

export interface TrainingRequest {
  samples: TrainingSample[];
  learningRate?: number;
  epochs?: number;
}

export interface TrainingSample {
  rsi: number;
  macdHistogram: number;
  volumeRatio: number;
  bidOfferImbalance: number;
  emaSpreadPercent: number;
  foreignFlowBillion: number;
  brokerNetBuyTop3Billion: number;
  target: 'BUY' | 'SELL';
}

export interface TrainingResponse {
  status: string;
  training: {
    trainedSamples: number;
    epochs: number;
    learningRate: number;
    lastTrainedAt: string;
    trainAccuracy: number;
  };
  weights: Record<string, number>;
}

export interface HealthResponse {
  appName: string;
  version: string;
  description: string;
  endpoints: Record<string, string>;
  ml: {
    enabled: boolean;
    note: string;
    training: {
      trainedSamples: number;
      epochs: number;
      learningRate: number;
      lastTrainedAt: string | null;
    };
  };
}

const unwrapResponse = <T>(payload: APIResponse<T> | T): T => {
  if (
    payload &&
    typeof payload === 'object' &&
    'status' in (payload as APIResponse<T>) &&
    'message' in (payload as APIResponse<T>) &&
    'data' in (payload as APIResponse<T>)
  ) {
    return (payload as APIResponse<T>).data;
  }

  return payload as T;
};

export const stockAnalyzerApi = {
  getHealth: async (): Promise<HealthResponse> => {
    const response = await api.get<
      APIResponse<HealthResponse> | HealthResponse
    >(`${STOCKPILOT_PREFIX}/`);

    return unwrapResponse(response.data);
  },

  getMarketData: async (symbol: string): Promise<MarketDataResponse> => {
    const response = await api.get<
      APIResponse<MarketDataResponse> | MarketDataResponse
    >(`${STOCKPILOT_PREFIX}/stock-analysis/market-data/${symbol}`);

    return unwrapResponse(response.data);
  },

  getMarketDataWithParams: async (
    symbol: string,
    params?: { interval?: string; range?: string; limit?: number },
  ): Promise<MarketDataResponse> => {
    const response = await api.get<
      APIResponse<MarketDataResponse> | MarketDataResponse
    >(`${STOCKPILOT_PREFIX}/stock-analysis/market-data/${symbol}`, { params });

    return unwrapResponse(response.data);
  },

  getRecommendation: async (
    payload: RecommendationRequest,
  ): Promise<RecommendationResponse> => {
    const response = await api.post<
      APIResponse<RecommendationResponse> | RecommendationResponse
    >(`${STOCKPILOT_PREFIX}/stock-analysis/recommendation`, payload);

    return unwrapResponse(response.data);
  },

  getAutoRecommendation: async (
    payload: AutoRecommendationRequest,
  ): Promise<AutoRecommendationResponse> => {
    const response = await api.post<
      APIResponse<AutoRecommendationResponse> | AutoRecommendationResponse
    >(`${STOCKPILOT_PREFIX}/stock-analysis/recommendation/auto`, payload);

    return unwrapResponse(response.data);
  },

  getTradingViewConfig: async (
    symbol: string,
    indicators?: string[],
  ): Promise<TradingViewResponse> => {
    const params = indicators ? { indicators: indicators.join(',') } : {};

    const response = await api.get<
      APIResponse<TradingViewResponse> | TradingViewResponse
    >(`${STOCKPILOT_PREFIX}/stock-analysis/tradingview/${symbol}`, { params });

    return unwrapResponse(response.data);
  },

  getChartData: async (
    symbol: string,
    params?: { interval?: string; range?: string; limit?: number },
  ): Promise<ChartDataResponse> => {
    const normalizedSymbol = symbol.trim().toUpperCase();
    const interval = params?.interval ?? '1d';
    const range = params?.range ?? '6mo';
    const query = {
      interval,
      range,
      ...(params?.limit ? { limit: params.limit } : {}),
    };

    const response = await api.get<unknown>(
      `${STOCKPILOT_PREFIX}/stock-analysis/market-data/${normalizedSymbol}`,
      { params: query },
    );
    const payload = response.data;

    const unwrappedPayload = unwrapResponse(payload as any) as Record<
      string,
      unknown
    >;
    const source =
      unwrappedPayload.source && typeof unwrappedPayload.source === 'object'
        ? (unwrappedPayload.source as ChartDataResponse['source'])
        : undefined;

    return {
      symbol:
        (typeof unwrappedPayload.symbol === 'string'
          ? unwrappedPayload.symbol
          : normalizedSymbol) ?? normalizedSymbol,
      interval:
        typeof source?.interval === 'string' ? source.interval : interval,
      range: typeof source?.range === 'string' ? source.range : range,
      source,
      candles: parseCandlesFromUnknown(unwrappedPayload),
    };
  },

  createRecommendationStream: (
    symbol: string,
    options: RecommendationStreamOptions | undefined,
    handlers: {
      onMessage: (event: RecommendationStreamEvent) => void;
      onError?: (error: unknown) => void;
      onOpen?: () => void;
    },
  ) => {
    const EventSourceCtor = (globalThis as any).EventSource;

    if (!EventSourceCtor) {
      throw new Error(
        'EventSource belum tersedia di runtime ini. Gunakan library SSE untuk React Native atau polyfill EventSource.',
      );
    }

    const path = `${STOCKPILOT_PREFIX}/stock-analysis/stream/${symbol}${buildStreamQuery(options)}`;
    const baseURL = (api.defaults.baseURL ?? '').replace(/\/$/, '');
    const url = `${baseURL}${path}`;
    const stream = new EventSourceCtor(url);

    stream.onopen = () => {
      handlers.onOpen?.();
    };

    stream.onmessage = (message: { data?: string }) => {
      if (!message?.data) {
        return;
      }

      try {
        handlers.onMessage(JSON.parse(message.data));
      } catch {
        handlers.onMessage({ type: 'message', symbol, message: message.data });
      }
    };

    stream.onerror = (error: unknown) => {
      handlers.onError?.(error);
    };

    return {
      close: () => stream.close(),
      url,
    };
  },

  getTechnicalSnapshots: async (params?: {
    symbol?: string;
    source?: string;
    from?: string;
    to?: string;
    limit?: number;
  }): Promise<TechnicalSnapshot[]> => {
    const response = await api.get<unknown>(
      `${STOCKPILOT_PREFIX}/market/technical`,
      {
        params,
      },
    );

    const payload = unwrapResponse(response.data as any);
    return toArray<TechnicalSnapshot>(payload);
  },

  getMarketEvents: async (params?: {
    symbol?: string;
    type?: 'CORPORATE_ACTION' | 'OFFICIAL_NEWS';
    source?: string;
    from?: string;
    to?: string;
    limit?: number;
  }): Promise<MarketEventItem[]> => {
    const response = await api.get<unknown>(
      `${STOCKPILOT_PREFIX}/market/events`,
      {
        params,
      },
    );

    const payload = unwrapResponse(response.data as any);
    return toArray<MarketEventItem>(payload);
  },

  getMarketSyncStatus: async (params?: {
    source?: string;
    limit?: number;
  }): Promise<MarketSyncStatus[]> => {
    const response = await api.get<unknown>(
      `${STOCKPILOT_PREFIX}/market/sync-status`,
      {
        params,
      },
    );

    const payload = unwrapResponse(response.data as any);
    return toArray<MarketSyncStatus>(payload);
  },

  getMarketRecommendations: async (
    query?: MarketRecommendationQuery,
  ): Promise<MarketRecommendationItem[]> => {
    const params = {
      style: query?.style ?? 'SWING',
      mode: query?.mode ?? 'COMBINED',
      source: query?.source ?? 'TRADINGVIEW',
      limit: query?.limit ?? 30,
      ...(query?.stochSetting ? { stochSetting: query.stochSetting } : {}),
      ...(typeof query?.stochBuyThreshold === 'number'
        ? { stochBuyThreshold: query.stochBuyThreshold }
        : {}),
      ...(typeof query?.minVolumeRatio === 'number'
        ? { minVolumeRatio: query.minVolumeRatio }
        : {}),
    };

    const response = await api.get<unknown>(
      `${STOCKPILOT_PREFIX}/market/recommendations`,
      { params },
    );

    const payload = unwrapResponse(response.data as any);
    return parseMarketRecommendations(payload);
  },

  parseMarketDataWithFallback: (payload: unknown): MarketDataResponse => {
    const unwrapped = toRecord(unwrapResponse(payload as any));
    const source = toRecord(unwrapped.source);

    return {
      symbol: String(unwrapped.symbol ?? ''),
      closePrice: toNumber(unwrapped.closePrice),
      livePrice: toNumber(unwrapped.livePrice, 0),
      isRealTime: Boolean(unwrapped.isRealTime),
      lastUpdatedAt: String(unwrapped.lastUpdatedAt ?? ''),
      indicators: {
        rsi: toNumber(toRecord(unwrapped.indicators).rsi),
        macdHistogram: toNumber(toRecord(unwrapped.indicators).macdHistogram),
        volumeRatio: toNumber(toRecord(unwrapped.indicators).volumeRatio),
        ema20: toNumber(toRecord(unwrapped.indicators).ema20),
        ema50: toNumber(toRecord(unwrapped.indicators).ema50),
      },
      candles: parseCandlesFromUnknown(unwrapped),
      source: {
        provider: String(source.provider ?? ''),
        range: String(source.range ?? ''),
        interval: String(source.interval ?? ''),
      },
      recommendation: toRecord(
        unwrapped.recommendation,
      ) as unknown as RecommendationResponse,
      marketBias: unwrapped.marketBias as RecommendationResponse['marketBias'],
      strategies: toRecord(
        unwrapped.strategies,
      ) as unknown as RecommendationResponse['strategies'],
      tradingView: toRecord(
        unwrapped.tradingView,
      ) as unknown as RecommendationResponse['tradingView'],
      scoring: toRecord(
        unwrapped.scoring,
      ) as unknown as RecommendationResponse['scoring'],
    };
  },

  trainModel: async (payload: TrainingRequest): Promise<TrainingResponse> => {
    const response = await api.post<
      APIResponse<TrainingResponse> | TrainingResponse
    >(`${STOCKPILOT_PREFIX}/stock-analysis/ml/train`, payload);

    return unwrapResponse(response.data);
  },
};
