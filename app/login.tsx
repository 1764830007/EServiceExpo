import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useRouter } from 'expo-router';

import React, { useState } from 'react';
import { Alert, EmitterSubscription, Linking, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { Consts } from '../constants/config';
import { useAuth } from './contexts/AuthContext';
export default function Login() {
  const [emailOrPhone, setEmailOrPhone] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const { login } = useAuth(); // 使用 AuthContext
  const handleLogin = async () => {
    // Open the external auth page in the browser. The external provider must
    // redirect back to the app using a deep link (see REDIRECT_URI) with a
    // token or code.
    const baseLogin = Consts.Config.LoginUrl || `https://${Consts.Config.Host}/Login/GetB2CLogin`;
    const AUTH_URL = `${baseLogin}?isFromMobile=true&hint=${encodeURIComponent(
      emailOrPhone
    )}&redirect_uri=myapp://auth-callback`;
    const REDIRECT_SCHEME = 'myapp://auth-callback';

    setLoading(true);

  // Handler for incoming deep links
  let subscription: EmitterSubscription | null = null;

    const handleUrl = async ({ url }: { url: string }) => {
      try {
        // Example redirect: myapp://auth-callback?token=abc123&user=john
        const parsed = new URL(url);
        const token = parsed.searchParams.get('token');
        const user = parsed.searchParams.get('user') || emailOrPhone;

        if (!token) {
          Alert.alert('登录失败', '未收到 token');
          return;
        }

        // Store token locally and call the app login method.
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('username', user);
        // AuthContext.login() in this project doesn't accept a token; it just
        // marks the user as logged in. Adapt if your context accepts tokens.
        await login();
        router.replace('/(tabs)');
      } catch (err) {
        console.error('Auth redirect handling failed', err);
        Alert.alert('错误', '处理回调时出错');
      } finally {
        setLoading(false);
        // Remove listener after handling
        if (subscription) {
          try {
            subscription.remove();
          } catch (e) {
            // ignore
          }
        }
      }
    };

    // Add listener and open URL
    try {
      // addEventListener returns a subscription with a `remove()` method.
      subscription = Linking.addEventListener('url', handleUrl as any);
      // If app was already opened via the redirect, check the initial URL
      const initial = await Linking.getInitialURL();
      if (initial && initial.startsWith(REDIRECT_SCHEME)) {
        await handleUrl({ url: initial });
        if (subscription) {
          try {
            subscription.remove();
          } catch (e) {}
          subscription = null;
        }
        return;
      }

      // Open external browser (will leave the app)
      const supported = await Linking.canOpenURL(AUTH_URL);
      if (supported) {
        await Linking.openURL(AUTH_URL);
      } else {
        Alert.alert('无法打开链接', AUTH_URL);
        setLoading(false);
      }
    } catch (err) {
      console.error('Failed to start external auth', err);
      Alert.alert('错误', '无法打开外部登录页面');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 品牌文本 */}
      <Text style={styles.brandText}>A Caterpillar Brand</Text>

      <View style={styles.inputContainer}>
        {/* 登录按钮 - 添加在输入框下方 */}
        <Button
          onPress={handleLogin}
          mode="contained"
          style={styles.loginButton}
          buttonColor="orange"
          loading={loading}
          disabled={loading}
        >
          {loading ? '登录中...' : '登录'}
        </Button>
      </View>

      <View style={styles.registerContainer}>
        <Text>Don't have an account?</Text>
        <Link href="/(tabs)/device">
        Go to About screen
      </Link>
      </View>

      <Text style={styles.glaxText}>Or</Text>
      <Text style={styles.glaxText}>RECOMMEND TO USE WECHAT TO LOGIN QUICKLY</Text>
      <Button
        mode="contained"
        style={styles.wechatButton}
        buttonColor="#07C160"
        onPress={() => console.log('微信登录')}
      >
        WECHAT LOGIN
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 250,
    backgroundColor: '#f5f5f5',
  },
  brandText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 50,
    color: '#333',
  },
  glaxText: {
    color: '#666',
    textAlign: 'center',
    padding: 20,
    fontSize: 14,
  },
  inputContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: 'white',
  },
  loginButton: {
    marginTop: 10,
    paddingVertical: 8,
  },
  wechatButton: {
    paddingVertical: 8,
    marginTop: 10,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    fontWeight: '700',
    color: 'blue',
    marginLeft: 5,
  },
});
