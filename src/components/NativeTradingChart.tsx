import React, { useMemo, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';
import type { ChartCandle } from '@/services/stockAnalyzerApi';

interface NativeTradingChartProps {
  candles: ChartCandle[];
  symbol: string;
  interval: string;
  onIntervalChange: (interval: string) => void;
}

const INTERVALS = [
  { label: '15m', value: '15m' },
  { label: '1H', value: '60m' },
  { label: '4H', value: '4h' },
  { label: '1D', value: '1d' },
  { label: '1W', value: '1wk' },
] as const;

const formatCompactPrice = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (timestamp: number) =>
  new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(timestamp));

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

export default function NativeTradingChart({
  candles,
  symbol,
  interval,
  onIntervalChange,
}: NativeTradingChartProps) {
  const [layoutWidth, setLayoutWidth] = useState(0);
  const [windowSize, setWindowSize] = useState(60);
  const [offsetFromLatest, setOffsetFromLatest] = useState(0);
  const [crosshairIndex, setCrosshairIndex] = useState<number | null>(null);

  const dragStartOffset = useRef(0);

  const maxOffset = Math.max(0, candles.length - windowSize);
  const safeOffset = Math.max(0, Math.min(offsetFromLatest, maxOffset));

  const visibleCandles = useMemo(() => {
    if (!candles.length) {
      return [] as ChartCandle[];
    }

    const safeWindow = Math.min(Math.max(windowSize, 20), candles.length);
    const start = Math.max(0, candles.length - safeWindow - safeOffset);
    const end = Math.max(start + 1, candles.length - safeOffset);

    return candles.slice(start, end);
  }, [candles, safeOffset, windowSize]);

  const ema20 = useMemo(() => buildEmaSeries(candles, 20), [candles]);
  const ema50 = useMemo(() => buildEmaSeries(candles, 50), [candles]);

  const visibleWithIndicators = useMemo(() => {
    const start = Math.max(
      0,
      candles.length - visibleCandles.length - safeOffset,
    );
    return visibleCandles.map((candle, index) => ({
      candle,
      ema20: ema20[start + index],
      ema50: ema50[start + index],
    }));
  }, [candles.length, ema20, ema50, safeOffset, visibleCandles]);

  const maxPrice = useMemo(() => {
    const seriesMax = visibleWithIndicators.reduce((acc, item) => {
      const markerMax = Math.max(
        item.ema20 ?? Number.NEGATIVE_INFINITY,
        item.ema50 ?? Number.NEGATIVE_INFINITY,
      );
      return Math.max(acc, item.candle.high, markerMax);
    }, Number.NEGATIVE_INFINITY);
    return Number.isFinite(seriesMax) ? seriesMax : 0;
  }, [visibleWithIndicators]);

  const minPrice = useMemo(() => {
    const seriesMin = visibleWithIndicators.reduce((acc, item) => {
      const markerMin = Math.min(
        item.ema20 ?? Number.POSITIVE_INFINITY,
        item.ema50 ?? Number.POSITIVE_INFINITY,
      );
      return Math.min(acc, item.candle.low, markerMin);
    }, Number.POSITIVE_INFINITY);
    return Number.isFinite(seriesMin) ? seriesMin : 0;
  }, [visibleWithIndicators]);

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
  const topPadding = 10;
  const rightAxis = 52;
  const usableWidth = Math.max(layoutWidth - rightAxis, 1);
  const candleSlot = usableWidth / Math.max(visibleCandles.length, 1);
  const candleWidth = Math.max(2, candleSlot * 0.56);
  const priceRange = Math.max(maxPrice - minPrice, maxPrice * 0.003, 1);

  const getY = (price: number) => {
    const ratio = (maxPrice - price) / priceRange;
    return topPadding + ratio * (priceAreaHeight - topPadding * 1.2);
  };

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
    if (!visibleCandles.length || usableWidth <= 0) {
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
          Math.abs(gestureState.dx) > 6 || Math.abs(gestureState.dy) > 6,
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

  const handleChartLayout = (event: LayoutChangeEvent) => {
    setLayoutWidth(event.nativeEvent.layout.width);
  };

  const handleZoomIn = () => {
    setWindowSize(prev => Math.max(20, prev - 10));
    setOffsetFromLatest(0);
  };

  const handleZoomOut = () => {
    setWindowSize(prev => Math.min(candles.length, prev + 10));
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

  return (
    <View style={styles.wrapper}>
      <View style={styles.topBar}>
        <Text style={styles.symbolText}>{symbol}</Text>
        <View style={styles.toolbarActions}>
          <Pressable style={styles.zoomButton} onPress={handleZoomOut}>
            <Text style={styles.zoomLabel}>-</Text>
          </Pressable>
          <Pressable style={styles.zoomButton} onPress={handleZoomIn}>
            <Text style={styles.zoomLabel}>+</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.intervalRow}>
        {INTERVALS.map(item => {
          const active = interval === item.value;
          return (
            <Pressable
              key={item.value}
              onPress={() => onIntervalChange(item.value)}
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
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View
        style={styles.chartContainer}
        onLayout={handleChartLayout}
        {...panResponder.panHandlers}
      >
        <Svg width="100%" height={chartHeight}>
          {[0, 1, 2, 3].map(step => {
            const y =
              topPadding + (step * (priceAreaHeight - topPadding * 1.2)) / 3;
            return (
              <Line
                key={`grid-${step}`}
                x1={0}
                y1={y}
                x2={usableWidth}
                y2={y}
                stroke="#1f3440"
                strokeWidth={1}
              />
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
                {prev.ema20 !== null && item.ema20 !== null ? (
                  <Line
                    x1={x1}
                    y1={getY(prev.ema20)}
                    x2={x2}
                    y2={getY(item.ema20)}
                    stroke="#f59e0b"
                    strokeWidth={1.4}
                  />
                ) : null}
                {prev.ema50 !== null && item.ema50 !== null ? (
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
                      y2={chartHeight}
                      stroke="#9ca3af"
                      strokeWidth={1}
                      strokeDasharray="5 4"
                    />
                    <Line
                      x1={0}
                      y1={y}
                      x2={usableWidth}
                      y2={y}
                      stroke="#9ca3af"
                      strokeWidth={1}
                      strokeDasharray="5 4"
                    />
                  </React.Fragment>
                );
              })()
            : null}

          <SvgText x={usableWidth + 6} y={14} fill="#8fb3c5" fontSize={10}>
            {formatCompactPrice(maxPrice)}
          </SvgText>
          <SvgText
            x={usableWidth + 6}
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

      <View style={styles.legendRow}>
        <Text style={styles.legendItem}>EMA20</Text>
        <Text style={[styles.legendItem, styles.legendItemSecond]}>EMA50</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1b3d45',
    backgroundColor: '#041014',
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
  },
  zoomButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f2830',
    borderWidth: 1,
    borderColor: '#24515e',
  },
  zoomLabel: {
    color: '#d9f8ff',
    fontSize: 15,
    fontWeight: '700',
  },
  intervalRow: {
    flexDirection: 'row',
    gap: 6,
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
    minHeight: 280,
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
