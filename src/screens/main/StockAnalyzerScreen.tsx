import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  mapApiAutoRecommendationToUI,
  mapApiRecommendationToUI,
} from '@/utils/recommendationMapper';
import {
  stockAnalyzerApi,
  type ChartCandle,
  type MarketEventItem,
  type MarketDataResponse,
  type MarketRecommendationItem,
  type MarketSyncStatus,
  type RecommendationMode,
  type RecommendationResponse,
  type RecommendationStyle,
  type RecommendationStreamEvent,
  type TechnicalSnapshot,
} from '@/services/stockAnalyzerApi';
import type {
  ApiAutoRecommendation,
  ApiRecommendation,
  LiquiditySweepStatus,
} from '@/types/stock-analyzer';
import { StockRecommendation, TradingStyle } from '@/types/stock-analyzer';
import NativeTradingChart from '@/components/NativeTradingChart';

type ViewMode = 'quick' | 'manual' | 'market' | 'intelligence';
type LiquidityMode = 'BULLISH' | 'BEARISH' | 'NONE';
type StreamStatus = 'idle' | 'connecting' | 'live' | 'error';

const STYLE_TABS: { label: string; value: TradingStyle; desc: string }[] = [
  {
    label: 'Day Trading',
    value: 'day',
    desc: 'Fokus intraday momentum + volume spike.',
  },
  {
    label: 'Swing Trading',
    value: 'swing',
    desc: 'Fokus trend menengah dengan setup 4H/1D.',
  },
  {
    label: 'Scalping',
    value: 'scalping',
    desc: 'Fokus spread tipis dan eksekusi cepat.',
  },
];

const VIEW_MODES: { label: string; value: ViewMode; desc: string }[] = [
  { label: '⚡ Quick Scan', value: 'quick', desc: 'Auto fetch market data' },
  { label: '🎯 Manual', value: 'manual', desc: 'Input indikator manual' },
  { label: '📊 Market Data', value: 'market', desc: 'Lihat data pasar live' },
  {
    label: '🧠 Market Intelligence',
    value: 'intelligence',
    desc: 'Data technical, news, dan sync status',
  },
];

const actionColor: Record<StockRecommendation['action'], string> = {
  BUY: '#22c55e',
  WATCH: '#f59e0b',
  AVOID: '#ef4444',
};

const confidenceLabel: Record<StockRecommendation['confidence'], string> = {
  HIGH: 'Tinggi',
  MEDIUM: 'Sedang',
  LOW: 'Rendah',
};

const formatIDR = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

const DEFAULT_CHART_RANGE = '6mo';

const STREAM_DEFAULT_INTERVAL_MS = 5000;

const HOME_STYLE_OPTIONS: RecommendationStyle[] = [
  'DAILY',
  'SWING',
  'SCALPING',
];
const HOME_MODE_OPTIONS: RecommendationMode[] = [
  'COMBINED',
  'MACD_STOCH',
  'LIQUIDITY_SWEEP',
];

const formatDateTime = (value?: string) => {
  if (!value) {
    return '-';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString('id-ID');
};

const extractRecommendationFromStreamEvent = (
  event: RecommendationStreamEvent,
): RecommendationResponse | null => {
  const eventRecord =
    event && typeof event === 'object'
      ? (event as Record<string, unknown>)
      : {};

  if (
    eventRecord.recommendation &&
    typeof eventRecord.recommendation === 'object'
  ) {
    return eventRecord.recommendation as RecommendationResponse;
  }

  if (eventRecord.data && typeof eventRecord.data === 'object') {
    const nested = eventRecord.data as Record<string, unknown>;
    if (nested.recommendation && typeof nested.recommendation === 'object') {
      return nested.recommendation as RecommendationResponse;
    }
  }

  return null;
};

const mapRecommendationTimeframeToInterval = (timeframe?: string) => {
  if (!timeframe) {
    return '60m';
  }

  if (timeframe.toUpperCase().includes('1D')) {
    return '1d';
  }

  return '60m';
};

const mapHomeStyleToInterval = (style: RecommendationStyle) => {
  if (style === 'DAILY') {
    return '1d';
  }

  if (style === 'SCALPING') {
    return '15m';
  }

  return '4h';
};

const normalizeSymbol = (symbol: string) =>
  symbol.replace('IDX:', '').replace('.JK', '').trim().toUpperCase();

const parseHomeRecommendationCandles = (
  item: MarketRecommendationItem,
): ChartCandle[] => {
  if (!Array.isArray(item.candles)) {
    return [];
  }

  const parsed = item.candles
    .map(candle => {
      const timestampValue =
        candle.timestamp ?? candle.time ?? candle.date ?? Date.now();

      const timestamp =
        typeof timestampValue === 'number'
          ? timestampValue
          : Date.parse(String(timestampValue));

      const open = Number(candle.open ?? candle.o);
      const high = Number(candle.high ?? candle.h);
      const low = Number(candle.low ?? candle.l);
      const close = Number(candle.close ?? candle.c);
      const volume = Number(candle.volume ?? candle.v ?? 0);

      if (
        !Number.isFinite(timestamp) ||
        !Number.isFinite(open) ||
        !Number.isFinite(high) ||
        !Number.isFinite(low) ||
        !Number.isFinite(close)
      ) {
        return null;
      }

      return {
        timestamp,
        open,
        high,
        low,
        close,
        volume: Number.isFinite(volume) ? volume : 0,
      };
    })
    .filter((candle): candle is ChartCandle => Boolean(candle))
    .sort((a, b) => a.timestamp - b.timestamp);

  return parsed;
};

export const StockAnalyzerScreen = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('quick');
  const [selectedStyle, setSelectedStyle] = useState<TradingStyle>('day');
  const [chartSymbol, setChartSymbol] = useState<string | null>(null);
  const [chartInterval, setChartInterval] = useState('60m');
  const [chartData, setChartData] = useState<ChartCandle[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState('');

  // Quick scan state
  const [quickSymbol, setQuickSymbol] = useState('BBCA');
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickData, setQuickData] = useState<ApiAutoRecommendation | null>(
    null,
  );
  const [quickError, setQuickError] = useState('');

  // Manual state
  const [manualSymbol, setManualSymbol] = useState('BBCA');
  const [manualPrice, setManualPrice] = useState('10125');
  const [manualRsi, setManualRsi] = useState('60');
  const [manualMacd, setManualMacd] = useState('150');
  const [manualVolume, setManualVolume] = useState('1.3');
  const [manualLiquidity, setManualLiquidity] =
    useState<LiquidityMode>('BULLISH');
  const [manualBidOffer, setManualBidOffer] = useState('0.25');
  const [manualEma20, setManualEma20] = useState('10000');
  const [manualEma50, setManualEma50] = useState('9900');
  const [manualForeignFlow, setManualForeignFlow] = useState('15');
  const [manualBrokerFlow, setManualBrokerFlow] = useState('8');
  const [manualLoading, setManualLoading] = useState(false);
  const [manualData, setManualData] = useState<ApiRecommendation | null>(null);
  const [manualError, setManualError] = useState('');

  // Market data state
  const [marketSymbol, setMarketSymbol] = useState('BBCA');
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketData, setMarketData] = useState<MarketDataResponse | null>(null);
  const [marketError, setMarketError] = useState('');

  // Realtime stream state
  const [streamStatus, setStreamStatus] = useState<StreamStatus>('idle');
  const [streamError, setStreamError] = useState('');
  const [streamMessage, setStreamMessage] = useState('');
  const [streamRecommendation, setStreamRecommendation] =
    useState<RecommendationResponse | null>(null);
  const [streamLastUpdateAt, setStreamLastUpdateAt] = useState('');
  const streamRef = useRef<{ close: () => void; url?: string } | null>(null);

  // Market Intelligence state
  const [intelSymbol, setIntelSymbol] = useState('BBCA');
  const [intelSource, setIntelSource] = useState('');
  const [intelFrom, setIntelFrom] = useState('');
  const [intelTo, setIntelTo] = useState('');
  const [intelLimit, setIntelLimit] = useState('20');
  const [intelEventType, setIntelEventType] = useState<
    'CORPORATE_ACTION' | 'OFFICIAL_NEWS'
  >('OFFICIAL_NEWS');
  const [intelLoading, setIntelLoading] = useState(false);
  const [intelError, setIntelError] = useState('');
  const [technicalData, setTechnicalData] = useState<TechnicalSnapshot[]>([]);
  const [eventData, setEventData] = useState<MarketEventItem[]>([]);
  const [syncStatusData, setSyncStatusData] = useState<MarketSyncStatus[]>([]);

  // Home recommendation list state
  const [homeRecStyle, setHomeRecStyle] =
    useState<RecommendationStyle>('SWING');
  const [homeRecMode, setHomeRecMode] =
    useState<RecommendationMode>('COMBINED');
  const [homeRecSource, setHomeRecSource] = useState('TRADINGVIEW');
  const [homeRecLimit, setHomeRecLimit] = useState('30');
  const [homeStochSetting, setHomeStochSetting] = useState('');
  const [homeStochBuyThreshold, setHomeStochBuyThreshold] = useState('');
  const [homeMinVolumeRatio, setHomeMinVolumeRatio] = useState('');
  const [homeRecLoading, setHomeRecLoading] = useState(false);
  const [homeRecError, setHomeRecError] = useState('');
  const [homeRecommendations, setHomeRecommendations] = useState<
    MarketRecommendationItem[]
  >([]);

  const handleQuickScan = useCallback(async () => {
    if (!quickSymbol.trim()) {
      setQuickError('Symbol tidak boleh kosong');
      return;
    }

    setQuickLoading(true);
    setQuickError('');

    try {
      const result = await stockAnalyzerApi.getAutoRecommendation({
        symbol: quickSymbol.trim().toUpperCase(),
        liquiditySweep: 'BULLISH',
        bidOfferImbalance: 0.25,
        foreignFlowBillion: 15.5,
        brokerNetBuyTop3Billion: 8.3,
        tradingViewIndicators: ['RSI', 'MACD', 'VWAP', 'EMA'],
      });

      setQuickData(result);
    } catch (err: any) {
      setQuickError(err.message || 'Gagal ambil data recommendation');
      console.error('Quick scan error:', err);
    } finally {
      setQuickLoading(false);
    }
  }, [quickSymbol]);

  const handleManualRecommendation = useCallback(async () => {
    if (!manualSymbol.trim()) {
      setManualError('Symbol tidak boleh kosong');
      return;
    }

    setManualLoading(true);
    setManualError('');

    try {
      const result = await stockAnalyzerApi.getRecommendation({
        symbol: manualSymbol.trim().toUpperCase(),
        closePrice: parseFloat(manualPrice) || 0,
        rsi: parseFloat(manualRsi) || 50,
        macdHistogram: parseFloat(manualMacd) || 0,
        volumeRatio: parseFloat(manualVolume) || 1,
        liquiditySweep: manualLiquidity as LiquiditySweepStatus,
        bidOfferImbalance: parseFloat(manualBidOffer) || 0,
        ema20: parseFloat(manualEma20) || 0,
        ema50: parseFloat(manualEma50) || 0,
        foreignFlowBillion: parseFloat(manualForeignFlow) || 0,
        brokerNetBuyTop3Billion: parseFloat(manualBrokerFlow) || 0,
        tradingViewIndicators: ['RSI', 'MACD', 'VWAP'],
      });

      setManualData(result);
    } catch (err: any) {
      setManualError(err.message || 'Gagal generate recommendation');
      console.error('Manual recommendation error:', err);
    } finally {
      setManualLoading(false);
    }
  }, [
    manualSymbol,
    manualPrice,
    manualRsi,
    manualMacd,
    manualVolume,
    manualLiquidity,
    manualBidOffer,
    manualEma20,
    manualEma50,
    manualForeignFlow,
    manualBrokerFlow,
  ]);

  const handleFetchMarketData = useCallback(async () => {
    if (!marketSymbol.trim()) {
      setMarketError('Symbol tidak boleh kosong');
      return;
    }

    setMarketLoading(true);
    setMarketError('');

    try {
      const response = await stockAnalyzerApi.getMarketDataWithParams(
        marketSymbol.trim().toUpperCase(),
        {
          interval: chartInterval,
          range: DEFAULT_CHART_RANGE,
          limit: 300,
        },
      );

      const normalized = stockAnalyzerApi.parseMarketDataWithFallback(response);
      setMarketData(normalized);

      if (!normalized.candles?.length) {
        setMarketError(
          'Market data masuk, tetapi backend belum mengirim candle historis.',
        );
      }
    } catch (err: any) {
      setMarketError(err.message || 'Gagal ambil market data');
      setMarketData(null);
      console.error('Market data error:', err);
    } finally {
      setMarketLoading(false);
    }
  }, [marketSymbol, chartInterval]);

  const stopRealtimeStream = useCallback(() => {
    streamRef.current?.close();
    streamRef.current = null;
    setStreamStatus('idle');
  }, []);

  const startRealtimeStream = useCallback(() => {
    const symbol = marketSymbol.trim().toUpperCase();

    if (!symbol) {
      setStreamError('Symbol realtime stream tidak boleh kosong.');
      setStreamStatus('error');
      return;
    }

    streamRef.current?.close();
    setStreamStatus('connecting');
    setStreamError('');
    setStreamMessage('Menyambungkan stream realtime...');

    try {
      const stream = stockAnalyzerApi.createRecommendationStream(
        symbol,
        {
          intervalMs: STREAM_DEFAULT_INTERVAL_MS,
          foreignFlowBillion: parseFloat(manualForeignFlow) || 0,
          brokerNetBuyTop3Billion: parseFloat(manualBrokerFlow) || 0,
          indicators: ['RSI', 'MACD', 'EMA'],
          style: selectedStyle,
        },
        {
          onOpen: () => {
            setStreamStatus('live');
            setStreamMessage('Stream realtime aktif.');
          },
          onMessage: event => {
            if (event.type === 'error') {
              setStreamStatus('error');
              setStreamError(
                event.message ||
                  `Stream error untuk ${event.symbol || symbol}.`,
              );
              setStreamMessage('');
              return;
            }

            const recommendation = extractRecommendationFromStreamEvent(event);
            if (recommendation) {
              setStreamRecommendation(recommendation);
            }

            setStreamStatus('live');
            setStreamError('');
            setStreamLastUpdateAt(new Date().toISOString());
            setStreamMessage(
              event.message ||
                `Update realtime diterima untuk ${event.symbol || symbol}.`,
            );
          },
          onError: error => {
            setStreamStatus('error');
            setStreamMessage('');
            setStreamError(
              error instanceof Error
                ? error.message
                : 'Terjadi error pada koneksi stream realtime.',
            );
          },
        },
      );

      streamRef.current = stream;
    } catch (error) {
      setStreamStatus('error');
      setStreamMessage('');
      setStreamError(
        error instanceof Error
          ? error.message
          : 'Stream realtime belum didukung di device ini.',
      );
    }
  }, [manualBrokerFlow, manualForeignFlow, marketSymbol, selectedStyle]);

  const loadMarketIntelligence = useCallback(async () => {
    setIntelLoading(true);
    setIntelError('');

    const symbol = intelSymbol.trim().toUpperCase();
    const normalizedLimit = Math.max(
      1,
      Math.min(100, parseInt(intelLimit, 10) || 20),
    );

    try {
      const [technical, events, sync] = await Promise.all([
        stockAnalyzerApi.getTechnicalSnapshots({
          symbol: symbol || undefined,
          source: intelSource.trim() || undefined,
          from: intelFrom.trim() || undefined,
          to: intelTo.trim() || undefined,
          limit: normalizedLimit,
        }),
        stockAnalyzerApi.getMarketEvents({
          symbol: symbol || undefined,
          source: intelSource.trim() || undefined,
          type: intelEventType,
          from: intelFrom.trim() || undefined,
          to: intelTo.trim() || undefined,
          limit: normalizedLimit,
        }),
        stockAnalyzerApi.getMarketSyncStatus({
          source: intelSource.trim() || undefined,
          limit: normalizedLimit,
        }),
      ]);

      setTechnicalData(technical);
      setEventData(events);
      setSyncStatusData(sync);
    } catch (error) {
      setIntelError(
        error instanceof Error
          ? error.message
          : 'Gagal memuat data market intelligence.',
      );
      setTechnicalData([]);
      setEventData([]);
      setSyncStatusData([]);
    } finally {
      setIntelLoading(false);
    }
  }, [
    intelEventType,
    intelFrom,
    intelLimit,
    intelSource,
    intelSymbol,
    intelTo,
  ]);

  const loadHomeRecommendations = useCallback(async () => {
    setHomeRecLoading(true);
    setHomeRecError('');

    try {
      const parsedLimit = Math.max(
        1,
        Math.min(100, parseInt(homeRecLimit, 10) || 30),
      );
      const parsedStochBuyThreshold =
        homeStochBuyThreshold.trim() === ''
          ? undefined
          : parseFloat(homeStochBuyThreshold);
      const parsedMinVolumeRatio =
        homeMinVolumeRatio.trim() === ''
          ? undefined
          : parseFloat(homeMinVolumeRatio);

      const response = await stockAnalyzerApi.getMarketRecommendations({
        style: homeRecStyle,
        mode: homeRecMode,
        source: homeRecSource.trim() || 'TRADINGVIEW',
        limit: parsedLimit,
        stochSetting: homeStochSetting.trim() || undefined,
        stochBuyThreshold:
          typeof parsedStochBuyThreshold === 'number' &&
          Number.isFinite(parsedStochBuyThreshold)
            ? parsedStochBuyThreshold
            : undefined,
        minVolumeRatio:
          typeof parsedMinVolumeRatio === 'number' &&
          Number.isFinite(parsedMinVolumeRatio)
            ? parsedMinVolumeRatio
            : undefined,
      });

      setHomeRecommendations(response);

      if (!response.length) {
        setHomeRecError('Belum ada saham yang lolos rule untuk filter ini.');
      }
    } catch (error) {
      setHomeRecommendations([]);
      setHomeRecError(
        error instanceof Error
          ? error.message
          : 'Gagal memuat list rekomendasi home.',
      );
    } finally {
      setHomeRecLoading(false);
    }
  }, [
    homeMinVolumeRatio,
    homeRecLimit,
    homeRecMode,
    homeRecSource,
    homeRecStyle,
    homeStochBuyThreshold,
    homeStochSetting,
  ]);

  useEffect(() => {
    return () => {
      streamRef.current?.close();
      streamRef.current = null;
    };
  }, []);

  useEffect(() => {
    loadHomeRecommendations();
  }, [loadHomeRecommendations]);

  // Get recommendations based on current data
  const recommendations = useMemo(() => {
    if (viewMode === 'quick' && quickData) {
      return mapApiAutoRecommendationToUI(quickData);
    }
    if (viewMode === 'manual' && manualData) {
      return mapApiRecommendationToUI(manualData);
    }
    if (viewMode === 'market' && streamRecommendation) {
      return mapApiRecommendationToUI(streamRecommendation);
    }
    if (viewMode === 'market' && marketData?.recommendation) {
      return mapApiRecommendationToUI(marketData.recommendation);
    }
    return [];
  }, [viewMode, quickData, manualData, marketData, streamRecommendation]);

  const selectedRecommendation = recommendations.find(
    rec => rec.style === selectedStyle,
  );

  const loadNativeChart = useCallback(
    async (symbol: string, interval: string) => {
      setChartLoading(true);
      setChartError('');

      try {
        const response = await stockAnalyzerApi.getChartData(symbol, {
          interval,
          range: DEFAULT_CHART_RANGE,
          limit: 280,
        });

        setChartData(response.candles);

        if (!response.candles.length) {
          setChartError(
            'Data candle belum tersedia dari backend scraping untuk simbol ini.',
          );
        }
      } catch (err: any) {
        setChartError(
          err?.message || 'Gagal mengambil chart data dari backend.',
        );
        setChartData([]);
        console.error('Load native chart error:', err);
      } finally {
        setChartLoading(false);
      }
    },
    [],
  );

  const openNativeChart = useCallback(
    async (symbol: string) => {
      const recommendation = selectedRecommendation;
      const nextInterval = mapRecommendationTimeframeToInterval(
        recommendation?.strategy.timeframe,
      );

      setChartSymbol(`IDX:${symbol.toUpperCase()}`);
      setChartInterval(nextInterval);
      await loadNativeChart(symbol, nextInterval);
    },
    [loadNativeChart, selectedRecommendation],
  );

  const handleChangeChartInterval = useCallback(
    async (nextInterval: string) => {
      if (!chartSymbol) {
        return;
      }

      setChartInterval(nextInterval);
      const normalized = chartSymbol.replace('IDX:', '');
      await loadNativeChart(normalized, nextInterval);
    },
    [chartSymbol, loadNativeChart],
  );

  const handleOpenHomeRecommendationChart = useCallback(
    async (item: MarketRecommendationItem) => {
      const symbol = normalizeSymbol(item.symbol || '');

      if (!symbol) {
        return;
      }

      const nextInterval = mapHomeStyleToInterval(homeRecStyle);
      const localCandles = parseHomeRecommendationCandles(item);

      setChartSymbol(`IDX:${symbol}`);
      setChartInterval(nextInterval);
      setChartError('');

      if (localCandles.length > 0) {
        setChartData(localCandles);
        setChartLoading(false);
        return;
      }

      await loadNativeChart(symbol, nextInterval);
    },
    [homeRecStyle, loadNativeChart],
  );

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.overline}>StockPilot IDX Analyzer</Text>
        <Text style={styles.heroTitle}>API-Powered Stock Recommendation</Text>
        <Text style={styles.heroSubtitle}>
          Analisis real-time berbasis teknikal, liquidity sweep, dan ML.
        </Text>
      </View>

      <View style={styles.homeRecCard}>
        <Text style={styles.homeRecTitle}>Home Recommendation List</Text>
        <Text style={styles.homeRecSubtitle}>
          Endpoint market/recommendations dengan default Swing + Combined.
        </Text>

        <Text style={styles.homeRecLabel}>Style</Text>
        <View style={styles.homeRecFilterRow}>
          {HOME_STYLE_OPTIONS.map(style => {
            const active = homeRecStyle === style;
            return (
              <Pressable
                key={style}
                style={[styles.homeRecChip, active && styles.homeRecChipActive]}
                onPress={() => setHomeRecStyle(style)}
              >
                <Text
                  style={[
                    styles.homeRecChipText,
                    active && styles.homeRecChipTextActive,
                  ]}
                >
                  {style}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.homeRecLabel}>Mode</Text>
        <View style={styles.homeRecFilterRow}>
          {HOME_MODE_OPTIONS.map(mode => {
            const active = homeRecMode === mode;
            return (
              <Pressable
                key={mode}
                style={[styles.homeRecChip, active && styles.homeRecChipActive]}
                onPress={() => setHomeRecMode(mode)}
              >
                <Text
                  style={[
                    styles.homeRecChipText,
                    active && styles.homeRecChipTextActive,
                  ]}
                >
                  {mode}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Source (default TRADINGVIEW)"
          placeholderTextColor="#8eb5c5"
          value={homeRecSource}
          onChangeText={setHomeRecSource}
        />
        <TextInput
          style={styles.input}
          placeholder="Limit (default 30)"
          placeholderTextColor="#8eb5c5"
          keyboardType="number-pad"
          value={homeRecLimit}
          onChangeText={setHomeRecLimit}
        />

        <Text style={styles.homeRecAdvancedTitle}>
          Advanced Override (Opsional)
        </Text>
        <TextInput
          style={styles.input}
          placeholder="stochSetting, contoh 10,5,5"
          placeholderTextColor="#8eb5c5"
          value={homeStochSetting}
          onChangeText={setHomeStochSetting}
        />
        <TextInput
          style={styles.input}
          placeholder="stochBuyThreshold, contoh 78"
          placeholderTextColor="#8eb5c5"
          keyboardType="decimal-pad"
          value={homeStochBuyThreshold}
          onChangeText={setHomeStochBuyThreshold}
        />
        <TextInput
          style={styles.input}
          placeholder="minVolumeRatio, contoh 1.1"
          placeholderTextColor="#8eb5c5"
          keyboardType="decimal-pad"
          value={homeMinVolumeRatio}
          onChangeText={setHomeMinVolumeRatio}
        />

        <Pressable
          style={[styles.button, homeRecLoading && styles.buttonDisabled]}
          onPress={loadHomeRecommendations}
          disabled={homeRecLoading}
        >
          {homeRecLoading ? (
            <ActivityIndicator color="#faf5ff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Refresh Home Recommendations</Text>
          )}
        </Pressable>

        {homeRecError ? (
          <Text style={styles.errorText}>{homeRecError}</Text>
        ) : null}

        <View style={styles.homeRecList}>
          {homeRecommendations.slice(0, 10).map((item, index) => (
            <Pressable
              key={`${item.symbol}-${item.generatedAt || item.score || index}`}
              style={styles.homeRecItem}
              onPress={() => handleOpenHomeRecommendationChart(item)}
            >
              <View style={styles.homeRecItemHeader}>
                <Text style={styles.homeRecSymbol}>{item.symbol}</Text>
                <Text style={styles.homeRecAction}>{item.action || '-'}</Text>
              </View>
              <Text style={styles.homeRecMeta}>
                Score:{' '}
                {typeof item.score === 'number' ? item.score.toFixed(2) : '-'} |
                Confidence: {item.confidence || '-'}
              </Text>
              <Text style={styles.homeRecMeta}>
                Mode: {item.mode || homeRecMode} | Style:{' '}
                {item.style || homeRecStyle}
              </Text>
              {item.latest ? (
                <Text style={styles.homeRecMeta}>
                  RSI: {Number(item.latest.rsi ?? 0).toFixed(2)} | MACD Hist:{' '}
                  {Number(item.latest.macdHistogram ?? 0).toFixed(3)} | Stoch
                  K/D: {Number(item.latest.stochasticK ?? 0).toFixed(2)}/
                  {Number(item.latest.stochasticD ?? 0).toFixed(2)}
                </Text>
              ) : null}
              {Array.isArray(item.reasons) && item.reasons.length > 0 ? (
                <Text style={styles.homeRecReason}>• {item.reasons[0]}</Text>
              ) : null}
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.modeTabs}>
        {VIEW_MODES.map(mode => {
          const isActive = viewMode === mode.value;
          return (
            <Pressable
              key={mode.value}
              onPress={() => {
                setViewMode(mode.value);
                setSelectedStyle('day');
              }}
              style={[styles.modeTab, isActive && styles.modeTabActive]}
            >
              <Text
                style={[styles.modeLabel, isActive && styles.modeLabelActive]}
              >
                {mode.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {viewMode === 'quick' && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Quick Scan (Auto Market Data)</Text>
          <TextInput
            style={styles.input}
            placeholder="Symbol (e.g., BBCA)"
            placeholderTextColor="#8eb5c5"
            value={quickSymbol}
            onChangeText={setQuickSymbol}
          />
          {quickError ? (
            <Text style={styles.errorText}>{quickError}</Text>
          ) : null}
          <Pressable
            style={[styles.button, quickLoading && styles.buttonDisabled]}
            onPress={handleQuickScan}
            disabled={quickLoading}
          >
            {quickLoading ? (
              <ActivityIndicator color="#faf5ff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Scan & Analyze</Text>
            )}
          </Pressable>
        </View>
      )}

      {viewMode === 'manual' && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Manual Recommendation</Text>
          <TextInput
            style={styles.input}
            placeholder="Symbol"
            placeholderTextColor="#8eb5c5"
            value={manualSymbol}
            onChangeText={setManualSymbol}
          />
          <TextInput
            style={styles.input}
            placeholder="Close Price"
            placeholderTextColor="#8eb5c5"
            keyboardType="decimal-pad"
            value={manualPrice}
            onChangeText={setManualPrice}
          />
          <TextInput
            style={styles.input}
            placeholder="RSI (0-100)"
            placeholderTextColor="#8eb5c5"
            keyboardType="decimal-pad"
            value={manualRsi}
            onChangeText={setManualRsi}
          />
          <TextInput
            style={styles.input}
            placeholder="MACD Histogram"
            placeholderTextColor="#8eb5c5"
            keyboardType="decimal-pad"
            value={manualMacd}
            onChangeText={setManualMacd}
          />
          <TextInput
            style={styles.input}
            placeholder="Volume Ratio"
            placeholderTextColor="#8eb5c5"
            keyboardType="decimal-pad"
            value={manualVolume}
            onChangeText={setManualVolume}
          />
          <View style={styles.liquidityGroup}>
            <Text style={styles.liquidityLabel}>Liquidity Sweep:</Text>
            <View style={styles.liquidityButtons}>
              {(['BULLISH', 'BEARISH', 'NONE'] as const).map(opt => (
                <Pressable
                  key={opt}
                  style={[
                    styles.liquidityBtn,
                    manualLiquidity === opt && styles.liquidityBtnActive,
                  ]}
                  onPress={() => setManualLiquidity(opt)}
                >
                  <Text
                    style={[
                      styles.liquidityText,
                      manualLiquidity === opt && styles.liquidityTextActive,
                    ]}
                  >
                    {opt}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Bid-Offer Imbalance"
            placeholderTextColor="#8eb5c5"
            keyboardType="decimal-pad"
            value={manualBidOffer}
            onChangeText={setManualBidOffer}
          />
          <TextInput
            style={styles.input}
            placeholder="EMA 20"
            placeholderTextColor="#8eb5c5"
            keyboardType="decimal-pad"
            value={manualEma20}
            onChangeText={setManualEma20}
          />
          <TextInput
            style={styles.input}
            placeholder="EMA 50"
            placeholderTextColor="#8eb5c5"
            keyboardType="decimal-pad"
            value={manualEma50}
            onChangeText={setManualEma50}
          />
          <TextInput
            style={styles.input}
            placeholder="Foreign Flow (Billion)"
            placeholderTextColor="#8eb5c5"
            keyboardType="decimal-pad"
            value={manualForeignFlow}
            onChangeText={setManualForeignFlow}
          />
          <TextInput
            style={styles.input}
            placeholder="Top3 Broker Net Buy (Billion)"
            placeholderTextColor="#8eb5c5"
            keyboardType="decimal-pad"
            value={manualBrokerFlow}
            onChangeText={setManualBrokerFlow}
          />
          {manualError ? (
            <Text style={styles.errorText}>{manualError}</Text>
          ) : null}
          <Pressable
            style={[styles.button, manualLoading && styles.buttonDisabled]}
            onPress={handleManualRecommendation}
            disabled={manualLoading}
          >
            {manualLoading ? (
              <ActivityIndicator color="#faf5ff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Generate Recommendation</Text>
            )}
          </Pressable>
        </View>
      )}

      {viewMode === 'market' && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Market Data</Text>
          <TextInput
            style={styles.input}
            placeholder="Symbol (e.g., BBCA)"
            placeholderTextColor="#8eb5c5"
            value={marketSymbol}
            onChangeText={setMarketSymbol}
          />
          {marketError ? (
            <Text style={styles.errorText}>{marketError}</Text>
          ) : null}
          <Pressable
            style={[styles.button, marketLoading && styles.buttonDisabled]}
            onPress={handleFetchMarketData}
            disabled={marketLoading}
          >
            {marketLoading ? (
              <ActivityIndicator color="#faf5ff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Fetch Market Data</Text>
            )}
          </Pressable>

          <View style={styles.streamCard}>
            <Text style={styles.streamTitle}>Realtime SSE Stream</Text>
            <View style={styles.streamActionRow}>
              <Pressable
                style={[
                  styles.streamButton,
                  styles.streamStartButton,
                  streamStatus === 'connecting' && styles.buttonDisabled,
                ]}
                onPress={startRealtimeStream}
                disabled={streamStatus === 'connecting'}
              >
                <Text style={styles.streamButtonText}>Start Stream</Text>
              </Pressable>
              <Pressable
                style={[styles.streamButton, styles.streamStopButton]}
                onPress={stopRealtimeStream}
              >
                <Text style={styles.streamButtonText}>Stop Stream</Text>
              </Pressable>
            </View>
            <Text style={styles.streamMeta}>
              Status: {streamStatus.toUpperCase()}
            </Text>
            {streamLastUpdateAt ? (
              <Text style={styles.streamMeta}>
                Update terakhir: {formatDateTime(streamLastUpdateAt)}
              </Text>
            ) : null}
            {streamMessage ? (
              <Text style={styles.streamInfoText}>{streamMessage}</Text>
            ) : null}
            {streamError ? (
              <View style={styles.streamErrorCard}>
                <Text style={styles.streamErrorText}>{streamError}</Text>
              </View>
            ) : null}
          </View>

          {marketData ? (
            <View style={styles.marketSummaryCard}>
              <Text style={styles.marketSummaryTitle}>
                {marketData.symbol} •{' '}
                {marketData.isRealTime ? 'Realtime' : 'Delayed'}
              </Text>
              <Text style={styles.marketSummaryText}>
                Last Price:{' '}
                {formatIDR(
                  Number(marketData.livePrice ?? marketData.closePrice ?? 0),
                )}
              </Text>
              <Text style={styles.marketSummaryText}>
                RSI: {Number(marketData.indicators?.rsi ?? 0).toFixed(2)} | MACD
                Hist:{' '}
                {Number(marketData.indicators?.macdHistogram ?? 0).toFixed(2)}
              </Text>
              <Text style={styles.marketSummaryText}>
                EMA20/EMA50:{' '}
                {Number(marketData.indicators?.ema20 ?? 0).toFixed(0)}/
                {Number(marketData.indicators?.ema50 ?? 0).toFixed(0)}
              </Text>
              <Text style={styles.marketSummaryMeta}>
                Update:{' '}
                {marketData.lastUpdatedAt
                  ? new Date(marketData.lastUpdatedAt).toLocaleString('id-ID')
                  : '-'}
              </Text>
              <Pressable
                style={styles.tvButton}
                onPress={() => openNativeChart(marketSymbol)}
              >
                <Text style={styles.tvButtonText}>Buka Native Chart</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      )}

      {viewMode === 'intelligence' && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Market Intelligence</Text>
          <TextInput
            style={styles.input}
            placeholder="Symbol (opsional)"
            placeholderTextColor="#8eb5c5"
            value={intelSymbol}
            onChangeText={setIntelSymbol}
          />
          <TextInput
            style={styles.input}
            placeholder="Source (opsional)"
            placeholderTextColor="#8eb5c5"
            value={intelSource}
            onChangeText={setIntelSource}
          />
          <TextInput
            style={styles.input}
            placeholder="From (YYYY-MM-DD, opsional)"
            placeholderTextColor="#8eb5c5"
            value={intelFrom}
            onChangeText={setIntelFrom}
          />
          <TextInput
            style={styles.input}
            placeholder="To (YYYY-MM-DD, opsional)"
            placeholderTextColor="#8eb5c5"
            value={intelTo}
            onChangeText={setIntelTo}
          />
          <TextInput
            style={styles.input}
            placeholder="Limit (default 20)"
            placeholderTextColor="#8eb5c5"
            keyboardType="number-pad"
            value={intelLimit}
            onChangeText={setIntelLimit}
          />

          <View style={styles.liquidityGroup}>
            <Text style={styles.liquidityLabel}>Type Event:</Text>
            <View style={styles.liquidityButtons}>
              {(['OFFICIAL_NEWS', 'CORPORATE_ACTION'] as const).map(opt => (
                <Pressable
                  key={opt}
                  style={[
                    styles.liquidityBtn,
                    intelEventType === opt && styles.liquidityBtnActive,
                  ]}
                  onPress={() => setIntelEventType(opt)}
                >
                  <Text
                    style={[
                      styles.liquidityText,
                      intelEventType === opt && styles.liquidityTextActive,
                    ]}
                  >
                    {opt}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {intelError ? (
            <Text style={styles.errorText}>{intelError}</Text>
          ) : null}

          <Pressable
            style={[styles.button, intelLoading && styles.buttonDisabled]}
            onPress={loadMarketIntelligence}
            disabled={intelLoading}
          >
            {intelLoading ? (
              <ActivityIndicator color="#faf5ff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Load Market Intelligence</Text>
            )}
          </Pressable>

          <View style={styles.intelSection}>
            <Text style={styles.intelTitle}>
              Technical Snapshot ({technicalData.length})
            </Text>
            {technicalData.length === 0 ? (
              <Text style={styles.intelEmptyText}>
                Belum ada data technical.
              </Text>
            ) : (
              technicalData.slice(0, 5).map(item => (
                <View
                  key={`${item.source}-${item.symbol}-${item.snapshotAt}`}
                  style={styles.intelItem}
                >
                  <Text style={styles.intelItemTitle}>{item.symbol}</Text>
                  <Text style={styles.intelItemText}>
                    RSI {Number(item.indicators?.rsi ?? 0).toFixed(2)} | MACD{' '}
                    {Number(item.indicators?.macd ?? 0).toFixed(2)}
                  </Text>
                  <Text style={styles.intelItemMeta}>
                    {item.source} • {formatDateTime(item.snapshotAt)}
                  </Text>
                </View>
              ))
            )}
          </View>

          <View style={styles.intelSection}>
            <Text style={styles.intelTitle}>
              Market Events ({eventData.length})
            </Text>
            {eventData.length === 0 ? (
              <Text style={styles.intelEmptyText}>Belum ada data event.</Text>
            ) : (
              eventData.slice(0, 5).map(item => (
                <View
                  key={`${item.source}-${item.externalId || item.eventDate}-${item.title}`}
                  style={styles.intelItem}
                >
                  <Text style={styles.intelItemTitle}>{item.title}</Text>
                  <Text style={styles.intelItemText}>
                    {item.symbol} • {item.type}
                  </Text>
                  <Text style={styles.intelItemMeta}>
                    {item.source} • {formatDateTime(item.eventDate)}
                  </Text>
                </View>
              ))
            )}
          </View>

          <View style={styles.intelSection}>
            <Text style={styles.intelTitle}>
              Sync Status ({syncStatusData.length})
            </Text>
            {syncStatusData.length === 0 ? (
              <Text style={styles.intelEmptyText}>
                Belum ada data sync status.
              </Text>
            ) : (
              syncStatusData.slice(0, 5).map(item => (
                <View
                  key={`${item.source}-${item.startedAt}-${item.status}`}
                  style={styles.intelItem}
                >
                  <Text style={styles.intelItemTitle}>
                    {item.source} • {item.status}
                  </Text>
                  <Text style={styles.intelItemMeta}>
                    Start {formatDateTime(item.startedAt)}
                  </Text>
                  <Text style={styles.intelItemMeta}>
                    Finish {formatDateTime(item.finishedAt)}
                  </Text>
                  {item.message ? (
                    <Text style={styles.intelItemText}>{item.message}</Text>
                  ) : null}
                </View>
              ))
            )}
          </View>
        </View>
      )}

      {recommendations.length > 0 && (
        <>
          <View style={styles.styleTabs}>
            {STYLE_TABS.map(style => {
              const isActive = selectedStyle === style.value;
              return (
                <Pressable
                  key={style.value}
                  onPress={() => setSelectedStyle(style.value)}
                  style={[styles.tabItem, isActive && styles.tabItemActive]}
                >
                  <Text
                    style={[styles.tabLabel, isActive && styles.tabLabelActive]}
                  >
                    {style.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {selectedRecommendation && (
            <>
              <View style={styles.detailCard}>
                <Text style={styles.detailTitle}>
                  Strategy {selectedRecommendation.stock.symbol}
                </Text>
                <Text style={styles.detailItem}>
                  Entry: {formatIDR(selectedRecommendation.strategy.entryPrice)}
                </Text>
                <Text style={styles.detailItem}>
                  TP1: {formatIDR(selectedRecommendation.strategy.takeProfit1)}
                </Text>
                <Text style={styles.detailItem}>
                  TP2: {formatIDR(selectedRecommendation.strategy.takeProfit2)}
                </Text>
                <Text style={styles.detailItem}>
                  Trailing Stop:{' '}
                  {formatIDR(selectedRecommendation.strategy.trailingStop)}
                </Text>
                <Text style={styles.detailItem}>
                  Cut Loss: {formatIDR(selectedRecommendation.strategy.cutLoss)}
                </Text>
                <Text style={styles.detailRule}>
                  {selectedRecommendation.strategy.entryRule}
                </Text>
              </View>

              <View style={styles.reasonCard}>
                <Text style={styles.sectionTitle}>Reasons</Text>
                {selectedRecommendation.reasons.map(reason => (
                  <Text style={styles.reasonText} key={reason}>
                    • {reason}
                  </Text>
                ))}
              </View>

              <View style={styles.tradingViewCard}>
                <Text style={styles.tvSymbol}>
                  Symbol: {selectedRecommendation.tradingViewSymbol}
                </Text>
                <Text style={styles.tvIndicators}>
                  Indicators:{' '}
                  {selectedRecommendation.activeIndicators.join(', ')}
                </Text>
                <Pressable
                  style={styles.tvButton}
                  onPress={() =>
                    openNativeChart(selectedRecommendation.stock.symbol)
                  }
                >
                  <Text style={styles.tvButtonText}>
                    Buka Native Chart di App
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </>
      )}

      <Modal
        animationType="slide"
        visible={Boolean(chartSymbol)}
        onRequestClose={() => {
          setChartSymbol(null);
          setChartError('');
        }}
      >
        <View style={styles.webviewContainer}>
          <View style={styles.webviewHeader}>
            <Text style={styles.webviewTitle}>Native Trading Chart</Text>
            <Pressable
              style={styles.webviewCloseButton}
              onPress={() => {
                setChartSymbol(null);
                setChartError('');
              }}
            >
              <Text style={styles.webviewCloseText}>Tutup</Text>
            </Pressable>
          </View>

          {chartLoading ? (
            <View style={styles.webviewLoadingContainer}>
              <ActivityIndicator color="#38bdf8" size="large" />
            </View>
          ) : null}

          {chartSymbol ? (
            <View style={styles.chartWrapper}>
              <NativeTradingChart
                candles={chartData}
                symbol={chartSymbol}
                interval={chartInterval}
                onIntervalChange={handleChangeChartInterval}
              />
            </View>
          ) : null}

          {chartError ? (
            <View style={styles.webviewErrorContainer}>
              <Text style={styles.webviewErrorText}>{chartError}</Text>
            </View>
          ) : null}
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#051215',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
    gap: 14,
  },
  heroCard: {
    backgroundColor: '#0b1e24',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1d3f47',
    padding: 16,
  },
  overline: {
    color: '#7dd3fc',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  heroTitle: {
    color: '#e6f8ff',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
  },
  heroSubtitle: {
    color: '#b5d7e6',
    marginTop: 6,
    lineHeight: 19,
  },
  homeRecCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#254f57',
    backgroundColor: '#0a1e23',
    padding: 12,
    gap: 8,
  },
  homeRecTitle: {
    color: '#d7f8ff',
    fontWeight: '800',
    fontSize: 15,
  },
  homeRecSubtitle: {
    color: '#9ed3e3',
    fontSize: 12,
    lineHeight: 17,
  },
  homeRecLabel: {
    color: '#b9e6f2',
    fontWeight: '700',
    fontSize: 12,
    marginTop: 2,
  },
  homeRecFilterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  homeRecChip: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2c5461',
    backgroundColor: '#122e37',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  homeRecChipActive: {
    borderColor: '#38bdf8',
    backgroundColor: '#14404d',
  },
  homeRecChipText: {
    color: '#b7d9e4',
    fontWeight: '700',
    fontSize: 11,
  },
  homeRecChipTextActive: {
    color: '#e6faff',
  },
  homeRecAdvancedTitle: {
    color: '#8ac8dd',
    fontWeight: '700',
    fontSize: 12,
    marginTop: 4,
  },
  homeRecList: {
    gap: 8,
    marginTop: 2,
  },
  homeRecItem: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#274a53',
    backgroundColor: '#0f2a31',
    padding: 10,
    gap: 4,
  },
  homeRecItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  homeRecSymbol: {
    color: '#e7fbff',
    fontSize: 14,
    fontWeight: '800',
  },
  homeRecAction: {
    color: '#86efac',
    fontSize: 11,
    fontWeight: '800',
  },
  homeRecMeta: {
    color: '#b7dce7',
    fontSize: 11,
  },
  homeRecReason: {
    color: '#8ed0e2',
    fontSize: 11,
    lineHeight: 16,
  },
  modeTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  modeTab: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#1b3d45',
    backgroundColor: '#0a1a20',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  modeTabActive: {
    backgroundColor: '#11323b',
    borderColor: '#38bdf8',
  },
  modeLabel: {
    color: '#d5ebf6',
    fontWeight: '700',
    fontSize: 13,
  },
  modeLabelActive: {
    color: '#ecfeff',
  },
  formCard: {
    backgroundColor: '#0b1f18',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#23543f',
    padding: 14,
    gap: 10,
  },
  formTitle: {
    color: '#ecfff7',
    fontWeight: '800',
    fontSize: 16,
  },
  input: {
    backgroundColor: '#051215',
    borderWidth: 1,
    borderColor: '#1b3f45',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#e6f8ff',
    fontSize: 14,
  },
  liquidityGroup: {
    gap: 6,
  },
  liquidityLabel: {
    color: '#b0dec9',
    fontWeight: '600',
    fontSize: 13,
  },
  liquidityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  liquidityBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#1b3f45',
    backgroundColor: '#051215',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  liquidityBtnActive: {
    backgroundColor: '#1a6b54',
    borderColor: '#34d399',
  },
  liquidityText: {
    color: '#b0dec9',
    fontWeight: '600',
    fontSize: 12,
  },
  liquidityTextActive: {
    color: '#ecfff7',
  },
  button: {
    backgroundColor: '#6d28d9',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#faf5ff',
    fontWeight: '700',
    fontSize: 14,
  },
  marketSummaryCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#274d58',
    backgroundColor: '#0b2028',
    padding: 10,
    gap: 4,
  },
  marketSummaryTitle: {
    color: '#d5f4ff',
    fontWeight: '800',
    fontSize: 13,
  },
  marketSummaryText: {
    color: '#bce4f2',
    fontSize: 12,
  },
  marketSummaryMeta: {
    color: '#7eb7ca',
    fontSize: 11,
    marginTop: 2,
  },
  streamCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2f445f',
    backgroundColor: '#101b2f',
    padding: 10,
    gap: 6,
  },
  streamTitle: {
    color: '#dbeafe',
    fontSize: 13,
    fontWeight: '800',
  },
  streamActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  streamButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
  },
  streamStartButton: {
    backgroundColor: '#166534',
  },
  streamStopButton: {
    backgroundColor: '#7f1d1d',
  },
  streamButtonText: {
    color: '#f8fafc',
    fontWeight: '700',
    fontSize: 12,
  },
  streamMeta: {
    color: '#93c5fd',
    fontSize: 11,
  },
  streamInfoText: {
    color: '#bfdbfe',
    fontSize: 12,
  },
  streamErrorCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#7f1d1d',
    backgroundColor: '#2a1313',
    padding: 8,
  },
  streamErrorText: {
    color: '#fecaca',
    fontSize: 12,
    lineHeight: 17,
  },
  intelSection: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#24444b',
    backgroundColor: '#0b1d21',
    padding: 10,
    gap: 8,
  },
  intelTitle: {
    color: '#d6f7ff',
    fontWeight: '800',
    fontSize: 13,
  },
  intelItem: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#23404a',
    backgroundColor: '#0f2730',
    padding: 8,
    gap: 3,
  },
  intelItemTitle: {
    color: '#e0f2fe',
    fontSize: 12,
    fontWeight: '700',
  },
  intelItemText: {
    color: '#bae6fd',
    fontSize: 12,
  },
  intelItemMeta: {
    color: '#7dd3fc',
    fontSize: 11,
  },
  intelEmptyText: {
    color: '#9bd1df',
    fontSize: 12,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: -6,
  },
  styleTabs: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  tabItem: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#1b3d45',
    backgroundColor: '#0a1a20',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabItemActive: {
    backgroundColor: '#11323b',
    borderColor: '#38bdf8',
  },
  tabLabel: {
    color: '#d5ebf6',
    fontWeight: '700',
    fontSize: 13,
  },
  tabLabelActive: {
    color: '#ecfeff',
  },
  detailCard: {
    backgroundColor: '#0b1f18',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#23543f',
    padding: 14,
    gap: 6,
  },
  detailTitle: {
    color: '#ecfff7',
    fontWeight: '800',
    fontSize: 16,
  },
  detailItem: {
    color: '#d8f2e6',
    fontSize: 13,
  },
  detailRule: {
    color: '#b0dec9',
    marginTop: 4,
    lineHeight: 18,
    fontSize: 13,
  },
  reasonCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2d3b4d',
    backgroundColor: '#121b2e',
    padding: 12,
    gap: 8,
  },
  sectionTitle: {
    color: '#eaf8fd',
    fontSize: 14,
    fontWeight: '700',
  },
  reasonText: {
    color: '#d9e4ff',
    lineHeight: 18,
    fontSize: 12,
  },
  tradingViewCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#3d325b',
    backgroundColor: '#15112a',
    padding: 12,
    gap: 8,
  },
  tvSymbol: {
    color: '#dcd1ff',
    fontWeight: '700',
    fontSize: 14,
  },
  tvIndicators: {
    color: '#c8b8ff',
    fontSize: 12,
  },
  tvButton: {
    marginTop: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#6d28d9',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  tvButtonText: {
    color: '#faf5ff',
    fontWeight: '700',
    fontSize: 12,
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: '#041014',
  },
  chartWrapper: {
    flex: 1,
    padding: 12,
  },
  webviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0b1e24',
    borderBottomWidth: 1,
    borderBottomColor: '#1d3f47',
  },
  webviewTitle: {
    color: '#d6f4ff',
    fontWeight: '800',
    fontSize: 16,
  },
  webviewCloseButton: {
    backgroundColor: '#6d28d9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  webviewCloseText: {
    color: '#faf5ff',
    fontWeight: '700',
    fontSize: 12,
  },
  webviewLoadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#041014',
  },
  webviewErrorContainer: {
    padding: 16,
    backgroundColor: '#1f1111',
    borderTopWidth: 1,
    borderTopColor: '#7f1d1d',
  },
  webviewErrorText: {
    color: '#fecaca',
    fontSize: 13,
    lineHeight: 18,
  },
});
