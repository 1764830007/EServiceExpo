import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

interface CallBackInfo {
  userLoginName: string;
  token: string;
  refreshToken: string;
  lastTokenTime: string;
  lastRefreshTokenTime: string;
  // add other fields from your CallBackinfo DTO
}

interface UserProfile {
  // add fields from your UserProfile model
}

class AuthService {
  private static instance: AuthService;
  private userProfile: UserProfile | null = null;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(callBackInfo: CallBackInfo): Promise<void> {
    try {
      // Store credentials
      await AsyncStorage.setItem('authToken', callBackInfo.token);
      await AsyncStorage.setItem('refreshToken', callBackInfo.refreshToken);
      await AsyncStorage.setItem('userLoginName', callBackInfo.userLoginName);
      await AsyncStorage.setItem('lastTokenTime', callBackInfo.lastTokenTime);
      await AsyncStorage.setItem('lastRefreshTokenTime', callBackInfo.lastRefreshTokenTime);

      // Initialize user profile and other services
      await this.initializeAfterLogin();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  private async initializeAfterLogin(): Promise<void> {
    try {
      // Update user permissions
      await this.updatePermissions();

      // Initialize theme (similar to your Xamarin code)
      if (Platform.OS === 'android') {
        // Implement theme reset if needed
        await this.resetTheme();
      }

      // Initialize locale/culture info
      await this.initializeCultureInfo();

      // Clear any old push notification bindings
      await this.logOutPushNotification();
    } catch (error) {
      console.error('Init after login error:', error);
    }
  }

  async updatePermissions(): Promise<void> {
    // Implement your permission update logic
  }

  async resetTheme(): Promise<void> {
    // Implement theme reset logic
  }

  async initializeCultureInfo(): Promise<void> {
    // Implement culture/locale initialization
  }

  async logOutPushNotification(): Promise<void> {
    // Implement push notification cleanup
  }
}

const authService = AuthService.getInstance();
export default authService;