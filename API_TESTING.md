# StockPilot IDX Analyzer - API Testing Guide

## Environment Setup

Pastikan backend server sudah berjalan di `http://localhost:3000`

```bash
# Jika backend di lokasi lain, set variable:
export API_HOST="http://localhost:3000"
export PREFIX="/stockpilot"
export BASE_URL="${API_HOST}${PREFIX}"
echo "Base URL: $BASE_URL"
```

---

## 1. Health Check - GET /stockpilot/

Memverifikasi API sudah siap, melihat versi dan endpoint tersedia.

### cURL Command

```bash
curl -X GET "${BASE_URL}/" \
  -H "Content-Type: application/json"
```

### Expected Response (200)

```json
{
  "appName": "StockPilot IDX Analyzer",
  "version": "1.1.0",
  "description": "API rekomendasi saham Indonesia berbasis indikator teknikal, liquidity sweep, dan bid-offer.",
  "endpoints": {
    "recommendation": "POST /stock-analysis/recommendation",
    "recommendationAuto": "POST /stock-analysis/recommendation/auto",
    "marketData": "GET /stock-analysis/market-data/:symbol",
    "tradingView": "GET /stock-analysis/tradingview/:symbol",
    "trainMl": "POST /stock-analysis/ml/train"
  },
  "ml": {
    "enabled": true,
    "note": "Model logistic regression sederhana untuk kalibrasi probabilitas BUY/SELL.",
    "training": {
      "trainedSamples": 0,
      "epochs": 0,
      "learningRate": 0,
      "lastTrainedAt": null
    }
  }
}
```

---

## 2. Market Data - GET /stock-analysis/market-data/:symbol

Ambil data pasar terbaru dari Yahoo Finance dengan indikator teknikal otomatis.

### cURL Command

```bash
curl -X GET "${BASE_URL}/stock-analysis/market-data/BBCA" \
  -H "Content-Type: application/json"
```

### Testing Multiple Symbols

```bash
for symbol in BBCA BBRI ASII TLKM BMRI; do
  echo "=== Testing $symbol ==="
  curl -X GET "${BASE_URL}/stock-analysis/market-data/$symbol" \
    -H "Content-Type: application/json" | jq '.'
  echo ""
done
```

### Expected Response (200)

```json
{
  "symbol": "BBCA.JK",
  "closePrice": 5750.5,
  "indicators": {
    "rsi": 62.45,
    "macdHistogram": 125.3,
    "volumeRatio": 1.32,
    "ema20": 5625.0,
    "ema50": 5480.75
  },
  "source": {
    "provider": "Yahoo Finance",
    "range": "6mo",
    "interval": "1d"
  }
}
```

### Error Response (400)

```bash
# Symbol tidak ditemukan
curl -X GET "${BASE_URL}/stock-analysis/market-data/INVALID" \
  -H "Content-Type: application/json"
```

```json
{
  "statusCode": 400,
  "message": "Gagal ambil data pasar untuk INVALID.JK. Status: 404",
  "error": "Bad Request"
}
```

---

## 3. Manual Recommendation - POST /stock-analysis/recommendation

Analisis manual dengan input indikator dan data pasar sendiri.

### cURL Command (Simple Example)

```bash
curl -X POST "${BASE_URL}/stock-analysis/recommendation" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BBCA",
    "closePrice": 5750.5,
    "rsi": 62.45,
    "macdHistogram": 125.30,
    "volumeRatio": 1.32,
    "liquiditySweep": "BULLISH",
    "bidOfferImbalance": 0.25,
    "ema20": 5625.00,
    "ema50": 5480.75,
    "foreignFlowBillion": 15.5,
    "brokerNetBuyTop3Billion": 8.3,
    "tradingViewIndicators": ["RSI", "MACD", "VWAP"]
  }' | jq '.'
```

### cURL Command (Save to File)

```bash
# Simpan payload ke file untuk reusability
cat > /tmp/bbca_recommendation.json <<'EOF'
{
  "symbol": "BBCA",
  "closePrice": 5750.5,
  "rsi": 62.45,
  "macdHistogram": 125.30,
  "volumeRatio": 1.32,
  "liquiditySweep": "BULLISH",
  "bidOfferImbalance": 0.25,
  "ema20": 5625.00,
  "ema50": 5480.75,
  "foreignFlowBillion": 15.5,
  "brokerNetBuyTop3Billion": 8.3,
  "tradingViewIndicators": ["RSI", "MACD", "VWAP"]
}
EOF

# Send request
curl -X POST "${BASE_URL}/stock-analysis/recommendation" \
  -H "Content-Type: application/json" \
  -d @/tmp/bbca_recommendation.json | jq '.'
```

### Expected Response (200)

```json
{
  "symbol": "BBCA",
  "generatedAt": "2026-04-15T10:30:45.123Z",
  "methodology": ["TECHNICAL_INDICATORS", "LIQUIDITY_SWEEP", "BID_OFFER"],
  "marketBias": "BULLISH",
  "scoring": {
    "longScore": 14,
    "shortScore": 3,
    "confidence": "HIGH",
    "mlProbabilityBuy": 0.72,
    "mlSignal": "BUY",
    "mlNote": "Probabilitas BUY dari model logistic regression yang bisa dilatih ulang memakai data historis Anda."
  },
  "brokerSummary": {
    "foreignFlowBillion": 15.5,
    "top3BrokerNetBuyBillion": 8.3,
    "interpretation": "Afirmasi akumulasi dari asing dan broker utama."
  },
  "strategies": {
    "dayTrading": {
      "style": "DAY_TRADING",
      "recommendation": "BUY",
      "entry": 5763.76,
      "takeProfit": 5867.92,
      "trailingStop": 5754.13,
      "stopLoss": 5710.94,
      "cutLoss": 5710.94,
      "note": "Entry saat pullback valid di atas area demand intraday."
    },
    "swingTrading": {
      "style": "SWING_TRADING",
      "recommendation": "BUY",
      "entry": 5778.0,
      "takeProfit": 6125.38,
      "trailingStop": 5850.38,
      "stopLoss": 5603.0,
      "cutLoss": 5603.0,
      "note": "Entry saat pullback valid di atas area demand intraday."
    },
    "scalping": {
      "style": "SCALPING",
      "recommendation": "BUY",
      "entry": 5759.38,
      "takeProfit": 5811.19,
      "trailingStop": 5744.0,
      "stopLoss": 5724.19,
      "cutLoss": 5724.19,
      "note": "Entry saat pullback valid di atas area demand intraday."
    }
  },
  "tradingView": {
    "symbol": "IDX:BBCA",
    "defaultInterval": "60",
    "exchange": "IDX",
    "indicators": ["RSI", "MACD", "VWAP"],
    "chartUrl": "https://www.tradingview.com/chart/?symbol=IDX%3ABBCA"
  },
  "disclaimer": "Rekomendasi ini bersifat edukatif, bukan nasihat keuangan. Tetap lakukan analisis mandiri."
}
```

### Error Response - Invalid Enum (400)

```bash
curl -X POST "${BASE_URL}/stock-analysis/recommendation" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BBCA",
    "closePrice": 5750.5,
    "rsi": 62.45,
    "macdHistogram": 125.30,
    "volumeRatio": 1.32,
    "liquiditySweep": "INVALID_VALUE",
    "bidOfferImbalance": 0.25,
    "ema20": 5625.00,
    "ema50": 5480.75,
    "foreignFlowBillion": 15.5,
    "brokerNetBuyTop3Billion": 8.3
  }'
```

```json
{
  "statusCode": 400,
  "message": "liquiditySweep must be one of the following values: BULLISH, BEARISH, NONE",
  "error": "Bad Request"
}
```

---

## 4. Auto Recommendation - POST /stock-analysis/recommendation/auto

Analisis otomatis yang mengambil market data dari Yahoo dan generate rekomendasi hybrid.

### cURL Command

```bash
curl -X POST "${BASE_URL}/stock-analysis/recommendation/auto" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BBCA",
    "liquiditySweep": "BULLISH",
    "bidOfferImbalance": 0.25,
    "foreignFlowBillion": 15.5,
    "brokerNetBuyTop3Billion": 8.3,
    "tradingViewIndicators": ["RSI", "MACD", "VWAP", "EMA"]
  }' | jq '.'
```

### Testing Multiple Symbols (Batch)

```bash
for symbol in BBCA BBRI ASII TLKM BMRI; do
  echo "=== Auto Recommendation for $symbol ==="
  curl -X POST "${BASE_URL}/stock-analysis/recommendation/auto" \
    -H "Content-Type: application/json" \
    -d "{
      \"symbol\": \"$symbol\",
      \"liquiditySweep\": \"BULLISH\",
      \"bidOfferImbalance\": 0.25,
      \"foreignFlowBillion\": 15.5,
      \"brokerNetBuyTop3Billion\": 8.3,
      \"tradingViewIndicators\": [\"RSI\", \"MACD\", \"VWAP\"]
    }" | jq '.recommendation.symbol, .recommendation.scoring, .recommendation.strategies | keys'
  echo ""
done
```

### Expected Response (200)

```json
{
  "marketData": {
    "symbol": "BBCA.JK",
    "closePrice": 5750.5,
    "indicators": {
      "rsi": 62.45,
      "macdHistogram": 125.30,
      "volumeRatio": 1.32,
      "ema20": 5625.00,
      "ema50": 5480.75
    },
    "source": {
      "provider": "Yahoo Finance",
      "range": "6mo",
      "interval": "1d"
    }
  },
  "recommendation": {
    "symbol": "BBCA.JK",
    "generatedAt": "2026-04-15T10:30:45.123Z",
    "methodology": ["TECHNICAL_INDICATORS", "LIQUIDITY_SWEEP", "BID_OFFER"],
    "marketBias": "BULLISH",
    "scoring": {
      "longScore": 14,
      "shortScore": 3,
      "confidence": "HIGH",
      "mlProbabilityBuy": 0.72,
      "mlSignal": "BUY",
      "mlNote": "Probabilitas BUY dari model logistic regression yang bisa dilatih ulang memakai data historis Anda."
    },
    "brokerSummary": {
      "foreignFlowBillion": 15.5,
      "top3BrokerNetBuyBillion": 8.3,
      "interpretation": "Afirmasi akumulasi dari asing dan broker utama."
    },
    "strategies": {
      "dayTrading": {...},
      "swingTrading": {...},
      "scalping": {...}
    },
    "tradingView": {
      "symbol": "IDX:BBCA",
      "defaultInterval": "60",
      "exchange": "IDX",
      "indicators": ["RSI", "MACD", "VWAP", "EMA"],
      "chartUrl": "https://www.tradingview.com/chart/?symbol=IDX%3ABBCA"
    },
    "disclaimer": "Rekomendasi ini bersifat edukatif, bukan nasihat keuangan. Tetap lakukan analisis mandiri."
  }
}
```

---

## 5. TradingView Config - GET /stock-analysis/tradingview/:symbol

Dapatkan konfigurasi TradingView untuk saham, termasuk daftar indikator teknikal.

### cURL Command (Default Indicators)

```bash
curl -X GET "${BASE_URL}/stock-analysis/tradingview/BBCA" \
  -H "Content-Type: application/json"
```

### cURL Command (Custom Indicators)

```bash
curl -X GET "${BASE_URL}/stock-analysis/tradingview/BBCA?indicators=RSI,MACD,VWAP,Bollinger" \
  -H "Content-Type: application/json"
```

### Expected Response (200)

```json
{
  "symbol": "IDX:BBCA",
  "defaultInterval": "60",
  "exchange": "IDX",
  "indicators": ["RSI", "MACD", "VWAP", "EMA 20", "EMA 50", "Volume"],
  "chartUrl": "https://www.tradingview.com/chart/?symbol=IDX%3ABBCA"
}
```

### With Custom Indicators

```json
{
  "symbol": "IDX:BBCA",
  "defaultInterval": "60",
  "exchange": "IDX",
  "indicators": ["RSI", "MACD", "VWAP", "Bollinger"],
  "chartUrl": "https://www.tradingview.com/chart/?symbol=IDX%3ABBCA"
}
```

---

## 6. ML Training - POST /stock-analysis/ml/train

Training/retrain model logistic regression dengan data historis berlabel.

### cURL Command (Simple)

```bash
curl -X POST "${BASE_URL}/stock-analysis/ml/train" \
  -H "Content-Type: application/json" \
  -d '{
    "samples": [
      {
        "rsi": 62.45,
        "macdHistogram": 125.30,
        "volumeRatio": 1.32,
        "bidOfferImbalance": 0.25,
        "emaSpreadPercent": 2.35,
        "foreignFlowBillion": 15.5,
        "brokerNetBuyTop3Billion": 8.3,
        "target": "BUY"
      },
      {
        "rsi": 35.20,
        "macdHistogram": -85.50,
        "volumeRatio": 0.95,
        "bidOfferImbalance": -0.30,
        "emaSpreadPercent": -1.80,
        "foreignFlowBillion": -12.0,
        "brokerNetBuyTop3Billion": -5.2,
        "target": "SELL"
      }
    ],
    "learningRate": 0.08,
    "epochs": 250
  }' | jq '.'
```

### cURL Command (Load from File)

```bash
cat > /tmp/training_data.json <<'EOF'
{
  "samples": [
    {
      "rsi": 62.45,
      "macdHistogram": 125.30,
      "volumeRatio": 1.32,
      "bidOfferImbalance": 0.25,
      "emaSpreadPercent": 2.35,
      "foreignFlowBillion": 15.5,
      "brokerNetBuyTop3Billion": 8.3,
      "target": "BUY"
    },
    {
      "rsi": 45.50,
      "macdHistogram": 50.20,
      "volumeRatio": 1.10,
      "bidOfferImbalance": 0.10,
      "emaSpreadPercent": 1.20,
      "foreignFlowBillion": 5.0,
      "brokerNetBuyTop3Billion": 3.1,
      "target": "BUY"
    },
    {
      "rsi": 35.20,
      "macdHistogram": -85.50,
      "volumeRatio": 0.95,
      "bidOfferImbalance": -0.30,
      "emaSpreadPercent": -1.80,
      "foreignFlowBillion": -12.0,
      "brokerNetBuyTop3Billion": -5.2,
      "target": "SELL"
    },
    {
      "rsi": 28.10,
      "macdHistogram": -120.40,
      "volumeRatio": 0.85,
      "bidOfferImbalance": -0.45,
      "emaSpreadPercent": -3.50,
      "foreignFlowBillion": -18.5,
      "brokerNetBuyTop3Billion": -9.8,
      "target": "SELL"
    }
  ],
  "learningRate": 0.08,
  "epochs": 250
}
EOF

curl -X POST "${BASE_URL}/stock-analysis/ml/train" \
  -H "Content-Type: application/json" \
  -d @/tmp/training_data.json | jq '.'
```

### Expected Response (200)

```json
{
  "status": "MODEL_UPDATED",
  "training": {
    "trainedSamples": 250,
    "epochs": 250,
    "learningRate": 0.08,
    "lastTrainedAt": "2026-04-15T10:45:30.500Z",
    "trainAccuracy": 87.2
  },
  "weights": {
    "rsi": 0.22,
    "macdHistogram": 1.45,
    "volumeRatio": 0.78,
    "bidOfferImbalance": 1.65,
    "emaSpreadPercent": 0.95,
    "foreignFlowBillion": 0.12,
    "brokerNetBuyTop3Billion": 0.18,
    "bias": -0.45
  }
}
```

---

## Testing Workflow

### 1. Full Integration Test

```bash
#!/bin/bash

BASE_URL="http://localhost:3000/stockpilot"

echo "1. Health Check"
curl -s -X GET "${BASE_URL}/" | jq -r '.appName, .version'

echo -e "\n2. Market Data - BBCA"
curl -s -X GET "${BASE_URL}/stock-analysis/market-data/BBCA" | jq '.symbol, .closePrice, .indicators.rsi'

echo -e "\n3. TradingView Config"
curl -s -X GET "${BASE_URL}/stock-analysis/tradingview/BBCA" | jq '.symbol, .indicators'

echo -e "\n4. Auto Recommendation"
curl -s -X POST "${BASE_URL}/stock-analysis/recommendation/auto" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BBCA",
    "liquiditySweep": "BULLISH",
    "bidOfferImbalance": 0.25,
    "foreignFlowBillion": 15.5,
    "brokerNetBuyTop3Billion": 8.3
  }' | jq '.recommendation.scoring.mlSignal, .recommendation.scoring.confidence'

echo -e "\nAll tests completed!"
```

### 2. Performance & Load Testing

```bash
# Test dengan ab (Apache Bench)
ab -n 100 -c 10 "http://localhost:3000/stockpilot/"

# Test recommendation endpoint dengan siege
siege -r 10 -c 5 \
  -d 100 \
  -f /tmp/api_urls.txt \
  -b
```

### 3. Monitor Response Times

```bash
# Using curl dengan time metrics
curl -w "
  Total time: %{time_total}s
  Connect: %{time_connect}s
  StarTransfer: %{time_starttransfer}s
  Download: %{time_total}s - %{time_starttransfer}s = %{time_total/1000 - time_starttransfer/1000}s
  \n" \
  -o /dev/null -s \
  -X POST "${BASE_URL}/stock-analysis/recommendation/auto" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BBCA",
    "liquiditySweep": "BULLISH",
    "bidOfferImbalance": 0.25,
    "foreignFlowBillion": 15.5,
    "brokerNetBuyTop3Billion": 8.3
  }'
```

---

## Error Handling Examples

### Validation Error

```bash
curl -X POST "${BASE_URL}/stock-analysis/recommendation" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "",
    "closePrice": 5750.5
  }'
```

### Response

```json
{
  "statusCode": 400,
  "message": "symbol should not be empty",
  "error": "Bad Request"
}
```

### Insufficient Data Error

```bash
curl -X GET "${BASE_URL}/stock-analysis/market-data/NEWSTOCK"
```

### Response

```json
{
  "statusCode": 400,
  "message": "Data historis NEWSTOCK.JK belum cukup untuk menghitung indikator.",
  "error": "Bad Request"
}
```

---

## Notes

- Semua response dibungkus dengan GlobalResponseInterceptor
- Error ditangani oleh GlobalHttpExceptionFilter
- Validasi input menggunakan class-validator (DTOs)
- CORS sudah dikonfigurasi untuk development
- Rate limiting dapat dikonfigurasi di `app.module.ts` jika diperlukan
