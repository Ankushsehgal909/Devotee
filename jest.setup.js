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

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  return new Proxy(
    {},
    {
      get: (_, prop) => {
        return (props) => React.createElement(View, { testID: String(prop), ...props });
      },
    }
  );
});
