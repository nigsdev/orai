/**
 * Mock implementation of @react-native-async-storage/async-storage for web
 * This provides a localStorage-based implementation for web environments
 */

class AsyncStorageMock {
  constructor() {
    this.storage = typeof window !== 'undefined' ? window.localStorage : {};
  }

  async getItem(key) {
    try {
      const item = this.storage.getItem(key);
      return item;
    } catch (error) {
      console.warn('AsyncStorage getItem error:', error);
      return null;
    }
  }

  async setItem(key, value) {
    try {
      this.storage.setItem(key, value);
    } catch (error) {
      console.warn('AsyncStorage setItem error:', error);
    }
  }

  async removeItem(key) {
    try {
      this.storage.removeItem(key);
    } catch (error) {
      console.warn('AsyncStorage removeItem error:', error);
    }
  }

  async clear() {
    try {
      this.storage.clear();
    } catch (error) {
      console.warn('AsyncStorage clear error:', error);
    }
  }

  async getAllKeys() {
    try {
      return Object.keys(this.storage);
    } catch (error) {
      console.warn('AsyncStorage getAllKeys error:', error);
      return [];
    }
  }

  async multiGet(keys) {
    try {
      return keys.map(key => [key, this.storage.getItem(key)]);
    } catch (error) {
      console.warn('AsyncStorage multiGet error:', error);
      return [];
    }
  }

  async multiSet(keyValuePairs) {
    try {
      keyValuePairs.forEach(([key, value]) => {
        this.storage.setItem(key, value);
      });
    } catch (error) {
      console.warn('AsyncStorage multiSet error:', error);
    }
  }

  async multiRemove(keys) {
    try {
      keys.forEach(key => {
        this.storage.removeItem(key);
      });
    } catch (error) {
      console.warn('AsyncStorage multiRemove error:', error);
    }
  }
}

// Create a singleton instance
const asyncStorage = new AsyncStorageMock();

// Export the default instance and named exports
module.exports = asyncStorage;
module.exports.default = asyncStorage;
module.exports.AsyncStorage = AsyncStorageMock;
