// components/WalletScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Button, Card, Title, Paragraph } from 'react-native-paper';

interface WalletScreenProps {
  onConnect: () => void;
}

const WalletScreen: React.FC<WalletScreenProps> = ({ onConnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    console.log('🔗 Attempting wallet connection...');
    setIsConnecting(true);
    
    try {
      // Simulate wallet connection for now
      setTimeout(() => {
        setIsConnecting(false);
        console.log('✅ Wallet connected successfully');
        Alert.alert(
          'Wallet Connected! 🎉',
          'Welcome to SolanaGo! Ready to hunt for treasures?',
          [
            {
              text: 'Start Playing! 🚀',
              onPress: onConnect,
            },
          ]
        );
      }, 2000);

      // TODO: Real wallet connection will go here
      /*
      import { transact } from '@solana-mobile/mobile-wallet-adapter';
      
      const result = await transact(async (wallet) => {
        const accounts = await wallet.authorize({
          cluster: 'devnet',
          identity: { name: 'SolanaGo' },
        });
        return accounts;
      });
      */
      
    } catch (error) {
      setIsConnecting(false);
      console.error('❌ Wallet connection error:', error);
      Alert.alert('Connection Failed', 'Please try again or install a Solana wallet.');
    }
  };

  const skipForDemo = () => {
    console.log('⏭️ Skipping wallet connection for demo');
    Alert.alert(
      'Demo Mode',
      'You\'re entering demo mode. Real rewards won\'t be earned.',
      [
        {
          text: 'Continue Demo',
          onPress: onConnect,
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>🗺️ SolanaGo</Text>
        <Text style={styles.subtitle}>Discover. Explore. Earn.</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Welcome, Treasure Hunter!</Title>
          <Paragraph style={styles.cardText}>
            Explore the real world to discover hidden treasures and earn SOL rewards. 
            Connect your Solana wallet to start your adventure!
          </Paragraph>
        </Card.Content>
      </Card>

      <View style={styles.features}>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>📍</Text>
          <Text style={styles.featureText}>Location-based treasures</Text>
        </View>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>💰</Text>
          <Text style={styles.featureText}>Real SOL rewards</Text>
        </View>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>🏆</Text>
          <Text style={styles.featureText}>Compete with friends</Text>
        </View>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>🎮</Text>
          <Text style={styles.featureText}>AR treasure hunting</Text>
        </View>
      </View>

      <Button
        mode="contained"
        onPress={connectWallet}
        loading={isConnecting}
        disabled={isConnecting}
        style={styles.connectButton}
        contentStyle={styles.connectButtonContent}
      >
        {isConnecting ? 'Connecting...' : 'Connect Solana Wallet'}
      </Button>

      <TouchableOpacity 
        style={styles.skipButton}
        onPress={skipForDemo}
      >
        <Text style={styles.skipButtonText}>Skip for Demo 🎮</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Built for Solana Mobile Hackathon 2024</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6200EE',
  },
  contentContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    elevation: 5,
    marginBottom: 30,
  },
  cardTitle: {
    color: '#333',
    fontSize: 22,
    fontWeight: 'bold',
  },
  cardText: {
    color: '#666',
    fontSize: 16,
    lineHeight: 24,
  },
  features: {
    marginBottom: 30,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  featureText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  connectButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    marginBottom: 15,
  },
  connectButtonContent: {
    paddingVertical: 8,
  },
  skipButton: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    marginBottom: 20,
  },
  skipButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
});

export default WalletScreen;