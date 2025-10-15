// app/pin-verify.tsx
import authService from '@/app/services/AuthService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from 'react-native-paper';

export default function PINVerify() {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const router = useRouter();

  const maxAttempts = 3;

  const handleVerifyPIN = async () => {
    if (pin.length !== 4) {
      Alert.alert('Error', 'Please enter a 4-digit PIN');
      return;
    }

    setLoading(true);
    
    try {
      const storedPIN = await AsyncStorage.getItem('userPIN');
      
      if (pin === storedPIN) {
        // PIN is correct, proceed to main app
        await AsyncStorage.setItem('pinVerified', 'true');
        await AsyncStorage.setItem('lastPinVerification', new Date().toISOString());
        router.replace('/(tabs)');
      } else {
        // PIN is incorrect
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= maxAttempts) {
          // Too many failed attempts, logout user
          Alert.alert(
            'Security Alert',
            'Too many failed PIN attempts. You will be logged out for security.',
            [
              {
                text: 'OK',
                onPress: async () => {
                  // Clear all auth data and return to login
                  await authService.logout();
                  router.replace('/User/login');
                }
              }
            ]
          );
        } else {
          Alert.alert(
            'Incorrect PIN',
            `Wrong PIN. You have ${maxAttempts - newAttempts} attempts remaining.`
          );
          setPin('');
        }
      }
    } catch (error) {
      console.error('PIN verification error:', error);
      Alert.alert('Error', 'Failed to verify PIN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Your PIN</Text>
      <Text style={styles.subtitle}>Please enter your 4-digit PIN to continue</Text>
      
      <TextInput
        style={styles.input}
        value={pin}
        onChangeText={setPin}
        keyboardType="number-pad"
        maxLength={4}
        secureTextEntry
        placeholder="Enter 4-digit PIN"
        autoFocus
      />
      
      {attempts > 0 && (
        <Text style={styles.attemptsText}>
          Failed attempts: {attempts}/{maxAttempts}
        </Text>
      )}
      
      <Button
        mode="contained"
        onPress={handleVerifyPIN}
        disabled={pin.length !== 4 || loading}
        loading={loading}
        style={styles.button}
      >
        {loading ? 'Verifying...' : 'Verify PIN'}
      </Button>
      
      <Button
        mode="text"
        onPress={() => {
          Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                  await authService.logout();
                  router.replace('/User/login');
                }
              }
            ]
          );
        }}
        style={styles.logoutButton}
      >
        Logout
      </Button>
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
  logoutButton: {
    marginTop: 20,
  },
  attemptsText: {
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
  },
});