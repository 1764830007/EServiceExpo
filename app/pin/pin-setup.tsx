import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/AuthService';
import { PinCode, PinCodeT } from './index';

const Screen = () => {
  const [pin, setPin] = useState<string | undefined>(undefined);
  const [pinMode, setPinMode] = useState(PinCodeT.Modes.Set);
  const [pinVisible, setPinVisible] = useState(true);
  const router = useRouter();
  const { login } = useAuth();

  const handlePinSet = async (newPin: string) => {
    try {
      // Store the PIN in AsyncStorage
      await AsyncStorage.setItem('userPIN', newPin);
      await AsyncStorage.setItem('pinVerified', 'true');
      await AsyncStorage.setItem('lastPinVerification', new Date().toISOString());
      
      setPin(newPin);
      setPinVisible(false);
      
      // Process login after successful PIN setup
      await processLoginAfterPinSetup();
      
    } catch (error) {
      console.error('Error saving PIN:', error);
      Alert.alert('Error', 'Failed to set PIN. Please try again.');
    }
  };

  const processLoginAfterPinSetup = async () => {
    try {
      console.log('[Navigation] PIN setup successful, processing login');
      
      // Get the pending login info stored by WebViewLogin
      const pendingLoginInfo = await AsyncStorage.getItem('pendingLoginInfo');
      if (pendingLoginInfo) {
        const callBackInfo = JSON.parse(pendingLoginInfo);
        console.log('[Login] Processing stored callback info:', callBackInfo);
        
        // Handle the login after PIN is successfully set
        await authService.login(callBackInfo);
        console.log('[Login] AuthService.login completed successfully');
        
        // Set the login state in AuthContext
        await login();
        console.log('[Login] AuthContext.login completed successfully');
        
        // Verify token storage
        const storedToken = await AsyncStorage.getItem('authToken');
        console.log('[Storage] Token stored successfully:', storedToken ? 'Yes' : 'No');
        
        // Verify refresh token storage
        const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
        console.log('[Storage] Refresh token stored:', storedRefreshToken ? 'Yes' : 'No');
        
        // Clean up the pending login info
        await AsyncStorage.removeItem('pendingLoginInfo');
        console.log('[Cleanup] Pending login info removed');
        
        console.log('[Navigation] Login successful, navigating to main app');
      } else {
        console.log('[Navigation] No pending login info, just navigating to main app');
      }
      
      // Show success message and navigate
      Alert.alert('Success', 'PIN has been set successfully!', [
        {
          text: 'OK',
          onPress: () => {
            console.log('[Navigation] User pressed OK, navigating to tabs');
            // Add a small delay to ensure all async operations complete
            setTimeout(() => {
              router.replace('/(tabs)');
            }, 100);
          }
        }
      ]);
      
    } catch (error) {
      console.error('[Error] Login error after PIN setup:', error);
      
      // Check what specific error occurred
      if (error instanceof Error) {
        console.error('[Error] Error message:', error.message);
        console.error('[Error] Error stack:', error.stack);
      }
      
      Alert.alert('Error', 'PIN was set but login failed. Please try logging in again.', [
        {
          text: 'OK',
          onPress: async () => {
            // Clean up the pending login info even on error
            await AsyncStorage.removeItem('pendingLoginInfo');
            router.replace('/User/login');
          }
        }
      ]);
    }
  };

  const handlePinSetCancel = () => {
    setPinVisible(false);
    // Navigate back to login if user cancels PIN setup
    router.replace('/User/login');
  };

  const handlePinReset = () => {
    setPin(undefined);
    setPinMode(PinCodeT.Modes.Set);
  };

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <PinCode 
        pin={pin} 
        mode={pinMode} 
        visible={pinVisible} 
        styles={{ 
          main: { ...StyleSheet.absoluteFillObject, zIndex: 99 }
        }}
        onSet={handlePinSet}
        onSetCancel={handlePinSetCancel}
        onReset={handlePinReset}
        onEnter={(enteredPin: string) => {
          console.log('Pin entered:', enteredPin);
          setPinVisible(false);
        }}
      />
    </View>
  );
};

export default Screen;