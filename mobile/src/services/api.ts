/**
 * API service with offline support
 */
import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { OfflineAction, Deck, Card } from '@/types';

const API_BASE_URL = __DEV__
  ? 'http://localhost:5000/api'
  : 'https://api.neuroflash.com/api';

class ApiService {
  private client: AxiosInstance;
  private offlineQueue: OfflineAction[] = [];
  private isOnline: boolean = true;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    this.loadOfflineQueue();
    this.setupNetworkListener();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          await AsyncStorage.removeItem('token');
        }
        return Promise.reject(error);
      }
    );
  }

  private setupNetworkListener() {
    NetInfo.addEventListener((state) => {
      this.isOnline = state.isConnected ?? false;
      if (this.isOnline) {
        this.processOfflineQueue();
      }
    });
  }

  private async loadOfflineQueue() {
    try {
      const queue = await AsyncStorage.getItem('offlineQueue');
      if (queue) {
        this.offlineQueue = JSON.parse(queue);
      }
    } catch (error) {
      console.error('Error loading offline queue:', error);
    }
  }

  private async saveOfflineQueue() {
    try {
      await AsyncStorage.setItem('offlineQueue', JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error('Error saving offline queue:', error);
    }
  }

  private async queueAction(action: OfflineAction) {
    this.offlineQueue.push(action);
    await this.saveOfflineQueue();
  }

  private async processOfflineQueue() {
    if (!this.isOnline || this.offlineQueue.length === 0) return;

    const actions = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const action of actions) {
      try {
        await this.executeAction(action);
      } catch (error) {
        // Re-queue if failed and retries < 3
        if (action.retries < 3) {
          action.retries += 1;
          this.offlineQueue.push(action);
        }
      }
    }

    await this.saveOfflineQueue();
  }

  private async executeAction(action: OfflineAction) {
    switch (action.type) {
      case 'review':
        return this.client.post('/study/review', action.payload);
      case 'create_card':
        return this.client.post(`/decks/${action.payload.deck_id}/cards`, action.payload);
      case 'update_card':
        return this.client.put(`/cards/${action.payload.id}`, action.payload);
      case 'delete_card':
        return this.client.delete(`/cards/${action.payload.id}`);
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  // Auth endpoints
  async login(username: string, password: string) {
    const response = await this.client.post('/auth/login', { username, password });
    if (response.data.access_token) {
      await AsyncStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  }

  async register(username: string, email: string, password: string) {
    const response = await this.client.post('/auth/register', {
      username,
      email,
      password,
    });
    if (response.data.access_token) {
      await AsyncStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  }

  async logout() {
    await AsyncStorage.removeItem('token');
  }

  async getCurrentUser() {
    return this.client.get('/auth/me').then((res) => res.data);
  }

  // Deck endpoints
  async getDecks() {
    return this.client.get('/decks').then((res) => res.data);
  }

  async getDeck(id: number) {
    return this.client.get(`/decks/${id}`).then((res) => res.data);
  }

  async createDeck(deck: Partial<Deck>) {
    return this.client.post('/decks', deck).then((res) => res.data);
  }

  // Card endpoints
  async getDeckCards(deckId: number) {
    return this.client.get(`/decks/${deckId}/cards`).then((res) => res.data);
  }

  async createCard(deckId: number, card: Partial<Card>) {
    if (!this.isOnline) {
      const action: OfflineAction = {
        id: Date.now().toString(),
        type: 'create_card',
        payload: { ...card, deck_id: deckId },
        timestamp: Date.now(),
        retries: 0,
      };
      await this.queueAction(action);
      throw new Error('Offline - Card will be created when online');
    }
    return this.client.post(`/decks/${deckId}/cards`, card).then((res) => res.data);
  }

  // Study endpoints
  async getStudyQueue(deckId?: number) {
    const params = deckId ? { deck_id: deckId } : {};
    return this.client.get('/study/queue', { params }).then((res) => res.data);
  }

  async submitReview(cardId: number, quality: number) {
    const payload = { card_id: cardId, quality };

    if (!this.isOnline) {
      const action: OfflineAction = {
        id: Date.now().toString(),
        type: 'review',
        payload,
        timestamp: Date.now(),
        retries: 0,
      };
      await this.queueAction(action);
      // Return optimistic response
      return { message: 'Review queued for sync', queued: true };
    }

    return this.client.post('/study/review', payload).then((res) => res.data);
  }

  async startSession(deckId: number) {
    return this.client.post('/study/session/start', { deck_id: deckId }).then((res) => res.data);
  }

  async endSession() {
    return this.client.post('/study/session/end').then((res) => res.data);
  }

  // Analytics endpoints
  async getOverview() {
    return this.client.get('/analytics/overview').then((res) => res.data);
  }

  async getStreak() {
    return this.client.get('/analytics/streak').then((res) => res.data);
  }
}

export const apiService = new ApiService();

