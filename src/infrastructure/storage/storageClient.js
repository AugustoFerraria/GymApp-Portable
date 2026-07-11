import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Adaptador único para la persistencia local.
 * Los features dependen de este contrato en lugar de acoplarse a AsyncStorage.
 */
const storageClient = {
  getItem(key) {
    return AsyncStorage.getItem(key);
  },
  setItem(key, value) {
    return AsyncStorage.setItem(key, value);
  },
};

export default storageClient;
