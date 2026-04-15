import React, { useMemo, useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  getRecommendationsByStyle,
  getStockSnapshots,
} from '@/services/stockAnalyzer';
import { StockRecommendation, TradingStyle } from '@/types/stock-analyzer';

const STYLE_OPTIONS: { label: string; value: TradingStyle; desc: string }[] = [
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

const formatBn = (value: number) => `${value.toFixed(1)} Bn`;

export const StockAnalyzerScreen = () => {
  const [selectedStyle, setSelectedStyle] = useState<TradingStyle>('day');
  const [selectedSymbol, setSelectedSymbol] = useState(
    getStockSnapshots()[0].symbol,
  );

  const recommendations = useMemo(
    () => getRecommendationsByStyle(selectedStyle),
    [selectedStyle],
  );

  const selectedRecommendation = useMemo(() => {
    return (
      recommendations.find(rec => rec.stock.symbol === selectedSymbol) ??
      recommendations[0]
    );
  }, [recommendations, selectedSymbol]);

  const openTradingView = async (symbol: string) => {
    const url = `https://www.tradingview.com/chart/?symbol=IDX%3A${symbol}`;
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    }
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.overline}>StockPilot Analyzer</Text>
        <Text style={styles.heroTitle}>Rekomendasi Saham Indonesia</Text>
        <Text style={styles.heroSubtitle}>
          Screening berbasis indikator, liquidity sweep, dan bid-offer
          imbalance.
        </Text>
      </View>

      <View style={styles.styleTabs}>
        {STYLE_OPTIONS.map(style => {
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
              <Text
                style={[styles.tabDesc, isActive && styles.tabDescActive]}
                numberOfLines={2}
              >
                {style.desc}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Top Rekomendasi</Text>
        <Text style={styles.sectionHint}>Tap saham untuk detail strategi</Text>
      </View>

      <View style={styles.stockList}>
        {recommendations.map(item => {
          const isSelected =
            item.stock.symbol === selectedRecommendation.stock.symbol;

          return (
            <Pressable
              key={`${item.style}-${item.stock.symbol}`}
              onPress={() => setSelectedSymbol(item.stock.symbol)}
              style={[styles.stockCard, isSelected && styles.stockCardSelected]}
            >
              <View style={styles.stockTopRow}>
                <View>
                  <Text style={styles.symbol}>{item.stock.symbol}</Text>
                  <Text style={styles.company}>{item.stock.name}</Text>
                </View>
                <View
                  style={[
                    styles.actionTag,
                    { borderColor: actionColor[item.action] },
                  ]}
                >
                  <Text
                    style={[
                      styles.actionText,
                      { color: actionColor[item.action] },
                    ]}
                  >
                    {item.action}
                  </Text>
                </View>
              </View>

              <View style={styles.stockStats}>
                <Text style={styles.statText}>Skor: {item.score}/100</Text>
                <Text style={styles.statText}>
                  Confidence: {confidenceLabel[item.confidence]}
                </Text>
                <Text style={styles.statText}>
                  Harga: {formatIDR(item.stock.price)}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.detailTitle}>
          Strategi {selectedRecommendation.stock.symbol} ({selectedStyle})
        </Text>
        <Text style={styles.detailMeta}>
          Timeframe: {selectedRecommendation.strategy.timeframe}
        </Text>
        <Text style={styles.detailItem}>
          Entry: {formatIDR(selectedRecommendation.strategy.entryPrice)}
        </Text>
        <Text style={styles.detailItem}>
          Take Profit 1:{' '}
          {formatIDR(selectedRecommendation.strategy.takeProfit1)}
        </Text>
        <Text style={styles.detailItem}>
          Take Profit 2:{' '}
          {formatIDR(selectedRecommendation.strategy.takeProfit2)}
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

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Alasan Sinyal</Text>
      </View>

      <View style={styles.reasonCard}>
        {selectedRecommendation.reasons.map(reason => (
          <Text style={styles.reasonText} key={reason}>
            • {reason}
          </Text>
        ))}
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Broker Summary</Text>
        <Text style={styles.sectionHint}>Snapshot net flow</Text>
      </View>

      <View style={styles.brokerCard}>
        {selectedRecommendation.stock.brokerSummary.map(broker => {
          const net = broker.buyValueBn - broker.sellValueBn;

          return (
            <View key={broker.broker} style={styles.brokerRow}>
              <Text style={styles.brokerCode}>{broker.broker}</Text>
              <Text style={styles.brokerMetric}>
                Buy {formatBn(broker.buyValueBn)}
              </Text>
              <Text style={styles.brokerMetric}>
                Sell {formatBn(broker.sellValueBn)}
              </Text>
              <Text
                style={[
                  styles.brokerNet,
                  { color: net >= 0 ? '#22c55e' : '#ef4444' },
                ]}
              >
                Net {net >= 0 ? '+' : ''}
                {formatBn(net)}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>TradingView & Indikator</Text>
      </View>

      <View style={styles.tradingViewCard}>
        <Text style={styles.tvSymbol}>
          Symbol: {selectedRecommendation.tradingViewSymbol}
        </Text>
        <Text style={styles.tvIndicatorsTitle}>Indikator Aktif (preset):</Text>
        <Text style={styles.tvIndicators}>
          {selectedRecommendation.activeIndicators.join(' • ')}
        </Text>

        <Pressable
          style={styles.tvButton}
          onPress={() => openTradingView(selectedRecommendation.stock.symbol)}
        >
          <Text style={styles.tvButtonText}>Buka Chart di TradingView</Text>
        </Pressable>
      </View>
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
  styleTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  tabItem: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#1b3d45',
    backgroundColor: '#0a1a20',
    borderRadius: 14,
    padding: 10,
    minHeight: 88,
  },
  tabItemActive: {
    backgroundColor: '#11323b',
    borderColor: '#38bdf8',
  },
  tabLabel: {
    color: '#d5ebf6',
    fontWeight: '700',
    marginBottom: 4,
  },
  tabLabelActive: {
    color: '#ecfeff',
  },
  tabDesc: {
    color: '#8eb5c5',
    fontSize: 12,
    lineHeight: 16,
  },
  tabDescActive: {
    color: '#bbe5f8',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  sectionTitle: {
    color: '#eaf8fd',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionHint: {
    color: '#8bb6c5',
    fontSize: 12,
  },
  stockList: {
    gap: 10,
  },
  stockCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#19373f',
    backgroundColor: '#091920',
    padding: 12,
    gap: 8,
  },
  stockCardSelected: {
    borderColor: '#34d399',
    backgroundColor: '#0b2328',
  },
  stockTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  symbol: {
    color: '#f0fdff',
    fontSize: 20,
    fontWeight: '800',
  },
  company: {
    color: '#98c2d0',
    fontSize: 12,
    marginTop: 2,
  },
  actionTag: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  actionText: {
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.6,
  },
  stockStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statText: {
    color: '#d6edf5',
    fontSize: 12,
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
    fontSize: 17,
  },
  detailMeta: {
    color: '#97d8bd',
    fontSize: 12,
    marginBottom: 2,
  },
  detailItem: {
    color: '#d8f2e6',
    fontSize: 13,
  },
  detailRule: {
    color: '#b0dec9',
    marginTop: 4,
    lineHeight: 18,
  },
  reasonCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2d3b4d',
    backgroundColor: '#121b2e',
    padding: 12,
    gap: 8,
  },
  reasonText: {
    color: '#d9e4ff',
    lineHeight: 18,
    fontSize: 13,
  },
  brokerCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#453418',
    backgroundColor: '#211706',
    padding: 12,
    gap: 10,
  },
  brokerRow: {
    gap: 2,
  },
  brokerCode: {
    color: '#facc15',
    fontWeight: '800',
    fontSize: 14,
  },
  brokerMetric: {
    color: '#fee7b0',
    fontSize: 12,
  },
  brokerNet: {
    fontWeight: '700',
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
  },
  tvIndicatorsTitle: {
    color: '#c8b8ff',
    fontSize: 12,
  },
  tvIndicators: {
    color: '#eee8ff',
    lineHeight: 18,
    fontSize: 13,
  },
  tvButton: {
    marginTop: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#6d28d9',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  tvButtonText: {
    color: '#faf5ff',
    fontWeight: '700',
  },
});
