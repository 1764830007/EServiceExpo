import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  NativeEventEmitter,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from 'react-native-paper';
import WebViewLogin from '../../components/login/WebViewLogin';
import { useLocalization } from '../../hooks/locales/LanguageContext';

/**
 * Event emitter for login-related events across components.
 * Emits:
 * - 'userChanged': when user login state changes
 * - 'loginFailed': when login encounters an error
 */
export const loginEvents = new NativeEventEmitter();

/**
 * Login component that handles user authentication through a WebView-based login flow.
 * 
 * @returns {JSX.Element} The rendered Login component
 */
export default function Login() {
  const [showWebView, setShowWebView] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const router = useRouter();
  const { t } = useLocalization();

  const handleLogin = () => {
    setShowWebView(true);
  };

  const handleLoginSuccess = () => {
    // Login success handled by WebView component
  };

  const handleLoginError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleWebViewClose = () => {
    setShowWebView(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.brandText}>{t('app.CaterpillarBrand')}</Text>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => setError('')} style={styles.dismissError}>
            <Text style={styles.dismissErrorText}>✕</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.inputContainer}>
        <Button
          onPress={handleLogin}
          mode="contained"
          style={styles.loginButton}
          buttonColor="orange"
        >
          {t('auth.Login')}
        </Button>
      </View>

      <View style={styles.registerContainer}>
        <Text>{t('auth.DontHaveAccount')} </Text>
        <Link href="/User/register" style={styles.registerLink}>{t('auth.CreateAccount')}</Link>
      </View>

      <Text style={styles.glaxText}>{t('auth.Or')}</Text>
      <Text style={styles.glaxText}>{t('auth.RecommendToUseWechat')}</Text>
      <Button
        mode="contained"
        style={styles.wechatButton}
        buttonColor="#07C160"
        onPress={() => console.log('微信登录')}
      >
        {t('auth.WeChatLogin')}
      </Button>

      <WebViewLogin
        visible={showWebView}
        onClose={handleWebViewClose}
        onLoginSuccess={handleLoginSuccess}
        onLoginError={handleLoginError}
      />
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
  errorContainer: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ef5350',
  },
  errorText: {
    color: '#c62828',
    flex: 1,
    fontSize: 14,
  },
  dismissError: {
    padding: 4,
  },
  dismissErrorText: {
    color: '#c62828',
    fontSize: 18,
    fontWeight: 'bold',
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
  registerLink: {
    color: '#007AFF',
    textDecorationLine: 'underline',
    marginLeft: 4,
  },
});