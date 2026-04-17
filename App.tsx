/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import './global.css';

import React, { useState } from 'react';
import { Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StockAnalyzerScreen } from '@/screens/main/StockAnalyzerScreen';
import { MarketWatchlistScreen } from '@/screens/main/MarketWatchlistScreen';

type AppPage = 'analyzer' | 'watchlist';

function App() {
  const [page, setPage] = useState<AppPage>('analyzer');

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#051215" />
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'right', 'left']}>
          <View style={styles.menuBar}>
            <Pressable
              style={[
                styles.menuButton,
                page === 'analyzer' && styles.menuButtonActive,
              ]}
              onPress={() => setPage('analyzer')}
            >
              <Text
                style={[
                  styles.menuButtonText,
                  page === 'analyzer' && styles.menuButtonTextActive,
                ]}
              >
                Analyzer
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.menuButton,
                page === 'watchlist' && styles.menuButtonActive,
              ]}
              onPress={() => setPage('watchlist')}
            >
              <Text
                style={[
                  styles.menuButtonText,
                  page === 'watchlist' && styles.menuButtonTextActive,
                ]}
              >
                Watchlist
              </Text>
            </Pressable>
          </View>

          {page === 'analyzer' ? (
            <StockAnalyzerScreen />
          ) : (
            <MarketWatchlistScreen />
          )}
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  menuBar: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 8,
    backgroundColor: '#051215',
    borderBottomWidth: 1,
    borderBottomColor: '#15343f',
  },
  menuButton: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#245365',
    backgroundColor: '#0a202a',
    paddingVertical: 10,
    alignItems: 'center',
  },
  menuButtonActive: {
    borderColor: '#38bdf8',
    backgroundColor: '#124053',
  },
  menuButtonText: {
    color: '#b7dcea',
    fontWeight: '700',
    fontSize: 13,
  },
  menuButtonTextActive: {
    color: '#ecfeff',
  },
});

export default App;
