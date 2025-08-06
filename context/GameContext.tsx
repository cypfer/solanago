// context/GameContext.tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface GameState {
  totalRewards: number;
  discoveredTreasures: string[];
  playerLevel: number;
  achievements: string[];
  isWalletConnected: boolean;
  playerStats: {
    totalDistance: number;
    treasuresFound: number;
    sessionsPlayed: number;
  };
}

type GameAction =
  | { type: 'ADD_REWARD'; payload: number }
  | { type: 'DISCOVER_TREASURE'; payload: string }
  | { type: 'LEVEL_UP' }
  | { type: 'ADD_ACHIEVEMENT'; payload: string }
  | { type: 'CONNECT_WALLET' }
  | { type: 'DISCONNECT_WALLET' }
  | { type: 'UPDATE_STATS'; payload: Partial<GameState['playerStats']> }
  | { type: 'RESET_GAME' };

const initialState: GameState = {
  totalRewards: 0,
  discoveredTreasures: [],
  playerLevel: 1,
  achievements: [],
  isWalletConnected: false,
  playerStats: {
    totalDistance: 0,
    treasuresFound: 0,
    sessionsPlayed: 0,
  },
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'ADD_REWARD':
      console.log('🎮 GameContext: Adding reward', action.payload);
      return {
        ...state,
        totalRewards: state.totalRewards + action.payload,
      };
    
    case 'DISCOVER_TREASURE':
      console.log('🎮 GameContext: Treasure discovered', action.payload);
      return {
        ...state,
        discoveredTreasures: [...state.discoveredTreasures, action.payload],
        playerStats: {
          ...state.playerStats,
          treasuresFound: state.playerStats.treasuresFound + 1,
        },
      };
    
    case 'LEVEL_UP':
      console.log('🎮 GameContext: Level up!', state.playerLevel + 1);
      return {
        ...state,
        playerLevel: state.playerLevel + 1,
      };
    
    case 'ADD_ACHIEVEMENT':
      console.log('🎮 GameContext: Achievement unlocked', action.payload);
      return {
        ...state,
        achievements: [...state.achievements, action.payload],
      };
    
    case 'CONNECT_WALLET':
      console.log('🎮 GameContext: Wallet connected');
      return {
        ...state,
        isWalletConnected: true,
      };
    
    case 'DISCONNECT_WALLET':
      console.log('🎮 GameContext: Wallet disconnected');
      return {
        ...state,
        isWalletConnected: false,
      };
    
    case 'UPDATE_STATS':
      console.log('🎮 GameContext: Stats updated', action.payload);
      return {
        ...state,
        playerStats: {
          ...state.playerStats,
          ...action.payload,
        },
      };
    
    case 'RESET_GAME':
      console.log('🎮 GameContext: Game reset');
      return initialState;
    
    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  addReward: (amount: number) => void;
  discoverTreasure: (treasureId: string) => void;
  levelUp: () => void;
  addAchievement: (achievement: string) => void;
  connectWallet: () => void;
  disconnectWallet: () => void;
  updateStats: (stats: Partial<GameState['playerStats']>) => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const addReward = (amount: number) => {
    dispatch({ type: 'ADD_REWARD', payload: amount });
    
    // Check for level up (every 0.1 SOL)
    const newTotal = state.totalRewards + amount;
    const newLevel = Math.floor(newTotal / 0.1) + 1;
    if (newLevel > state.playerLevel) {
      dispatch({ type: 'LEVEL_UP' });
      dispatch({ type: 'ADD_ACHIEVEMENT', payload: `Reached Level ${newLevel}` });
    }
  };

  const discoverTreasure = (treasureId: string) => {
    dispatch({ type: 'DISCOVER_TREASURE', payload: treasureId });
    
    // Check for achievements
    const newCount = state.discoveredTreasures.length + 1;
    if (newCount === 1) {
      dispatch({ type: 'ADD_ACHIEVEMENT', payload: 'First Treasure Hunter' });
    } else if (newCount === 5) {
      dispatch({ type: 'ADD_ACHIEVEMENT', payload: 'Treasure Seeker' });
    } else if (newCount === 10) {
      dispatch({ type: 'ADD_ACHIEVEMENT', payload: 'Treasure Master' });
    } else if (newCount === 25) {
      dispatch({ type: 'ADD_ACHIEVEMENT', payload: 'Legendary Explorer' });
    }
  };

  const levelUp = () => {
    dispatch({ type: 'LEVEL_UP' });
  };

  const addAchievement = (achievement: string) => {
    // Prevent duplicate achievements
    if (!state.achievements.includes(achievement)) {
      dispatch({ type: 'ADD_ACHIEVEMENT', payload: achievement });
    }
  };

  const connectWallet = () => {
    dispatch({ type: 'CONNECT_WALLET' });
    dispatch({ type: 'ADD_ACHIEVEMENT', payload: 'Wallet Connected' });
  };

  const disconnectWallet = () => {
    dispatch({ type: 'DISCONNECT_WALLET' });
  };

  const updateStats = (stats: Partial<GameState['playerStats']>) => {
    dispatch({ type: 'UPDATE_STATS', payload: stats });
  };

  const resetGame = () => {
    dispatch({ type: 'RESET_GAME' });
  };

  const value: GameContextType = {
    state,
    addReward,
    discoverTreasure,
    levelUp,
    addAchievement,
    connectWallet,
    disconnectWallet,
    updateStats,
    resetGame,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

// Helper functions for game logic
export const calculatePlayerRank = (totalRewards: number): string => {
  if (totalRewards >= 1.0) return '🏆 Treasure Legend';
  if (totalRewards >= 0.5) return '💎 Master Hunter';
  if (totalRewards >= 0.2) return '🗡️ Skilled Explorer';
  if (totalRewards >= 0.1) return '🎯 Treasure Seeker';
  if (totalRewards >= 0.05) return '🔰 Novice Hunter';
  return '🌱 Beginner';
};

export const getNextLevelRequirement = (currentLevel: number): number => {
  return currentLevel * 0.1;
};