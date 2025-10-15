// app/pin-setup.tsx
import { useAuth } from '@/app/contexts/AuthContext';
import authService from '@/app/services/AuthService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from 'react-native-paper';

export default function PINSetup() {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleFirstPIN = () => {
    if (pin.length !== 4) {
      Alert.alert('Error', 'PIN must be exactly 4 digits');
      return;
    }
    setStep('confirm');
  };

  const handleConfirmPIN = async () => {
    if (confirmPin !== pin) {
      Alert.alert('Error', 'PINs do not match. Please try again.', [
        {
          text: 'OK',
          onPress: () => {
            setPin('');
            setConfirmPin('');
            setStep('enter');
          }
        }
      ]);
      return;
    }

    setLoading(true);
    try {
      // Store the PIN
      await AsyncStorage.setItem('userPIN', pin);
      await AsyncStorage.setItem('pinVerified', 'true');
      await AsyncStorage.setItem('lastPinVerification', new Date().toISOString());
      
      Alert.alert('Success', 'PIN has been set successfully!', [
        {
          text: 'OK',
          onPress: async () => {
            try {
              console.log('[Navigation] PIN setup successful, processing login');
              
              // Get the pending login info stored by WebViewLogin
              const pendingLoginInfo = await AsyncStorage.getItem('pendingLoginInfo');
              if (pendingLoginInfo) {
                const callBackInfo = JSON.parse(pendingLoginInfo);
                console.log('[Login] Processing stored callback info');
                
                // Handle the login after PIN is successfully set
                await authService.login(callBackInfo);
                
                // Set the login state in AuthContext
                await login();
                
                // Verify token storage
                const storedToken = await AsyncStorage.getItem('authToken');
                console.log('[Storage] Token stored successfully:', storedToken ? 'Yes' : 'No');
                
                // Verify refresh token storage
                const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
                console.log('[Storage] Refresh token stored:', storedRefreshToken ? 'Yes' : 'No');
                
                // Clean up the pending login info
                await AsyncStorage.removeItem('pendingLoginInfo');
                
                console.log('[Navigation] Login successful, navigating to main app');
              } else {
                console.log('[Navigation] No pending login info, just navigating to main app');
              }
              
              router.replace('/(tabs)');
            } catch (error) {
              console.error('[Error] Login error after PIN setup:', error);
              Alert.alert('Error', 'PIN was set but login failed. Please try logging in again.');
              // Clean up the pending login info even on error
              await AsyncStorage.removeItem('pendingLoginInfo');
              router.replace('/User/login');
            }
          }
        }
      ]);
    } catch (error) {
      console.error('Error setting PIN:', error);
      Alert.alert('Error', 'Failed to set PIN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'confirm') {
      setConfirmPin('');
      setStep('enter');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {step === 'enter' ? 'Set Up Your PIN' : 'Confirm Your PIN'}
      </Text>
      <Text style={styles.subtitle}>
        {step === 'enter' 
          ? 'Create a 4-digit PIN to secure your app' 
          : 'Please enter your PIN again to confirm'
        }
      </Text>

      <TextInput
        style={styles.input}
        value={step === 'enter' ? pin : confirmPin}
        onChangeText={step === 'enter' ? setPin : setConfirmPin}
        keyboardType="number-pad"
        maxLength={4}
        secureTextEntry
        placeholder="Enter 4-digit PIN"
        autoFocus
      />

      <Button
        mode="contained"
        onPress={step === 'enter' ? handleFirstPIN : handleConfirmPIN}
        disabled={
          (step === 'enter' && pin.length !== 4) || 
          (step === 'confirm' && confirmPin.length !== 4) ||
          loading
        }
        loading={loading}
        style={styles.button}
      >
        {loading ? 'Setting up...' : step === 'enter' ? 'Continue' : 'Set PIN'}
      </Button>

      {step === 'confirm' && (
        <Button
          mode="text"
          onPress={handleBack}
          style={styles.backButton}
        >
          Back
        </Button>
      )}

      <Text style={styles.note}>
        Note: You'll need to enter this PIN every time you open the app
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  input: {
    height: 60,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 24,
    textAlign: 'center',
    backgroundColor: 'white',
    letterSpacing: 10,
  },
  button: {
    marginTop: 10,
    paddingVertical: 8,
  },
  backButton: {
    marginTop: 10,
  },
  note: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 30,
    color: '#888',
    fontStyle: 'italic',
  },
});