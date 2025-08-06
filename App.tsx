// App.tsx (Replace the default App.tsx in your root folder)
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import * as Location from 'expo-location';
import WalletScreen from './components/WalletScreen';
import GameScreen from './components/GameScreen';
import { GameProvider } from './context/GameContext';

export default function App() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<'wallet' | 'game'>('wallet');
  const [locationPermission, setLocationPermission] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Needed', 'Location permission is required to play SolanaGo!');
        return;
      }
      setLocationPermission(true);
      console.log('✅ Location permission granted');
    } catch (error) {
      console.error('Location permission error:', error);
    }
  };

  const handleWalletConnect = () => {
    console.log('🔗 Wallet connected, switching to game');
    setIsWalletConnected(true);
    setCurrentScreen('game');
  };

  const handleDisconnect = () => {
    console.log('🔌 Disconnecting wallet');
    setIsWalletConnected(false);
    setCurrentScreen('wallet');
  };

  return (
    <PaperProvider>
      <GameProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor="#6200EE" />
          
          {/* Debug info - remove later */}
          <View style={styles.debugInfo}>
            <Text style={styles.debugText}>
              Screen: {currentScreen} | Location: {locationPermission ? '✅' : '❌'} | Wallet: {isWalletConnected ? '🔗' : '❌'}
            </Text>
          </View>
          
          {currentScreen === 'wallet' ? (
            <WalletScreen onConnect={handleWalletConnect} />
          ) : (
            <GameScreen 
              locationPermission={locationPermission}
              onDisconnect={handleDisconnect}
            />
          )}
        </SafeAreaView>
      </GameProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6200EE',
  },
  debugInfo: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 5,
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    zIndex: 1000,
    borderRadius: 5,
  },
  debugText: {
    color: 'white',
    fontSize: 10,
    textAlign: 'center',
  },
});