class CacheService {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutos por defecto
  }

  // Obtener datos del cache
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expires) {
      this.delete(key);
      return null;
    }

    return item.data;
  }

  // Guardar datos en el cache
  set(key, data, ttl = this.defaultTTL) {
    // Limpiar timer anterior si existe
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    const expires = Date.now() + ttl;
    this.cache.set(key, { data, expires });

    // Configurar auto-eliminación
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl);
    
    this.timers.set(key, timer);
  }

  // Eliminar entrada del cache
  delete(key) {
    this.cache.delete(key);
    
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
  }

  // Limpiar todo el cache
  clear() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.cache.clear();
    this.timers.clear();
  }

  // Obtener estadísticas del cache
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      memory: JSON.stringify(Array.from(this.cache.entries())).length
    };
  }

  // Cache con función fallback
  async getOrSet(key, fetchFunction, ttl = this.defaultTTL) {
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    try {
      const data = await fetchFunction();
      this.set(key, data, ttl);
      return data;
    } catch (error) {
      console.error(`Error fetching data for cache key "${key}":`, error);
      throw error;
    }
  }

  // Invalidar cache por patrón
  invalidatePattern(pattern) {
    const regex = new RegExp(pattern);
    const keysToDelete = Array.from(this.cache.keys()).filter(key => regex.test(key));
    keysToDelete.forEach(key => this.delete(key));
    return keysToDelete.length;
  }

  // Pre-cargar datos en cache
  async preload(entries) {
    const promises = entries.map(async ({ key, fetchFunction, ttl }) => {
      try {
        const data = await fetchFunction();
        this.set(key, data, ttl);
        return { key, success: true };
      } catch (error) {
        console.error(`Error preloading cache key "${key}":`, error);
        return { key, success: false, error };
      }
    });

    return Promise.allSettled(promises);
  }
}

// Instancia singleton
export const cacheService = new CacheService();

// Service Worker Cache API wrapper
class ServiceWorkerCache {
  constructor(cacheName = 'elije-ser-cache-v1') {
    this.cacheName = cacheName;
    this.isAvailable = 'caches' in window;
  }

  async get(request) {
    if (!this.isAvailable) return null;
    
    try {
      const cache = await caches.open(this.cacheName);
      return await cache.match(request);
    } catch (error) {
      console.error('Error getting from SW cache:', error);
      return null;
    }
  }

  async set(request, response) {
    if (!this.isAvailable) return false;
    
    try {
      const cache = await caches.open(this.cacheName);
      await cache.put(request, response.clone());
      return true;
    } catch (error) {
      console.error('Error setting SW cache:', error);
      return false;
    }
  }

  async delete(request) {
    if (!this.isAvailable) return false;
    
    try {
      const cache = await caches.open(this.cacheName);
      return await cache.delete(request);
    } catch (error) {
      console.error('Error deleting from SW cache:', error);
      return false;
    }
  }

  async clear() {
    if (!this.isAvailable) return false;
    
    try {
      return await caches.delete(this.cacheName);
    } catch (error) {
      console.error('Error clearing SW cache:', error);
      return false;
    }
  }
}

export const swCache = new ServiceWorkerCache();

// LocalStorage cache con compresión
class LocalStorageCache {
  constructor(prefix = 'elije-ser-') {
    this.prefix = prefix;
    this.isAvailable = this.checkAvailability();
  }

  checkAvailability() {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  get(key) {
    if (!this.isAvailable) return null;
    
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return null;

      const parsed = JSON.parse(item);
      if (Date.now() > parsed.expires) {
        this.delete(key);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.error('Error getting from localStorage cache:', error);
      return null;
    }
  }

  set(key, data, ttl = 24 * 60 * 60 * 1000) { // 24 horas por defecto
    if (!this.isAvailable) return false;
    
    try {
      const item = {
        data,
        expires: Date.now() + ttl,
        timestamp: Date.now()
      };

      localStorage.setItem(this.prefix + key, JSON.stringify(item));
      return true;
    } catch (error) {
      // Posible quota exceeded, limpiar cache viejo
      this.cleanup();
      try {
        localStorage.setItem(this.prefix + key, JSON.stringify(item));
        return true;
      } catch {
        console.error('Error setting localStorage cache:', error);
        return false;
      }
    }
  }

  delete(key) {
    if (!this.isAvailable) return false;
    
    try {
      localStorage.removeItem(this.prefix + key);
      return true;
    } catch (error) {
      console.error('Error deleting from localStorage cache:', error);
      return false;
    }
  }

  clear() {
    if (!this.isAvailable) return false;
    
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix));
      keys.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('Error clearing localStorage cache:', error);
      return false;
    }
  }

  cleanup() {
    if (!this.isAvailable) return;
    
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix));
      const now = Date.now();
      
      keys.forEach(key => {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          if (now > item.expires) {
            localStorage.removeItem(key);
          }
        } catch {
          // Item corrupto, eliminar
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error during cache cleanup:', error);
    }
  }

  getStats() {
    if (!this.isAvailable) return { available: false };
    
    const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix));
    const totalSize = keys.reduce((size, key) => {
      return size + (localStorage.getItem(key) || '').length;
    }, 0);

    return {
      available: true,
      count: keys.length,
      sizeBytes: totalSize,
      sizeKB: Math.round(totalSize / 1024),
      keys: keys.map(key => key.replace(this.prefix, ''))
    };
  }
}

export const localCache = new LocalStorageCache();

// Estrategia de cache híbrida
export class HybridCache {
  constructor() {
    this.memory = cacheService;
    this.local = localCache;
    this.sw = swCache;
  }

  async get(key, options = {}) {
    const { useMemory = true, useLocal = true, useSW = false } = options;

    // 1. Intentar memoria (más rápido)
    if (useMemory) {
      const memData = this.memory.get(key);
      if (memData !== null) return memData;
    }

    // 2. Intentar localStorage
    if (useLocal) {
      const localData = this.local.get(key);
      if (localData !== null) {
        // Repoblar memoria
        if (useMemory) this.memory.set(key, localData);
        return localData;
      }
    }

    // 3. Intentar Service Worker cache (para requests HTTP)
    if (useSW && typeof key === 'string' && key.startsWith('http')) {
      const swData = await this.sw.get(key);
      if (swData) {
        const data = await swData.json();
        // Repoblar caches superiores
        if (useLocal) this.local.set(key, data);
        if (useMemory) this.memory.set(key, data);
        return data;
      }
    }

    return null;
  }

  async set(key, data, options = {}) {
    const { 
      useMemory = true, 
      useLocal = true, 
      useSW = false,
      memoryTTL = 5 * 60 * 1000, // 5 minutos
      localTTL = 24 * 60 * 60 * 1000 // 24 horas
    } = options;

    const promises = [];

    if (useMemory) {
      this.memory.set(key, data, memoryTTL);
    }

    if (useLocal) {
      promises.push(this.local.set(key, data, localTTL));
    }

    if (useSW && typeof key === 'string' && key.startsWith('http')) {
      const response = new Response(JSON.stringify(data));
      promises.push(this.sw.set(key, response));
    }

    return Promise.all(promises);
  }

  async delete(key, options = {}) {
    const { useMemory = true, useLocal = true, useSW = false } = options;

    const promises = [];

    if (useMemory) {
      this.memory.delete(key);
    }

    if (useLocal) {
      promises.push(this.local.delete(key));
    }

    if (useSW && typeof key === 'string' && key.startsWith('http')) {
      promises.push(this.sw.delete(key));
    }

    return Promise.all(promises);
  }

  async clear() {
    const promises = [
      this.memory.clear(),
      this.local.clear(),
      this.sw.clear()
    ];

    return Promise.all(promises);
  }

  getStats() {
    return {
      memory: this.memory.getStats(),
      localStorage: this.local.getStats(),
      serviceWorker: { available: this.sw.isAvailable }
    };
  }
}

export const hybridCache = new HybridCache();
