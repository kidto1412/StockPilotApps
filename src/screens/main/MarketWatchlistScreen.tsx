import React, { useCallback, useEffect, useState } from 'react';
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
import NativeTradingChart from '@/components/NativeTradingChart';
import {
  stockAnalyzerApi,
  type ChartCandle,
  type ChartRecommendationSummary,
  type ChartSupportResistance,
  type MarketDataResponse,
  type MarketRecommendationItem,
  type RecommendationMode,
  type RecommendationStyle,
} from '@/services/stockAnalyzerApi';

const DEFAULT_CHART_RANGE = '5y';

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

const normalizeSymbol = (symbol: string) =>
  symbol.replace('IDX:', '').replace('.JK', '').trim().toUpperCase();

const mapHomeStyleToInterval = (style: RecommendationStyle) => {
  if (style === 'DAILY') {
    return '1d';
  }

  if (style === 'SCALPING') {
    return '15m';
  }

  return '4h';
};

const mapHomeStyleToChartStyle = (
  style: RecommendationStyle,
): 'daily' | 'swing' | 'scalping' => {
  if (style === 'DAILY') {
    return 'daily';
  }

  if (style === 'SCALPING') {
    return 'scalping';
  }

  return 'swing';
};

const parseHomeRecommendationCandles = (
  item: MarketRecommendationItem,
): ChartCandle[] => {
  if (!Array.isArray(item.candles)) {
    return [];
  }

  return item.candles
    .map(candle => {
      const extendedCandle = candle as { t?: number | string };
      const timestampValue =
        candle.timestamp ?? candle.time ?? candle.date ?? extendedCandle.t;
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
    .filter((item): item is ChartCandle => Boolean(item))
    .sort((a, b) => a.timestamp - b.timestamp);
};

const parseMarketDataCandles = (item: MarketDataResponse): ChartCandle[] => {
  if (!Array.isArray(item.candles)) {
    return [];
  }

  return item.candles
    .filter(candle => {
      return (
        Number.isFinite(candle.timestamp) &&
        Number.isFinite(candle.open) &&
        Number.isFinite(candle.high) &&
        Number.isFinite(candle.low) &&
        Number.isFinite(candle.close) &&
        Number.isFinite(candle.volume)
      );
    })
    .sort((a, b) => a.timestamp - b.timestamp);
};

const formatIDR = (value?: number) => {
  if (value === undefined || !Number.isFinite(value)) {
    return '-';
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
};

const formatPercent = (value?: number) => {
  if (value === undefined || !Number.isFinite(value)) {
    return '-';
  }

  return `${(value * 100).toFixed(1)}%`;
};

export const MarketWatchlistScreen = () => {
  const [homeRecStyle, setHomeRecStyle] =
    useState<RecommendationStyle>('SWING');
  const [homeRecMode, setHomeRecMode] =
    useState<RecommendationMode>('COMBINED');
  const [homeRecSource, setHomeRecSource] = useState('TRADINGVIEW');
  const [homeRecLimit, setHomeRecLimit] = useState('30');
  const [homeRecLoading, setHomeRecLoading] = useState(false);
  const [homeRecError, setHomeRecError] = useState('');
  const [homeRecommendations, setHomeRecommendations] = useState<
    MarketRecommendationItem[]
  >([]);

  const [watchlistLimit, setWatchlistLimit] = useState('200');
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [watchlistError, setWatchlistError] = useState('');
  const [watchlistData, setWatchlistData] = useState<MarketDataResponse[]>([]);

  const [chartSymbol, setChartSymbol] = useState<string | null>(null);
  const [chartInterval, setChartInterval] = useState('1d');
  const [chartData, setChartData] = useState<ChartCandle[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState('');
  const [chartSourceMeta, setChartSourceMeta] = useState('');
  const [chartSupportResistance, setChartSupportResistance] =
    useState<ChartSupportResistance | null>(null);
  const [chartRecommendation, setChartRecommendation] =
    useState<ChartRecommendationSummary | null>(null);
  const [chartStyle, setChartStyle] = useState<'daily' | 'swing' | 'scalping'>(
    'swing',
  );
  const [chartModalStyle, setChartModalStyle] = useState<
    'daily' | 'swing' | 'scalping'
  >('daily');

  const loadNativeChart = useCallback(
    async (
      symbol: string,
      interval: string,
      style: 'daily' | 'swing' | 'scalping',
    ) => {
      setChartLoading(true);
      setChartError('');
      setChartSourceMeta('');
      setChartSupportResistance(null);
      setChartRecommendation(null);

      try {
        const response = await stockAnalyzerApi.getChartData(symbol, {
          interval,
          range: DEFAULT_CHART_RANGE,
          limit: 300,
          style,
        });

        setChartData(response.candles);
        setChartSupportResistance(response.supportResistance ?? null);
        setChartRecommendation(response.recommendation ?? null);
        const sourceSegments = [
          response.candleSource ? `source ${response.candleSource}` : '',
          response.interval ? `interval ${response.interval}` : '',
          response.range ? `range ${response.range}` : '',
          response.candles.length > 0
            ? `candles ${response.candles.length}`
            : '',
        ].filter(Boolean);
        setChartSourceMeta(sourceSegments.join(' • '));

        if (!response.candles.length) {
          setChartError(
            'Data candle belum tersedia di database chart backend.',
          );
        }
      } catch (err: any) {
        setChartError(err?.message || 'Gagal mengambil chart data.');
        setChartData([]);
        setChartSourceMeta('');
        setChartSupportResistance(null);
        setChartRecommendation(null);
      } finally {
        setChartLoading(false);
      }
    },
    [],
  );

  const loadHomeRecommendations = useCallback(async () => {
    setHomeRecLoading(true);
    setHomeRecError('');

    try {
      const parsedLimit = Math.max(
        1,
        Math.min(100, parseInt(homeRecLimit, 10) || 30),
      );

      const response = await stockAnalyzerApi.getMarketRecommendations({
        style: homeRecStyle,
        mode: homeRecMode,
        source: homeRecSource.trim() || 'TRADINGVIEW',
        limit: parsedLimit,
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
  }, [homeRecLimit, homeRecMode, homeRecSource, homeRecStyle]);

  const loadWatchlistData = useCallback(async () => {
    setWatchlistLoading(true);
    setWatchlistError('');

    try {
      const parsedLimit = Math.max(
        5,
        Math.min(1000, parseInt(watchlistLimit, 10) || 200),
      );
      const response = await stockAnalyzerApi.getMarketDataList({
        limit: parsedLimit,
      });

      setWatchlistData(response);

      if (!response.length) {
        setWatchlistError('Belum ada snapshot market data di database.');
      }
    } catch (error) {
      setWatchlistData([]);
      setWatchlistError(
        error instanceof Error
          ? error.message
          : 'Gagal memuat watchlist market data.',
      );
    } finally {
      setWatchlistLoading(false);
    }
  }, [watchlistLimit]);

  const handleOpenHomeRecommendationChart = useCallback(
    async (item: MarketRecommendationItem) => {
      const symbol = normalizeSymbol(item.symbol || '');

      if (!symbol) {
        return;
      }

      const nextInterval = mapHomeStyleToInterval(homeRecStyle);
      const nextStyle = mapHomeStyleToChartStyle(homeRecStyle);
      const localCandles = parseHomeRecommendationCandles(item);

      setChartSymbol(`IDX:${symbol}`);
      setChartInterval(nextInterval);
      setChartStyle(nextStyle);
      setChartError('');

      if (localCandles.length > 0) {
        setChartData(localCandles);
        setChartLoading(false);
        setChartSupportResistance(null);
        setChartRecommendation(null);
        return;
      }

      await loadNativeChart(symbol, nextInterval, nextStyle);
    },
    [homeRecStyle, loadNativeChart],
  );

  const handleOpenWatchlistChart = useCallback(
    async (item: MarketDataResponse) => {
      const symbol = normalizeSymbol(item.symbol || '');

      if (!symbol) {
        return;
      }

      const nextInterval =
        item.source?.interval === '1w'
          ? '1w'
          : item.source?.interval === '4h'
            ? '4h'
            : item.source?.interval === '1d'
              ? '1d'
              : '60m';
      const nextStyle = nextInterval === '1d' ? 'daily' : 'swing';
      const localCandles = parseMarketDataCandles(item);

      setChartSymbol(`IDX:${symbol}`);
      setChartInterval(nextInterval);
      setChartStyle(nextStyle);
      setChartError('');

      if (localCandles.length > 0) {
        setChartData(localCandles);
        setChartLoading(false);
        setChartSupportResistance(null);
        setChartRecommendation(null);
        return;
      }

      await loadNativeChart(symbol, nextInterval, nextStyle);
    },
    [loadNativeChart],
  );

  const handleChangeChartInterval = useCallback(
    async (nextInterval: string) => {
      if (!chartSymbol) {
        return;
      }

      setChartInterval(nextInterval);
      const normalized = chartSymbol.replace('IDX:', '');
      await loadNativeChart(normalized, nextInterval, chartModalStyle);
    },
    [chartModalStyle, chartSymbol, loadNativeChart],
  );

  const handleChangeChartModalStyle = useCallback(
    async (nextStyle: 'daily' | 'swing' | 'scalping') => {
      if (!chartSymbol) {
        return;
      }

      setChartModalStyle(nextStyle);
      const normalized = chartSymbol.replace('IDX:', '');
      await loadNativeChart(normalized, chartInterval, nextStyle);
    },
    [chartSymbol, chartInterval, loadNativeChart],
  );

  useEffect(() => {
    loadHomeRecommendations();
    loadWatchlistData();
  }, [loadHomeRecommendations, loadWatchlistData]);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.overline}>StockPilot Market</Text>
        <Text style={styles.heroTitle}>Watchlist & Recommendation Board</Text>
        <Text style={styles.heroSubtitle}>
          Halaman terpisah untuk watchlist snapshot DB dan home recommendation.
        </Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Home Recommendation List</Text>
        <Text style={styles.sectionSubtitle}>
          Endpoint market/recommendations untuk screening peluang trading.
        </Text>

        <Text style={styles.label}>Style</Text>
        <View style={styles.chipRow}>
          {HOME_STYLE_OPTIONS.map(style => {
            const active = homeRecStyle === style;
            return (
              <Pressable
                key={style}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setHomeRecStyle(style)}
              >
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                >
                  {style}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Mode</Text>
        <View style={styles.chipRow}>
          {HOME_MODE_OPTIONS.map(mode => {
            const active = homeRecMode === mode;
            return (
              <Pressable
                key={mode}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setHomeRecMode(mode)}
              >
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
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

        <Pressable
          style={[styles.button, homeRecLoading && styles.buttonDisabled]}
          onPress={loadHomeRecommendations}
          disabled={homeRecLoading}
        >
          {homeRecLoading ? (
            <ActivityIndicator color="#faf5ff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Refresh Recommendations</Text>
          )}
        </Pressable>

        {homeRecError ? (
          <Text style={styles.errorText}>{homeRecError}</Text>
        ) : null}

        <View style={styles.listContainer}>
          {homeRecommendations.slice(0, 12).map((item, index) => (
            <Pressable
              key={`${item.symbol}-${item.generatedAt || item.score || index}`}
              style={styles.listItem}
              onPress={() => handleOpenHomeRecommendationChart(item)}
            >
              <View style={styles.listItemHeader}>
                <Text style={styles.symbol}>{item.symbol}</Text>
                <Text style={styles.action}>{item.action || '-'}</Text>
              </View>
              <Text style={styles.meta}>
                Score{' '}
                {typeof item.score === 'number' ? item.score.toFixed(2) : '-'} |
                Confidence {item.confidence || '-'}
              </Text>
              {Array.isArray(item.reasons) && item.reasons.length > 0 ? (
                <Text style={styles.reason}>• {item.reasons[0]}</Text>
              ) : null}
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>
          Market Data Watchlist (DB Snapshot)
        </Text>
        <Text style={styles.sectionSubtitle}>
          Endpoint stock-analysis/market-data untuk tabel snapshot semua saham.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Limit (5 - 1000)"
          placeholderTextColor="#8eb5c5"
          keyboardType="number-pad"
          value={watchlistLimit}
          onChangeText={setWatchlistLimit}
        />

        <Pressable
          style={[styles.button, watchlistLoading && styles.buttonDisabled]}
          onPress={loadWatchlistData}
          disabled={watchlistLoading}
        >
          {watchlistLoading ? (
            <ActivityIndicator color="#faf5ff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Refresh Watchlist Snapshot</Text>
          )}
        </Pressable>

        {watchlistError ? (
          <Text style={styles.errorText}>{watchlistError}</Text>
        ) : null}

        <View style={styles.listContainer}>
          {watchlistData.slice(0, 40).map((item, index) => (
            <Pressable
              key={`${item.symbol}-${item.lastUpdatedAt || index}`}
              style={styles.listItem}
              onPress={() => handleOpenWatchlistChart(item)}
            >
              <View style={styles.listItemHeader}>
                <Text style={styles.symbol}>{item.symbol}</Text>
                <Text style={styles.sourceBadge}>
                  {item.source?.provider || 'DB'}
                </Text>
              </View>
              <Text style={styles.meta}>
                Close {Number(item.closePrice ?? 0).toFixed(0)} | Live{' '}
                {Number(item.livePrice ?? item.closePrice ?? 0).toFixed(0)}
              </Text>
              <Text style={styles.meta}>
                RSI {Number(item.indicators?.rsi ?? 0).toFixed(2)} | MACD Hist{' '}
                {Number(item.indicators?.macdHistogram ?? 0).toFixed(2)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Modal
        animationType="slide"
        visible={Boolean(chartSymbol)}
        onRequestClose={() => {
          setChartSymbol(null);
          setChartError('');
          setChartSourceMeta('');
          setChartSupportResistance(null);
          setChartRecommendation(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Native Trading Chart</Text>
            <Pressable
              style={styles.modalCloseButton}
              onPress={() => {
                setChartSymbol(null);
                setChartError('');
                setChartSourceMeta('');
                setChartSupportResistance(null);
                setChartRecommendation(null);
              }}
            >
              <Text style={styles.modalCloseText}>Tutup</Text>
            </Pressable>
          </View>

          <View style={styles.chartStyleSelectorRow}>
            {['daily', 'swing', 'scalping'].map(style => {
              const isActive = chartModalStyle === style;
              return (
                <Pressable
                  key={style}
                  style={[
                    styles.chartStyleButton,
                    isActive && styles.chartStyleButtonActive,
                  ]}
                  onPress={() =>
                    handleChangeChartModalStyle(
                      style as 'daily' | 'swing' | 'scalping',
                    )
                  }
                >
                  <Text
                    style={[
                      styles.chartStyleButtonText,
                      isActive && styles.chartStyleButtonTextActive,
                    ]}
                  >
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <ScrollView style={styles.chartScrollView}>
            {chartSourceMeta ? (
              <View style={styles.chartMetaStrip}>
                <Text style={styles.chartMetaText}>{chartSourceMeta}</Text>
              </View>
            ) : null}

            {chartLoading ? (
              <View style={styles.loadingContainer}>
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
                  supportResistance={chartSupportResistance ?? undefined}
                />
              </View>
            ) : null}

            {chartRecommendation ? (
              <View style={styles.chartRecommendationCard}>
                <Text style={styles.chartRecommendationTitle}>
                  Recommendation {chartRecommendation.selectedStyle || '-'}
                </Text>
                <Text style={styles.chartRecommendationText}>
                  Signal: {chartRecommendation.signal || '-'} | Bias:{' '}
                  {chartRecommendation.marketBias || '-'}
                </Text>
                <Text style={styles.chartRecommendationText}>
                  Entry: {formatIDR(chartRecommendation.entry)} | TP:{' '}
                  {formatIDR(chartRecommendation.takeProfit)}
                </Text>
                <Text style={styles.chartRecommendationText}>
                  SL: {formatIDR(chartRecommendation.stopLoss)} | Cut Loss:{' '}
                  {formatIDR(chartRecommendation.cutLoss)}
                </Text>
                <Text style={styles.chartRecommendationText}>
                  Long/Short Score:{' '}
                  {chartRecommendation.scoring?.longScore ?? '-'} /{' '}
                  {chartRecommendation.scoring?.shortScore ?? '-'} | Confidence:{' '}
                  {chartRecommendation.scoring?.confidence || '-'}
                </Text>
                <Text style={styles.chartRecommendationText}>
                  ML Signal: {chartRecommendation.scoring?.mlSignal || '-'} | ML
                  Prob BUY:{' '}
                  {formatPercent(chartRecommendation.scoring?.mlProbabilityBuy)}
                </Text>
                {chartRecommendation.note ? (
                  <Text style={styles.chartRecommendationNote}>
                    {chartRecommendation.note}
                  </Text>
                ) : null}
              </View>
            ) : null}

            {chartSupportResistance &&
            chartSupportResistance.supports &&
            chartSupportResistance.supports.length > 0 ? (
              <View style={styles.chartSrCard}>
                <Text style={styles.chartSrTitle}>Support & Resistance</Text>
                {chartSupportResistance.nearestResistance !== undefined && (
                  <Text style={styles.chartSrText}>
                    Nearest Resistance:{' '}
                    {formatIDR(chartSupportResistance.nearestResistance)}
                  </Text>
                )}
                {chartSupportResistance.resistances &&
                chartSupportResistance.resistances.length > 0 ? (
                  <Text style={styles.chartSrText}>
                    Top Resistances:{' '}
                    {chartSupportResistance.resistances
                      .slice(0, 3)
                      .map(r => formatIDR(r))
                      .join(', ')}
                  </Text>
                ) : null}
                {chartSupportResistance.nearestSupport !== undefined && (
                  <Text style={styles.chartSrText}>
                    Nearest Support:{' '}
                    {formatIDR(chartSupportResistance.nearestSupport)}
                  </Text>
                )}
                {chartSupportResistance.supports &&
                chartSupportResistance.supports.length > 0 ? (
                  <Text style={styles.chartSrText}>
                    Top Supports:{' '}
                    {chartSupportResistance.supports
                      .slice(0, 3)
                      .map(s => formatIDR(s))
                      .join(', ')}
                  </Text>
                ) : null}
              </View>
            ) : null}

            {chartError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorContainerText}>{chartError}</Text>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#07141c',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 28,
    gap: 14,
  },
  heroCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#214659',
    backgroundColor: '#0a2130',
    padding: 14,
  },
  overline: {
    color: '#7dd3fc',
    fontSize: 12,
    fontWeight: '700',
  },
  heroTitle: {
    color: '#ebfbff',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
  },
  heroSubtitle: {
    color: '#b6d8e7',
    marginTop: 6,
    lineHeight: 19,
  },
  sectionCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#24495c',
    backgroundColor: '#0b1d28',
    padding: 12,
    gap: 8,
  },
  sectionTitle: {
    color: '#d9f4ff',
    fontWeight: '800',
    fontSize: 15,
  },
  sectionSubtitle: {
    color: '#9ecce0',
    fontSize: 12,
    lineHeight: 17,
  },
  label: {
    color: '#b7e2f2',
    fontWeight: '700',
    fontSize: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2d5367',
    backgroundColor: '#112c3a',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  chipActive: {
    borderColor: '#38bdf8',
    backgroundColor: '#15455a',
  },
  chipText: {
    color: '#b9d8e5',
    fontSize: 11,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#effbff',
  },
  input: {
    backgroundColor: '#08161f',
    borderWidth: 1,
    borderColor: '#1f4153',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#e6f8ff',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#0f766e',
    paddingVertical: 11,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ecfeff',
    fontWeight: '700',
    fontSize: 13,
  },
  errorText: {
    color: '#f87171',
    fontSize: 12,
  },
  listContainer: {
    gap: 8,
    marginTop: 2,
  },
  listItem: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#275067',
    backgroundColor: '#0e2836',
    padding: 10,
    gap: 4,
  },
  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  symbol: {
    color: '#edfbff',
    fontSize: 14,
    fontWeight: '800',
  },
  action: {
    color: '#86efac',
    fontSize: 11,
    fontWeight: '800',
  },
  sourceBadge: {
    color: '#7dd3fc',
    fontSize: 11,
    fontWeight: '700',
  },
  meta: {
    color: '#b8d9e7',
    fontSize: 11,
  },
  reason: {
    color: '#93c5fd',
    fontSize: 11,
    lineHeight: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#041014',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0b1e24',
    borderBottomWidth: 1,
    borderBottomColor: '#1d3f47',
  },
  modalTitle: {
    color: '#d6f4ff',
    fontWeight: '800',
    fontSize: 16,
  },
  modalCloseButton: {
    backgroundColor: '#0f766e',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalCloseText: {
    color: '#ecfeff',
    fontWeight: '700',
    fontSize: 12,
  },
  chartStyleSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0b1e24',
    borderBottomWidth: 1,
    borderBottomColor: '#1d3f47',
  },
  chartStyleButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2d5367',
    backgroundColor: '#112c3a',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chartStyleButtonActive: {
    borderColor: '#38bdf8',
    backgroundColor: '#15455a',
  },
  chartStyleButtonText: {
    color: '#b9d8e5',
    fontSize: 12,
    fontWeight: '700',
  },
  chartStyleButtonTextActive: {
    color: '#effbff',
  },
  chartScrollView: {
    flex: 1,
  },
  chartMetaStrip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#0a1920',
    borderBottomWidth: 1,
    borderBottomColor: '#1d3f47',
  },
  chartMetaText: {
    color: '#8fd0e5',
    fontSize: 11,
    fontWeight: '600',
  },
  chartRecommendationCard: {
    marginHorizontal: 12,
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2b5967',
    backgroundColor: '#0c2630',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 3,
  },
  chartRecommendationTitle: {
    color: '#dff9ff',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  chartRecommendationText: {
    color: '#b9ddec',
    fontSize: 11,
    lineHeight: 16,
  },
  chartRecommendationNote: {
    color: '#8dd5ea',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#041014',
  },
  chartWrapper: {
    flex: 1,
    padding: 12,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#2a1313',
    borderTopWidth: 1,
    borderTopColor: '#7f1d1d',
  },
  errorContainerText: {
    color: '#fecaca',
    fontSize: 13,
    lineHeight: 18,
  },
  chartSrCard: {
    marginHorizontal: 12,
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2b5967',
    backgroundColor: '#0c2630',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 3,
  },
  chartSrTitle: {
    color: '#dff9ff',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  chartSrText: {
    color: '#b9ddec',
    fontSize: 11,
    lineHeight: 16,
  },
});
