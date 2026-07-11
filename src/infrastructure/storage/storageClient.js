import AsyncStorage from '@react-native-async-storage/async-storage';


const storageClient = {
  getItem(key) {
    return AsyncStorage.getItem(key);
  },
  setItem(key, value) {
    return AsyncStorage.setItem(key, value);
  },
};

export default storageClient;