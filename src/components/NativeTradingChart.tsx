import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';
import type {
  ChartCandle,
  ChartSupportResistance,
} from '@/services/stockAnalyzerApi';

interface NativeTradingChartProps {
  candles: ChartCandle[];
  symbol: string;
  interval: string;
  onIntervalChange: (interval: string) => void;
  intervalOptions?: string[];
  supportResistance?: ChartSupportResistance;
}

const BACKEND_INTERVAL_OPTIONS = [
  '1m',
  '5m',
  '15m',
  '30m',
  '60m',
  '4h',
  '1d',
  '1w',
];

const intervalLabelMap: Record<string, string> = {
  '60m': '1H',
  '240m': '4H',
  '4h': '4H',
  '1d': '1D',
  '1w': '1W',
};

const normalizeIntervalValue = (value: string) => {
  const trimmed = value.trim().toLowerCase();
  if (trimmed === '1h') {
    return '60m';
  }
  if (trimmed === '4h') {
    return '4h';
  }
  return trimmed;
};

const getIntervalLabel = (value: string) =>
  intervalLabelMap[value] ?? value.toUpperCase();

const compactPriceFormatter = new Intl.NumberFormat('id-ID', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
});

const formatCompactPrice = (value: number) => compactPriceFormatter.format(value);

const formatDate = (timestamp: number) => dateFormatter.format(new Date(timestamp));

const buildEmaSeries = (candles: ChartCandle[], period: number) => {
  if (!candles.length) {
    return [] as Array<number | null>;
  }

  const multiplier = 2 / (period + 1);
  let ema: number | null = null;

  return candles.map((candle, index) => {
    if (index < period - 1) {
      return null;
    }

    if (index === period - 1) {
      const sum = candles
        .slice(0, period)
        .reduce((acc, item) => acc + item.close, 0);
      ema = sum / period;
      return ema;
    }

    if (ema === null) {
      ema = candle.close;
      return ema;
    }

    ema = (candle.close - ema) * multiplier + ema;
    return ema;
  });
};

const buildSmaSeries = (
  values: Array<number | null>,
  period: number,
): Array<number | null> => {
  if (!values.length || period <= 0) {
    return [];
  }

  const result: Array<number | null> = Array(values.length).fill(null);
  let rollingSum = 0;
  let validCount = 0;

  for (let index = 0; index < values.length; index += 1) {
    const incoming = values[index];
    if (incoming !== null) {
      rollingSum += incoming;
      validCount += 1;
    }

    if (index >= period) {
      const outgoing = values[index - period];
      if (outgoing !== null) {
        rollingSum -= outgoing;
        validCount -= 1;
      }
    }

    if (index >= period - 1 && validCount === period) {
      result[index] = rollingSum / period;
    }
  }

  return result;
};

type RollingExtremaMode = 'max' | 'min';

const buildRollingExtremaSeries = (
  values: number[],
  period: number,
  mode: RollingExtremaMode,
): Array<number | null> => {
  if (!values.length || period <= 0) {
    return [];
  }

  const result: Array<number | null> = Array(values.length).fill(null);
  const deque: Array<{ index: number; value: number }> = [];

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];

    while (deque.length) {
      const tail = deque[deque.length - 1];
      const shouldRemoveTail =
        mode === 'max' ? tail.value <= value : tail.value >= value;

      if (!shouldRemoveTail) {
        break;
      }

      deque.pop();
    }

    deque.push({ index, value });

    while (deque.length && deque[0].index <= index - period) {
      deque.shift();
    }

    if (index >= period - 1 && deque.length) {
      result[index] = deque[0].value;
    }
  }

  return result;
};

type MacdPoint = {
  macd: number;
  signal: number;
  histogram: number;
};

const buildMacdSeries = (
  candles: ChartCandle[],
  fastPeriod: number,
  slowPeriod: number,
  signalPeriod: number,
): Array<MacdPoint | null> => {
  if (!candles.length) {
    return [];
  }

  const fast = buildEmaSeries(candles, fastPeriod);
  const slow = buildEmaSeries(candles, slowPeriod);
  const macdLine = candles.map((_, index) => {
    if (fast[index] === null || slow[index] === null) {
      return null;
    }
    return (fast[index] ?? 0) - (slow[index] ?? 0);
  });
  const signalLine = buildSmaSeries(macdLine, signalPeriod);

  return candles.map((_, index) => {
    const macd = macdLine[index];
    const signal = signalLine[index];

    if (macd === null || signal === null) {
      return null;
    }

    return {
      macd,
      signal,
      histogram: macd - signal,
    };
  });
};

type StochPoint = {
  k: number;
  d: number;
};

const buildStochasticSeries = (
  candles: ChartCandle[],
  kPeriod: number,
  kSmooth: number,
  dPeriod: number,
): Array<StochPoint | null> => {
  if (!candles.length) {
    return [];
  }

  const highs = candles.map(candle => candle.high);
  const lows = candles.map(candle => candle.low);
  const highestHighs = buildRollingExtremaSeries(highs, kPeriod, 'max');
  const lowestLows = buildRollingExtremaSeries(lows, kPeriod, 'min');

  const rawK: Array<number | null> = candles.map((candle, index) => {
    const highest = highestHighs[index];
    const lowest = lowestLows[index];

    if (highest === null || lowest === null) {
      return null;
    }

    const range = highest - lowest;

    if (!Number.isFinite(range) || range <= 0) {
      return 50;
    }

    return ((candle.close - lowest) / range) * 100;
  });

  const smoothK = buildSmaSeries(rawK, kSmooth);
  const dSeries = buildSmaSeries(smoothK, dPeriod);

  return candles.map((_, index) => {
    const k = smoothK[index];
    const d = dSeries[index];

    if (k === null || d === null) {
      return null;
    }

    return { k, d };
  });
};

const parsePeriodInput = (
  raw: string,
  fallback: number,
  min: number,
  max: number,
) => {
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, parsed));
};

function NativeTradingChart({
  candles,
  symbol,
  interval,
  onIntervalChange,
  intervalOptions,
  supportResistance,
}: NativeTradingChartProps) {
  const [layoutWidth, setLayoutWidth] = useState(0);
  const [windowSize, setWindowSize] = useState(60);
  const [offsetFromLatest, setOffsetFromLatest] = useState(0);
  const [crosshairIndex, setCrosshairIndex] = useState<number | null>(null);
  const [showEma20, setShowEma20] = useState(true);
  const [showEma50, setShowEma50] = useState(true);
  const [showMacd, setShowMacd] = useState(true);
  const [showStochastic, setShowStochastic] = useState(true);

  const [macdFastInput, setMacdFastInput] = useState('12');
  const [macdSlowInput, setMacdSlowInput] = useState('26');
  const [macdSignalInput, setMacdSignalInput] = useState('9');
  const [stochKInput, setStochKInput] = useState('10');
  const [stochSmoothInput, setStochSmoothInput] = useState('5');
  const [stochDInput, setStochDInput] = useState('5');

  const dragStartOffset = useRef(0);

  const maxOffset = Math.max(0, candles.length - windowSize);
  const safeOffset = Math.max(0, Math.min(offsetFromLatest, maxOffset));
  const macdFast = parsePeriodInput(macdFastInput, 12, 2, 100);
  const macdSlowRaw = parsePeriodInput(macdSlowInput, 26, 3, 200);
  const macdSlow = Math.max(macdFast + 1, macdSlowRaw);
  const macdSignal = parsePeriodInput(macdSignalInput, 9, 2, 100);
  const stochKPeriod = parsePeriodInput(stochKInput, 10, 2, 100);
  const stochKSmooth = parsePeriodInput(stochSmoothInput, 5, 1, 100);
  const stochDPeriod = parsePeriodInput(stochDInput, 5, 1, 100);

  const dynamicIntervalOptions = useMemo(() => {
    const candidates = [
      ...(intervalOptions ?? []),
      ...BACKEND_INTERVAL_OPTIONS,
    ];

    const unique = new Set<string>();
    const allowed = new Set(BACKEND_INTERVAL_OPTIONS);
    candidates.forEach(raw => {
      if (typeof raw !== 'string') {
        return;
      }
      const normalized = normalizeIntervalValue(raw);
      if (!normalized) {
        return;
      }
      if (!allowed.has(normalized)) {
        return;
      }
      unique.add(normalized);
    });

    const merged = Array.from(unique);
    return BACKEND_INTERVAL_OPTIONS.filter(option => merged.includes(option));
  }, [intervalOptions]);

  const visibleCandles = useMemo(() => {
    if (!candles.length) {
      return [] as ChartCandle[];
    }

    const safeWindow = Math.min(Math.max(windowSize, 20), candles.length);
    const start = Math.max(0, candles.length - safeWindow - safeOffset);
    const end = Math.max(start + 1, candles.length - safeOffset);

    return candles.slice(start, end);
  }, [candles, safeOffset, windowSize]);

  const visibleStartIndex = useMemo(() => {
    if (!candles.length) {
      return 0;
    }

    return Math.max(0, candles.length - visibleCandles.length - safeOffset);
  }, [candles.length, safeOffset, visibleCandles.length]);

  const ema20 = useMemo(() => buildEmaSeries(candles, 20), [candles]);
  const ema50 = useMemo(() => buildEmaSeries(candles, 50), [candles]);
  const macdSeries = useMemo(
    () => buildMacdSeries(candles, macdFast, macdSlow, macdSignal),
    [candles, macdFast, macdSignal, macdSlow],
  );
  const stochasticSeries = useMemo(
    () =>
      buildStochasticSeries(candles, stochKPeriod, stochKSmooth, stochDPeriod),
    [candles, stochDPeriod, stochKPeriod, stochKSmooth],
  );

  const visibleWithIndicators = useMemo(() => {
    const start = visibleStartIndex;
    return visibleCandles.map((candle, index) => ({
      candle,
      ema20: ema20[start + index],
      ema50: ema50[start + index],
    }));
  }, [ema20, ema50, visibleCandles, visibleStartIndex]);

  const maxPrice = useMemo(() => {
    const seriesMax = visibleWithIndicators.reduce((acc, item) => {
      const markerMax = Math.max(
        showEma20
          ? (item.ema20 ?? Number.NEGATIVE_INFINITY)
          : Number.NEGATIVE_INFINITY,
        showEma50
          ? (item.ema50 ?? Number.NEGATIVE_INFINITY)
          : Number.NEGATIVE_INFINITY,
      );
      return Math.max(acc, item.candle.high, markerMax);
    }, Number.NEGATIVE_INFINITY);
    return Number.isFinite(seriesMax) ? seriesMax : 0;
  }, [showEma20, showEma50, visibleWithIndicators]);

  const minPrice = useMemo(() => {
    const seriesMin = visibleWithIndicators.reduce((acc, item) => {
      const markerMin = Math.min(
        showEma20
          ? (item.ema20 ?? Number.POSITIVE_INFINITY)
          : Number.POSITIVE_INFINITY,
        showEma50
          ? (item.ema50 ?? Number.POSITIVE_INFINITY)
          : Number.POSITIVE_INFINITY,
      );
      return Math.min(acc, item.candle.low, markerMin);
    }, Number.POSITIVE_INFINITY);
    return Number.isFinite(seriesMin) ? seriesMin : 0;
  }, [showEma20, showEma50, visibleWithIndicators]);

  const maxVolume = useMemo(
    () =>
      visibleCandles.reduce(
        (acc, candle) => Math.max(acc, candle.volume ?? 0),
        0,
      ),
    [visibleCandles],
  );

  const chartHeight = 280;
  const priceAreaHeight = 200;
  const volumeAreaHeight = 60;
  const macdPanelHeight = showMacd ? 84 : 0;
  const stochPanelHeight = showStochastic ? 84 : 0;
  const panelGap = 10;
  const indicatorGapTotal =
    (showMacd ? panelGap : 0) +
    (showStochastic ? panelGap : 0) +
    macdPanelHeight +
    stochPanelHeight;
  const totalChartHeight = chartHeight + indicatorGapTotal;
  const macdPanelTop =
    showMacd || showStochastic ? chartHeight + panelGap : chartHeight;
  const stochPanelTop =
    showMacd && showStochastic
      ? macdPanelTop + macdPanelHeight + panelGap
      : showStochastic
        ? chartHeight + panelGap
        : chartHeight;
  const topPadding = 10;
  const rightAxis = 64;
  const usableWidth = Math.max(layoutWidth - rightAxis, 1);
  const plotWidth = Math.max(usableWidth - 6, 1);
  const candleSlot = plotWidth / Math.max(visibleCandles.length, 1);
  const candleWidth = Math.max(2, candleSlot * 0.56);
  const priceRange = Math.max(maxPrice - minPrice, maxPrice * 0.003, 1);

  const getY = (price: number) => {
    const ratio = (maxPrice - price) / priceRange;
    return topPadding + ratio * (priceAreaHeight - topPadding * 1.2);
  };

  const clampPriceY = (y: number) =>
    Math.max(topPadding, Math.min(priceAreaHeight - 2, y));

  const getVolumeY = (volume: number) => {
    if (maxVolume <= 0) {
      return priceAreaHeight + volumeAreaHeight;
    }
    return (
      priceAreaHeight +
      volumeAreaHeight -
      (volume / maxVolume) * (volumeAreaHeight - 8)
    );
  };

  const setCrosshairFromX = (x: number) => {
    if (!visibleCandles.length || plotWidth <= 0) {
      setCrosshairIndex(null);
      return;
    }

    const index = Math.max(
      0,
      Math.min(visibleCandles.length - 1, Math.round(x / candleSlot)),
    );

    setCrosshairIndex(index);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
          Math.abs(gestureState.dx) > 6,
        onPanResponderGrant: evt => {
          dragStartOffset.current = safeOffset;
          setCrosshairFromX(evt.nativeEvent.locationX);
        },
        onPanResponderMove: (evt, gestureState) => {
          const movedCandles = Math.round(-gestureState.dx / 8);
          const nextOffset = Math.max(
            0,
            Math.min(maxOffset, dragStartOffset.current + movedCandles),
          );
          setOffsetFromLatest(nextOffset);
          setCrosshairFromX(evt.nativeEvent.locationX);
        },
        onPanResponderRelease: () => {
          setCrosshairIndex(null);
        },
      }),
    [maxOffset, safeOffset],
  );

  const selected =
    crosshairIndex !== null
      ? visibleCandles[crosshairIndex]
      : visibleCandles.at(-1);

  const selectedGlobalIndex =
    crosshairIndex !== null
      ? visibleStartIndex + crosshairIndex
      : Math.max(0, candles.length - 1);

  const selectedMacd =
    showMacd && selectedGlobalIndex >= 0 ? macdSeries[selectedGlobalIndex] : null;
  const selectedStochastic =
    showStochastic && selectedGlobalIndex >= 0
      ? stochasticSeries[selectedGlobalIndex]
      : null;

  const visibleMacd = useMemo(() => {
    if (!showMacd) {
      return [] as Array<MacdPoint | null>;
    }

    return visibleCandles.map(
      (_, index) => macdSeries[visibleStartIndex + index] ?? null,
    );
  }, [macdSeries, showMacd, visibleCandles, visibleStartIndex]);

  const visibleStochastic = useMemo(() => {
    if (!showStochastic) {
      return [] as Array<StochPoint | null>;
    }

    return visibleCandles.map(
      (_, index) => stochasticSeries[visibleStartIndex + index] ?? null,
    );
  }, [showStochastic, stochasticSeries, visibleCandles, visibleStartIndex]);

  const macdRangeAbs = useMemo(() => {
    if (!showMacd) {
      return 0.0001;
    }

    const magnitudes = visibleMacd
      .filter((point): point is MacdPoint => point !== null)
      .flatMap(point => [
        Math.abs(point.macd),
        Math.abs(point.signal),
        Math.abs(point.histogram),
      ]);

    const maxMagnitude = magnitudes.length ? Math.max(...magnitudes) : 0;
    return Math.max(maxMagnitude, 0.0001);
  }, [visibleMacd]);

  const supportLevels = useMemo(
    () =>
      (supportResistance?.supports ?? [])
        .map(level => Number(level))
        .filter(level => Number.isFinite(level))
        .sort((a, b) => a - b),
    [supportResistance?.supports],
  );

  const resistanceLevels = useMemo(
    () =>
      (supportResistance?.resistances ?? [])
        .map(level => Number(level))
        .filter(level => Number.isFinite(level))
        .sort((a, b) => a - b),
    [supportResistance?.resistances],
  );

  const nearestSupport = Number(supportResistance?.nearestSupport);
  const nearestResistance = Number(supportResistance?.nearestResistance);

  useEffect(() => {
    if (!__DEV__) {
      return;
    }

    const srDiagnostics = {
      symbol,
      interval,
      candleCount: candles.length,
      supportCount: supportLevels.length,
      resistanceCount: resistanceLevels.length,
      nearestSupport: Number.isFinite(nearestSupport) ? nearestSupport : null,
      nearestResistance: Number.isFinite(nearestResistance)
        ? nearestResistance
        : null,
      layoutWidth,
      priceRange,
      minPrice,
      maxPrice,
    };

    console.log('[native-chart-sr-state]', JSON.stringify(srDiagnostics));

    if (!supportLevels.length && !resistanceLevels.length) {
      console.warn(
        '[native-chart-no-sr-levels]',
        JSON.stringify({
          symbol,
          interval,
          reason: 'Chart component received empty SR levels',
        }),
      );
      return;
    }

    const topPaddingLocal = 10;
    const priceAreaHeightLocal = 200;
    const mapY = (level: number) => {
      const ratio = (maxPrice - level) / Math.max(priceRange, 1);
      const rawY =
        topPaddingLocal +
        ratio * (priceAreaHeightLocal - topPaddingLocal * 1.2);
      const clampedY = Math.max(
        topPaddingLocal,
        Math.min(priceAreaHeightLocal - 2, rawY),
      );
      return {
        level,
        rawY: Number(rawY.toFixed(2)),
        clampedY: Number(clampedY.toFixed(2)),
      };
    };

    console.log(
      '[native-chart-sr-preview]',
      JSON.stringify({
        symbol,
        interval,
        supports: supportLevels.slice(0, 3).map(mapY),
        resistances: resistanceLevels.slice(0, 3).map(mapY),
      }),
    );
  }, [
    candles.length,
    interval,
    layoutWidth,
    maxPrice,
    minPrice,
    nearestResistance,
    nearestSupport,
    priceRange,
    resistanceLevels,
    supportLevels,
    symbol,
  ]);

  const getMacdY = (value: number) => {
    const panelMiddle = macdPanelTop + macdPanelHeight / 2;
    return panelMiddle - (value / macdRangeAbs) * (macdPanelHeight * 0.42);
  };

  const getStochY = (value: number) => {
    const clamped = Math.min(100, Math.max(0, value));
    return stochPanelTop + ((100 - clamped) / 100) * stochPanelHeight;
  };

  const handleChartLayout = (event: LayoutChangeEvent) => {
    setLayoutWidth(event.nativeEvent.layout.width);
  };

  const handleZoomIn = () => {
    setWindowSize(prev => Math.max(10, prev - 20));
    setOffsetFromLatest(0);
  };

  const handleZoomOut = () => {
    setWindowSize(prev => Math.min(candles.length, prev + 20));
    setOffsetFromLatest(0);
  };

  const handleResetZoom = () => {
    setWindowSize(Math.min(60, candles.length));
    setOffsetFromLatest(0);
  };

  if (!candles.length) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>Belum ada data candle</Text>
        <Text style={styles.emptyDescription}>
          Backend belum mengirimkan OHLC. Pastikan endpoint chart mengembalikan
          data historis.
        </Text>
      </View>
    );
  }

  const minStochCandles = stochKPeriod + stochKSmooth + stochDPeriod - 2;

  return (
    <ScrollView
      style={styles.wrapper}
      contentContainerStyle={styles.wrapperContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topBar}>
        <Text style={styles.symbolText}>{symbol}</Text>
        <View style={styles.toolbarActions}>
          <Pressable style={styles.zoomButton} onPress={handleZoomOut}>
            <Text style={styles.zoomLabel}>Zoom Out</Text>
          </Pressable>
          <Pressable style={styles.zoomButton} onPress={handleZoomIn}>
            <Text style={styles.zoomLabel}>Zoom In</Text>
          </Pressable>
          <Pressable style={styles.zoomButton} onPress={handleResetZoom}>
            <Text style={styles.zoomLabel}>Reset</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.intervalRow}>
        {dynamicIntervalOptions.map(item => {
          const active = normalizeIntervalValue(interval) === item;
          return (
            <Pressable
              key={item}
              onPress={() => onIntervalChange(item)}
              style={[
                styles.intervalButton,
                active && styles.intervalButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.intervalText,
                  active && styles.intervalTextActive,
                ]}
              >
                {getIntervalLabel(item)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.indicatorToggleRow}>
        <Pressable
          style={[
            styles.indicatorChip,
            showEma20 && styles.indicatorChipActive,
          ]}
          onPress={() => setShowEma20(prev => !prev)}
        >
          <Text
            style={[
              styles.indicatorChipText,
              showEma20 && styles.indicatorChipTextActive,
            ]}
          >
            EMA20
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.indicatorChip,
            showEma50 && styles.indicatorChipActive,
          ]}
          onPress={() => setShowEma50(prev => !prev)}
        >
          <Text
            style={[
              styles.indicatorChipText,
              showEma50 && styles.indicatorChipTextActive,
            ]}
          >
            EMA50
          </Text>
        </Pressable>
        <Pressable
          style={[styles.indicatorChip, showMacd && styles.indicatorChipActive]}
          onPress={() => setShowMacd(prev => !prev)}
        >
          <Text
            style={[
              styles.indicatorChipText,
              showMacd && styles.indicatorChipTextActive,
            ]}
          >
            MACD
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.indicatorChip,
            showStochastic && styles.indicatorChipActive,
          ]}
          onPress={() => setShowStochastic(prev => !prev)}
        >
          <Text
            style={[
              styles.indicatorChipText,
              showStochastic && styles.indicatorChipTextActive,
            ]}
          >
            STOCH
          </Text>
        </Pressable>
      </View>

      <View style={styles.configCard}>
        <Text style={styles.configTitle}>MACD (fast, slow, signal)</Text>
        <View style={styles.configInputRow}>
          <TextInput
            style={styles.configInput}
            value={macdFastInput}
            onChangeText={setMacdFastInput}
            keyboardType="number-pad"
            placeholder="12"
            placeholderTextColor="#6f93a3"
          />
          <TextInput
            style={styles.configInput}
            value={macdSlowInput}
            onChangeText={setMacdSlowInput}
            keyboardType="number-pad"
            placeholder="26"
            placeholderTextColor="#6f93a3"
          />
          <TextInput
            style={styles.configInput}
            value={macdSignalInput}
            onChangeText={setMacdSignalInput}
            keyboardType="number-pad"
            placeholder="9"
            placeholderTextColor="#6f93a3"
          />
        </View>

        <Text style={styles.configTitle}>Stochastic (K, smooth, D)</Text>
        <View style={styles.configInputRow}>
          <TextInput
            style={styles.configInput}
            value={stochKInput}
            onChangeText={setStochKInput}
            keyboardType="number-pad"
            placeholder="10"
            placeholderTextColor="#6f93a3"
          />
          <TextInput
            style={styles.configInput}
            value={stochSmoothInput}
            onChangeText={setStochSmoothInput}
            keyboardType="number-pad"
            placeholder="5"
            placeholderTextColor="#6f93a3"
          />
          <TextInput
            style={styles.configInput}
            value={stochDInput}
            onChangeText={setStochDInput}
            keyboardType="number-pad"
            placeholder="5"
            placeholderTextColor="#6f93a3"
          />
        </View>

        <Pressable
          style={styles.configPresetButton}
          onPress={() => {
            setStochKInput('10');
            setStochSmoothInput('5');
            setStochDInput('5');
          }}
        >
          <Text style={styles.configPresetText}>Preset Stochastic 10,5,5</Text>
        </Pressable>
      </View>

      <View
        style={styles.chartContainer}
        onLayout={handleChartLayout}
        {...panResponder.panHandlers}
      >
        <Svg width="100%" height={totalChartHeight}>
          {[0, 1, 2, 3].map(step => {
            const y =
              topPadding + (step * (priceAreaHeight - topPadding * 1.2)) / 3;
            return (
              <Line
                key={`grid-${step}`}
                x1={0}
                y1={y}
                x2={plotWidth}
                y2={y}
                stroke="#1f3440"
                strokeWidth={1}
              />
            );
          })}

          {supportLevels.map(level => {
            const rawY = getY(level);
            const y = clampPriceY(rawY);
            const isOutOfRange = Math.abs(rawY - y) > 0.1;

            const isNearest =
              Number.isFinite(nearestSupport) &&
              Math.abs(level - nearestSupport) < 1e-6;

            return (
              <React.Fragment key={`support-${level}`}>
                <Line
                  x1={0}
                  y1={y}
                  x2={plotWidth}
                  y2={y}
                  stroke={isNearest ? '#22c55e' : '#16a34a'}
                  strokeWidth={isNearest ? 1.8 : 1.2}
                  strokeDasharray={isNearest || isOutOfRange ? '0' : '5 4'}
                />
                <SvgText
                  x={plotWidth + 6}
                  y={y - 2}
                  fill={isNearest ? '#bbf7d0' : '#86efac'}
                  fontSize={10}
                >
                  {isOutOfRange ? 'S* ' : 'S '}
                  {formatCompactPrice(level)}
                </SvgText>
              </React.Fragment>
            );
          })}

          {resistanceLevels.map(level => {
            const rawY = getY(level);
            const y = clampPriceY(rawY);
            const isOutOfRange = Math.abs(rawY - y) > 0.1;

            const isNearest =
              Number.isFinite(nearestResistance) &&
              Math.abs(level - nearestResistance) < 1e-6;

            return (
              <React.Fragment key={`resistance-${level}`}>
                <Line
                  x1={0}
                  y1={y}
                  x2={plotWidth}
                  y2={y}
                  stroke={isNearest ? '#ef4444' : '#dc2626'}
                  strokeWidth={isNearest ? 1.8 : 1.2}
                  strokeDasharray={isNearest || isOutOfRange ? '0' : '5 4'}
                />
                <SvgText
                  x={plotWidth + 6}
                  y={y - 2}
                  fill={isNearest ? '#fecaca' : '#fca5a5'}
                  fontSize={10}
                >
                  {isOutOfRange ? 'R* ' : 'R '}
                  {formatCompactPrice(level)}
                </SvgText>
              </React.Fragment>
            );
          })}

          {visibleWithIndicators.map((item, index) => {
            if (index === 0) {
              return null;
            }

            const prev = visibleWithIndicators[index - 1];
            const x1 = (index - 1) * candleSlot + candleSlot / 2;
            const x2 = index * candleSlot + candleSlot / 2;

            return (
              <React.Fragment key={`ema-${item.candle.timestamp}`}>
                {showEma20 && prev.ema20 !== null && item.ema20 !== null ? (
                  <Line
                    x1={x1}
                    y1={getY(prev.ema20)}
                    x2={x2}
                    y2={getY(item.ema20)}
                    stroke="#f59e0b"
                    strokeWidth={1.4}
                  />
                ) : null}
                {showEma50 && prev.ema50 !== null && item.ema50 !== null ? (
                  <Line
                    x1={x1}
                    y1={getY(prev.ema50)}
                    x2={x2}
                    y2={getY(item.ema50)}
                    stroke="#22d3ee"
                    strokeWidth={1.4}
                  />
                ) : null}
              </React.Fragment>
            );
          })}

          {visibleCandles.map((candle, index) => {
            const x = index * candleSlot + candleSlot / 2;
            const openY = getY(candle.open);
            const closeY = getY(candle.close);
            const highY = getY(candle.high);
            const lowY = getY(candle.low);
            const isBullish = candle.close >= candle.open;
            const color = isBullish ? '#22c55e' : '#ef4444';
            const bodyY = Math.min(openY, closeY);
            const bodyHeight = Math.max(1.5, Math.abs(openY - closeY));

            return (
              <React.Fragment key={candle.timestamp}>
                <Line
                  x1={x}
                  y1={highY}
                  x2={x}
                  y2={lowY}
                  stroke={color}
                  strokeWidth={1.2}
                />
                <Rect
                  x={x - candleWidth / 2}
                  y={bodyY}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={color}
                  rx={1}
                />
                <Rect
                  x={x - candleWidth / 2}
                  y={getVolumeY(candle.volume ?? 0)}
                  width={Math.max(1, candleWidth * 0.92)}
                  height={
                    priceAreaHeight +
                    volumeAreaHeight -
                    getVolumeY(candle.volume ?? 0)
                  }
                  fill={isBullish ? '#164e3b' : '#7f1d1d'}
                />
              </React.Fragment>
            );
          })}

          {crosshairIndex !== null && visibleCandles[crosshairIndex]
            ? (() => {
                const item = visibleCandles[crosshairIndex];
                const x = crosshairIndex * candleSlot + candleSlot / 2;
                const y = getY(item.close);
                return (
                  <React.Fragment>
                    <Line
                      x1={x}
                      y1={0}
                      x2={x}
                      y2={totalChartHeight}
                      stroke="#9ca3af"
                      strokeWidth={1}
                      strokeDasharray="5 4"
                    />
                    <Line
                      x1={0}
                      y1={y}
                      x2={plotWidth}
                      y2={y}
                      stroke="#9ca3af"
                      strokeWidth={1}
                      strokeDasharray="5 4"
                    />
                  </React.Fragment>
                );
              })()
            : null}

          {showMacd ? (
            <>
              <Rect
                x={0}
                y={macdPanelTop}
                width={plotWidth}
                height={macdPanelHeight}
                fill="#071920"
                stroke="#1f3440"
                strokeWidth={1}
              />
              <Line
                x1={0}
                y1={macdPanelTop + macdPanelHeight / 2}
                x2={plotWidth}
                y2={macdPanelTop + macdPanelHeight / 2}
                stroke="#3f5560"
                strokeWidth={1}
                strokeDasharray="4 3"
              />
              <SvgText x={4} y={macdPanelTop + 12} fill="#8fb3c5" fontSize={10}>
                MACD
              </SvgText>

              {visibleMacd.map((point, index) => {
                if (!point) {
                  return null;
                }

                const x = index * candleSlot + candleSlot / 2;
                const zeroY = getMacdY(0);
                const histY = getMacdY(point.histogram);
                const histHeight = Math.max(1, Math.abs(histY - zeroY));

                return (
                  <Rect
                    key={`macd-hist-${visibleCandles[index].timestamp}`}
                    x={x - Math.max(1, candleWidth * 0.25)}
                    y={Math.min(histY, zeroY)}
                    width={Math.max(1, candleWidth * 0.5)}
                    height={histHeight}
                    fill={point.histogram >= 0 ? '#16a34a' : '#dc2626'}
                    opacity={0.8}
                  />
                );
              })}

              {visibleMacd.map((point, index) => {
                if (index === 0 || !point || !visibleMacd[index - 1]) {
                  return null;
                }

                const prev = visibleMacd[index - 1] as MacdPoint;
                const x1 = (index - 1) * candleSlot + candleSlot / 2;
                const x2 = index * candleSlot + candleSlot / 2;

                return (
                  <React.Fragment
                    key={`macd-line-${visibleCandles[index].timestamp}`}
                  >
                    <Line
                      x1={x1}
                      y1={getMacdY(prev.macd)}
                      x2={x2}
                      y2={getMacdY(point.macd)}
                      stroke="#38bdf8"
                      strokeWidth={1.4}
                    />
                    <Line
                      x1={x1}
                      y1={getMacdY(prev.signal)}
                      x2={x2}
                      y2={getMacdY(point.signal)}
                      stroke="#f97316"
                      strokeWidth={1.2}
                    />
                  </React.Fragment>
                );
              })}
            </>
          ) : null}

          {showStochastic ? (
            <>
              <Rect
                x={0}
                y={stochPanelTop}
                width={plotWidth}
                height={stochPanelHeight}
                fill="#071920"
                stroke="#1f3440"
                strokeWidth={1}
              />
              <Line
                x1={0}
                y1={getStochY(80)}
                x2={plotWidth}
                y2={getStochY(80)}
                stroke="#4b5563"
                strokeWidth={1}
                strokeDasharray="4 3"
              />
              <Line
                x1={0}
                y1={getStochY(20)}
                x2={plotWidth}
                y2={getStochY(20)}
                stroke="#4b5563"
                strokeWidth={1}
                strokeDasharray="4 3"
              />
              <SvgText
                x={4}
                y={stochPanelTop + 12}
                fill="#8fb3c5"
                fontSize={10}
              >
                STOCH
              </SvgText>

              {visibleStochastic.map((point, index) => {
                if (index === 0 || !point || !visibleStochastic[index - 1]) {
                  return null;
                }

                const prev = visibleStochastic[index - 1] as StochPoint;
                const x1 = (index - 1) * candleSlot + candleSlot / 2;
                const x2 = index * candleSlot + candleSlot / 2;

                return (
                  <React.Fragment
                    key={`stoch-line-${visibleCandles[index].timestamp}`}
                  >
                    <Line
                      x1={x1}
                      y1={getStochY(prev.k)}
                      x2={x2}
                      y2={getStochY(point.k)}
                      stroke="#22c55e"
                      strokeWidth={1.4}
                    />
                    <Line
                      x1={x1}
                      y1={getStochY(prev.d)}
                      x2={x2}
                      y2={getStochY(point.d)}
                      stroke="#eab308"
                      strokeWidth={1.3}
                    />
                  </React.Fragment>
                );
              })}
            </>
          ) : null}

          <SvgText x={plotWidth + 6} y={14} fill="#8fb3c5" fontSize={10}>
            {formatCompactPrice(maxPrice)}
          </SvgText>
          <SvgText
            x={plotWidth + 6}
            y={priceAreaHeight - 6}
            fill="#8fb3c5"
            fontSize={10}
          >
            {formatCompactPrice(minPrice)}
          </SvgText>
        </Svg>
      </View>

      {selected ? (
        <View style={styles.ohlcRow}>
          <Text style={styles.ohlcText}>
            O {formatCompactPrice(selected.open)}
          </Text>
          <Text style={styles.ohlcText}>
            H {formatCompactPrice(selected.high)}
          </Text>
          <Text style={styles.ohlcText}>
            L {formatCompactPrice(selected.low)}
          </Text>
          <Text style={styles.ohlcText}>
            C {formatCompactPrice(selected.close)}
          </Text>
          <Text style={styles.ohlcDate}>{formatDate(selected.timestamp)}</Text>
        </View>
      ) : null}

      {showMacd || showStochastic ? (
        <View style={styles.indicatorValueCard}>
          {supportLevels.length || resistanceLevels.length ? (
            <Text style={styles.indicatorValueText}>
              SR: nearest S{' '}
              {Number.isFinite(nearestSupport)
                ? formatCompactPrice(nearestSupport)
                : '-'}{' '}
              | nearest R{' '}
              {Number.isFinite(nearestResistance)
                ? formatCompactPrice(nearestResistance)
                : '-'}
            </Text>
          ) : null}

          {showMacd ? (
            <Text style={styles.indicatorValueText}>
              MACD ({macdFast},{macdSlow},{macdSignal}):{' '}
              {selectedMacd
                ? `${selectedMacd.macd.toFixed(2)} / Signal ${selectedMacd.signal.toFixed(2)} / Hist ${selectedMacd.histogram.toFixed(2)}`
                : '-'}
            </Text>
          ) : null}

          {showStochastic ? (
            <Text style={styles.indicatorValueText}>
              STOCH ({stochKPeriod},{stochKSmooth},{stochDPeriod}):{' '}
              {selectedStochastic
                ? `%K ${selectedStochastic.k.toFixed(2)} / %D ${selectedStochastic.d.toFixed(2)}`
                : `Belum tersedia, butuh minimal ${minStochCandles} candle.`}
            </Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.legendRow}>
        {showEma20 ? <Text style={styles.legendItem}>EMA20</Text> : null}
        {showEma50 ? (
          <Text style={[styles.legendItem, styles.legendItemSecond]}>
            EMA50
          </Text>
        ) : null}
      </View>
    </ScrollView>
  );
}

export default memo(NativeTradingChart);

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1b3d45',
    backgroundColor: '#041014',
  },
  wrapperContent: {
    padding: 10,
    gap: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  symbolText: {
    color: '#d9f8ff',
    fontSize: 15,
    fontWeight: '700',
  },
  toolbarActions: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    maxWidth: '70%',
  },
  zoomButton: {
    minHeight: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f2830',
    borderWidth: 1,
    borderColor: '#24515e',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  zoomLabel: {
    color: '#d9f8ff',
    fontSize: 11,
    fontWeight: '700',
  },
  intervalRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  indicatorToggleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  indicatorChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1f3f49',
    backgroundColor: '#0c1f25',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  indicatorChipActive: {
    borderColor: '#38bdf8',
    backgroundColor: '#124453',
  },
  indicatorChipText: {
    color: '#99bac8',
    fontSize: 11,
    fontWeight: '700',
  },
  indicatorChipTextActive: {
    color: '#e6f8ff',
  },
  configCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1b3d45',
    backgroundColor: '#071920',
    padding: 10,
    gap: 8,
  },
  configTitle: {
    color: '#95cae0',
    fontSize: 11,
    fontWeight: '700',
  },
  configInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  configInput: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1f3f49',
    backgroundColor: '#0c1f25',
    color: '#d9f8ff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
  },
  configPresetButton: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a5a6a',
    backgroundColor: '#103240',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  configPresetText: {
    color: '#b5e8fb',
    fontSize: 11,
    fontWeight: '700',
  },
  intervalButton: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#0c1f25',
    borderWidth: 1,
    borderColor: '#1f3f49',
  },
  intervalButtonActive: {
    backgroundColor: '#124453',
    borderColor: '#38bdf8',
  },
  intervalText: {
    color: '#99bac8',
    fontSize: 11,
    fontWeight: '700',
  },
  intervalTextActive: {
    color: '#e6f8ff',
  },
  chartContainer: {
    width: '100%',
    minHeight: 360,
  },
  ohlcRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ohlcText: {
    color: '#bfe8f8',
    fontSize: 11,
    fontWeight: '600',
  },
  ohlcDate: {
    color: '#7dc7df',
    fontSize: 11,
    fontWeight: '700',
  },
  indicatorValueCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1d3f49',
    backgroundColor: '#081a20',
    padding: 8,
    gap: 4,
  },
  indicatorValueText: {
    color: '#bfe8f8',
    fontSize: 11,
    lineHeight: 16,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 8,
  },
  legendItem: {
    color: '#f59e0b',
    fontSize: 11,
    fontWeight: '700',
  },
  legendItemSecond: {
    color: '#22d3ee',
  },
  emptyState: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3a2f14',
    backgroundColor: '#1f1a0f',
    padding: 14,
    gap: 6,
  },
  emptyTitle: {
    color: '#fde68a',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyDescription: {
    color: '#fef3c7',
    lineHeight: 18,
    fontSize: 12,
  },
});
