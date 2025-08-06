// components/GameScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { Appbar, FAB, Portal, Dialog, Button, Card } from 'react-native-paper';
import * as Haptics from 'expo-haptics';

interface GameScreenProps {
  locationPermission: boolean;
  onDisconnect: () => void;
}

interface Treasure {
  id: string;
  latitude: number;
  longitude: number;
  reward: number;
  discovered: boolean;
  type: 'common' | 'rare' | 'legendary';
}

const GameScreen: React.FC<GameScreenProps> = ({ locationPermission, onDisconnect }) => {
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [treasures, setTreasures] = useState<Treasure[]>([]);
  const [totalRewards, setTotalRewards] = useState(0);
  const [showRewardDialog, setShowRewardDialog] = useState(false);
  const [currentReward, setCurrentReward] = useState(0);
  const [mapRegion, setMapRegion] = useState({
    latitude: 6.5244, // Lagos, Nigeria default
    longitude: 3.3792,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  useEffect(() => {
    console.log('🎮 GameScreen mounted, location permission:', locationPermission);
    if (locationPermission) {
      getCurrentLocation();
      generateNearbyTreasures();
    }
  }, [locationPermission]);

  const getCurrentLocation = async () => {
    try {
      console.log('📍 Getting current location...');
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      console.log('✅ Location received:', location.coords);
      setUserLocation(location);
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      console.error('❌ Error getting location:', error);
      Alert.alert('Location Error', 'Could not get your location. Using default location.');
    }
  };

  const generateNearbyTreasures = () => {
    console.log('💎 Generating treasures...');
    const treasureList: Treasure[] = [];
    
    // Use current location or default
    const baseLat = userLocation?.coords.latitude || mapRegion.latitude;
    const baseLng = userLocation?.coords.longitude || mapRegion.longitude;
    
    for (let i = 0; i < 8; i++) {
      const lat = baseLat + (Math.random() - 0.5) * 0.02;
      const lng = baseLng + (Math.random() - 0.5) * 0.02;
      
      const treasureTypes: Array<'common' | 'rare' | 'legendary'> = ['common', 'common', 'rare', 'legendary'];
      const type = treasureTypes[Math.floor(Math.random() * treasureTypes.length)];
      
      let reward = 0.01; // Default common reward
      if (type === 'rare') reward = 0.05;
      if (type === 'legendary') reward = 0.1;

      treasureList.push({
        id: `treasure_${i}`,
        latitude: lat,
        longitude: lng,
        reward,
        discovered: false,
        type,
      });
    }
    setTreasures(treasureList);
    console.log(`✅ Generated ${treasureList.length} treasures`);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  const onTreasurePress = (treasure: Treasure) => {
    console.log('💎 Treasure pressed:', treasure.id, treasure.type);
    
    if (treasure.discovered) {
      Alert.alert('Already Found! ✅', 'You have already collected this treasure!');
      return;
    }

    if (!userLocation) {
      Alert.alert('Location Required 📍', 'Please enable location to collect treasures!');
      return;
    }

    const distance = calculateDistance(
      userLocation.coords.latitude,
      userLocation.coords.longitude,
      treasure.latitude,
      treasure.longitude
    );

    console.log(`📏 Distance to treasure: ${Math.round(distance)}m`);

    if (distance > 100) { // 100 meters range for testing
      Alert.alert(
        'Too Far Away! 🚶‍♂️', 
        `Get within 100 meters to collect this treasure.\n\nYou are ${Math.round(distance)}m away.`
      );
      return;
    }

    // Collect treasure
    collectTreasure(treasure);
  };

  const collectTreasure = (treasure: Treasure) => {
    console.log('🎉 Collecting treasure:', treasure.reward, 'SOL');
    
    // Haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    setCurrentReward(treasure.reward);
    setTotalRewards(prev => prev + treasure.reward);
    setShowRewardDialog(true);

    // Mark treasure as discovered
    setTreasures(prev => 
      prev.map(t => 
        t.id === treasure.id 
          ? { ...t, discovered: true }
          : t
      )
    );
  };

  const getTreasureColor = (type: string, discovered: boolean) => {
    if (discovered) return '#999';
    switch (type) {
      case 'common': return '#4CAF50';
      case 'rare': return '#FF9800';
      case 'legendary': return '#9C27B0';
      default: return '#4CAF50';
    }
  };

  const getTreasureEmoji = (type: string, discovered: boolean) => {
    if (discovered) return '✅';
    switch (type) {
      case 'common': return '💰';
      case 'rare': return '💎';
      case 'legendary': return '👑';
      default: return '💰';
    }
  };

  if (!locationPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>📍 Location Access Needed</Text>
        <Text style={styles.permissionText}>
          SolanaGo needs location access to show treasures around you!
        </Text>
        <Button mode="contained" onPress={getCurrentLocation} style={styles.permissionButton}>
          Grant Location Permission
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content 
          title="🗺️ SolanaGo" 
          subtitle={`💰 ${totalRewards.toFixed(3)} SOL earned`} 
          titleStyle={styles.headerTitle}
          subtitleStyle={styles.headerSubtitle}
        />
        <Appbar.Action icon="logout" onPress={onDisconnect} iconColor="#fff" />
      </Appbar.Header>

      <MapView
        style={styles.map}
        region={mapRegion}
        onRegionChangeComplete={setMapRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        mapType="standard"
      >
        {treasures.map((treasure) => (
          <Marker
            key={treasure.id}
            coordinate={{
              latitude: treasure.latitude,
              longitude: treasure.longitude,
            }}
            onPress={() => onTreasurePress(treasure)}
            opacity={treasure.discovered ? 0.6 : 1}
          >
            <View style={[
              styles.treasureMarker,
              { backgroundColor: getTreasureColor(treasure.type, treasure.discovered) }
            ]}>
              <Text style={styles.treasureEmoji}>
                {getTreasureEmoji(treasure.type, treasure.discovered)}
              </Text>
            </View>
          </Marker>
        ))}

        {userLocation && (
          <Circle
            center={{
              latitude: userLocation.coords.latitude,
              longitude: userLocation.coords.longitude,
            }}
            radius={100}
            fillColor="rgba(66, 165, 245, 0.1)"
            strokeColor="rgba(66, 165, 245, 0.5)"
            strokeWidth={2}
          />
        )}
      </MapView>

      <FAB
        style={styles.fab}
        icon="refresh"
        onPress={generateNearbyTreasures}
        label="New Treasures"
        color="#fff"
      />

      <Portal>
        <Dialog visible={showRewardDialog} onDismiss={() => setShowRewardDialog(false)}>
          <Dialog.Title style={styles.dialogTitle}>🎉 Treasure Found!</Dialog.Title>
          <Dialog.Content>
            <Card style={styles.rewardCard}>
              <Card.Content style={styles.rewardContent}>
                <Text style={styles.rewardText}>You earned</Text>
                <Text style={styles.rewardAmount}>{currentReward.toFixed(3)} SOL</Text>
                <Text style={styles.rewardSubtext}>Keep exploring for more treasures!</Text>
              </Card.Content>
            </Card>
          </Dialog.Content>
          <Dialog.Actions>
            <Button 
              onPress={() => setShowRewardDialog(false)}
              mode="contained"
              style={styles.continueButton}
            >
              Continue Hunting 🏃‍♂️
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#6200EE',
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  map: {
    flex: 1,
  },
  treasureMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  treasureEmoji: {
    fontSize: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200EE',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#6200EE',
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#4CAF50',
  },
  dialogTitle: {
    textAlign: 'center',
    fontSize: 20,
  },
  rewardCard: {
    backgroundColor: '#4CAF50',
  },
  rewardContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  rewardText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 5,
  },
  rewardAmount: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  rewardSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  continueButton: {
    backgroundColor: '#4CAF50',
  },
});

export default GameScreen