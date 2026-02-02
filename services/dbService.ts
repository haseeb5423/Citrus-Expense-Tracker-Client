
import { Transaction, Account, UserProfile } from '../types';

// Simulated latency to make it feel like a real backend
const sleep = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export class VirtualBackend {
  private static USERS_KEY = 'citrus_db_users';
  private static DATA_PREFIX = 'citrus_data_';

  // Auth Methods
  static async signup(email: string, name: string, password: string): Promise<UserProfile> {
    await sleep(800);
    const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
    if (users.find((u: any) => u.email === email)) {
      throw new Error('User already exists with this email.');
    }

    const newUser: UserProfile = {
      id: `u-${Date.now()}`,
      email,
      name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      joinedAt: new Date().toISOString()
    };

    users.push({ ...newUser, password }); // In real world, password would be hashed
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    
    // Initialize empty data for new user
    this.saveUserData(newUser.id, { accounts: [], transactions: [] });
    
    return newUser;
  }

  static async login(email: string, password: string): Promise<UserProfile> {
    await sleep(600);
    const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const { password: _, ...profile } = user;
    return profile;
  }

  // Data Methods
  static getUserData(userId: string) {
    const data = localStorage.getItem(`${this.DATA_PREFIX}${userId}`);
    return data ? JSON.parse(data) : { accounts: [], transactions: [] };
  }

  static saveUserData(userId: string, data: { accounts: Account[], transactions: Transaction[] }) {
    localStorage.setItem(`${this.DATA_PREFIX}${userId}`, JSON.stringify(data));
  }
}
