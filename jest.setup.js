// In-memory AsyncStorage mock
const mockStorageMap = new Map();

const mockAsyncStorage = {
  getItem: jest.fn((key) => Promise.resolve(mockStorageMap.get(key) || null)),
  setItem: jest.fn((key, val) => {
    mockStorageMap.set(key, String(val));
    return Promise.resolve();
  }),
  removeItem: jest.fn((key) => {
    mockStorageMap.delete(key);
    return Promise.resolve();
  }),
  clear: jest.fn(() => {
    mockStorageMap.clear();
    return Promise.resolve();
  }),
};

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: mockAsyncStorage,
  ...mockAsyncStorage,
}));

// Mock react-native-screens
jest.mock('react-native-screens', () => ({
  ...jest.requireActual('react-native-screens'),
  enableScreens: jest.fn(),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const actual = jest.requireActual('react-native-safe-area-context/lib/commonjs/jest/mock');
  return actual.default || actual;
});

// Mock react-native-vector-icons
const mockIcon = (name) => {
  const React = require('react');
  const { Text } = require('react-native');
  return ({ name: iconName, size, color, ...props }) =>
    React.createElement(Text, { testID: `${name}-${iconName}`, ...props }, iconName);
};

jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => mockIcon('MaterialCommunityIcons'));
jest.mock('react-native-vector-icons/MaterialIcons', () => mockIcon('MaterialIcons'));
jest.mock('react-native-vector-icons/Ionicons', () => mockIcon('Ionicons'));
jest.mock('react-native-vector-icons/Feather', () => mockIcon('Feather'));
