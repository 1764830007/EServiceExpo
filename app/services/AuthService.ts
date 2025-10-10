import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

interface CallBackInfo {
  UserLoginName: string;
  Token: string;
  RefreshToken: string;
  TokenExpiration: string;
  RefreshTokenExpiration: string;
  // Additional properties from server response
  CWSID?: string;
  RedirectURL?: string | null;
  WorkOrderCreate?: boolean;
  WorkOrderAssign?: boolean;
  WorkOrderExecute?: boolean;
  WorkOrderView?: boolean;
  WarrantyCardManagement?: boolean;
  MenuEBook?: boolean;
  MenuMachineEBook?: boolean;
  MenuServiceManual?: boolean;
  EquipmentManage?: boolean;
  EquipmentUnbind?: boolean;
  EbookPDFDownLoad?: boolean;
  EquipmentBind?: boolean;
  EquipmentBindRequestList?: boolean;
  EquipmentEdit?: boolean;
  MenuServiceManualSearch?: boolean;
  UserType?: string;
  IsCNUser?: boolean;
  Email?: string | null;
  PhoneNumber?: string | null;
  HaveLoggedApp?: boolean;
  NeedActive?: boolean;
  IsVisitor?: boolean;
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
      await AsyncStorage.setItem('authToken', callBackInfo.Token);
      await AsyncStorage.setItem('refreshToken', callBackInfo.RefreshToken);
      await AsyncStorage.setItem('userLoginName', callBackInfo.UserLoginName);
      await AsyncStorage.setItem('tokenExpiration', callBackInfo.TokenExpiration);
      await AsyncStorage.setItem('refreshTokenExpiration', callBackInfo.RefreshTokenExpiration);

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