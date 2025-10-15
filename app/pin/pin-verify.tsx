import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import authService from '../services/AuthService';
import { PinCode, PinCodeT } from './index';

const Screen = () => {
  const [storedPin, setStoredPin] = useState<string | undefined>(undefined);
  const [pinMode, setPinMode] = useState(PinCodeT.Modes.Enter);
  const [pinVisible, setPinVisible] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const router = useRouter();

  const maxAttempts = 3;

  useEffect(() => {
    loadStoredPin();
  }, []);

  const loadStoredPin = async () => {
    try {
      const pin = await AsyncStorage.getItem('userPIN');
      setStoredPin(pin || undefined);
    } catch (error) {
      console.error('Error loading stored PIN:', error);
    }
  };

  const handlePinEnter = async (enteredPin: string) => {
    try {
      if (enteredPin === storedPin) {
        // PIN is correct
        await AsyncStorage.setItem('pinVerified', 'true');
        await AsyncStorage.setItem('lastPinVerification', new Date().toISOString());
        
        setPinVisible(false);
        // Navigate to main app
        router.replace('/(tabs)');
      } else {
        // PIN is incorrect
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= maxAttempts) {
          // Navigate back to login
          await authService.logout();
          router.replace('/User/login');
        } else {
          // Show error but allow retry
          console.log(`Incorrect PIN. Attempts: ${newAttempts}/${maxAttempts}`);
        }
      }
    } catch (error) {
      console.error('Error verifying PIN:', error);
    }
  };

  const handlePinReset = async () => {
    try {
      // Clear PIN and verification status
      await AsyncStorage.multiRemove([
        'userPIN',
        'pinVerified',
        'lastPinVerification'
      ]);
      
      // Navigate to PIN setup
      router.replace('/pin/pin-setup');
    } catch (error) {
      console.error('Error resetting PIN:', error);
    }
  };

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <PinCode 
        pin={storedPin} 
        mode={pinMode} 
        visible={pinVisible} 
        styles={{ 
          main: { ...StyleSheet.absoluteFillObject, zIndex: 99 }
        }}
        onEnter={handlePinEnter}
        onReset={handlePinReset}
        onSet={(newPin: string) => {
          console.log('Pin set:', newPin);
        }}
        onSetCancel={() => {
          router.replace('/User/login');
        }}
      />
    </View>
  );
};

export default Screen;