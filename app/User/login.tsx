import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    EmitterSubscription,
    Linking,
    Modal,
    NativeEventEmitter,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Button } from 'react-native-paper';
import { WebView, WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import { Consts } from '../../constants/config';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/AuthService';

/**
 * Event emitter for login-related events across components.
 * Emits:
 * - 'userChanged': when user login state changes
 * - 'loginFailed': when login encounters an error
 */
export const loginEvents = new NativeEventEmitter();

/**
 * CallBackInfo interface representing the response from SSO
 */
interface CallBackInfo {
    userLoginName: string;
    token: string;
    refreshToken: string;
    lastTokenTime: string;
    lastRefreshTokenTime: string;
}

/**
 * Login component that handles user authentication through a WebView-based login flow.
 * Features:
 * - External authentication via WebView
 * - Token parsing and storage
 * - PIN setup verification
 * - Error handling and display
 * - Automatic navigation after successful login
 * 
 * @returns {JSX.Element} The rendered Login component
 */
export default function Login() {
  const [emailOrPhone, setEmailOrPhone] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showWebView, setShowWebView] = useState<boolean>(false);
  const [webviewLoading, setWebviewLoading] = useState<boolean>(false);
  const [authUrl, setAuthUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const router = useRouter();
  const { login } = useAuth();
  const webViewRef = useRef<WebView>(null);

  // Handle cleanup of event listeners
  useEffect(() => {
    let subscription: EmitterSubscription | null = null;

    const setupListener = () => {
      subscription = loginEvents.addListener('loginFailed', (error: string) => {
        console.error('Login failed:', error);
        setLoading(false);
      });
    };

    setupListener();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  // Handle token received in URL
  const handleTokenFromUrl = useCallback(
    async (url: string) => {
      try {
        setError('');
        const parsed = new URL(url);
        const token = parsed.searchParams.get('token');
        const user = parsed.searchParams.get('user') || emailOrPhone;
        const errorMessage = parsed.searchParams.get('error');
        
        if (errorMessage) {
          setError(decodeURIComponent(errorMessage));
          return false;
        }
        
        if (!token) {
          setError('No token received from authentication server');
          return false;
        }

        // Create CallBackInfo from response
        const callBackInfo = {
          userLoginName: user,
          token,
          refreshToken: parsed.searchParams.get('refresh_token') || '',
          lastTokenTime: new Date().toISOString(),
          lastRefreshTokenTime: new Date().toISOString(),
        };

        try {
          await authService.login(callBackInfo);
          
          // Check if PIN is needed
          const pinStored = await AsyncStorage.getItem('userPIN');
          if (!pinStored) {
            router.push('/pin-setup');
            return true;
          }

          // Notify other components about user change
          loginEvents.emit('userChanged', true);

          // Close WebView and navigate
          setShowWebView(false);
          router.replace('/(tabs)');
          return true;
        } catch (loginError) {
          setError('Failed to save login credentials');
          console.error('Login service error:', loginError);
          return false;
        }
      } catch (err) {
        console.error('Failed to parse token url:', err);
        setError('Invalid response from authentication server');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [emailOrPhone, router],
  );

  // Handle login button press
  const handleLogin = useCallback(async () => {
    const baseLogin = Consts.Config.LoginUrl || `https://${Consts.Config.Host}/Login/GetB2CLogin?isFromMobile=true`;
    const AUTH_URL = `${baseLogin}&isDarkMode=true`;
    setLoading(true);
    setAuthUrl(AUTH_URL);
    setShowWebView(true);
  }, []);

  // Handle WebView messages
  const handleMessage = useCallback(async (event: WebViewMessageEvent) => {
    try {
      console.log('[Message] Received WebView message', event.nativeEvent);
      const data = JSON.parse(event.nativeEvent.data);
      console.log('[Message] Message type:', data.type);

      if (data.type === 'debug') {
        console.log('[Debug] WebView state:', data.value);
      }
      else if (data.type === 'action') {
        const action = data.value;
        console.log('[Action] Received action:', action);
        
        if (!action) {
          console.warn('[Action] No action received');
          return;
        }
        
        if (!action.endsWith('Close')) {
          console.log('[Action] Action does not end with Close, ignoring');
          return;
        }

        console.log('[Action] Valid close action received, fetching CallBackinfo');
        webViewRef.current?.injectJavaScript(`
          (function() {
            console.log('[WebView JS] Fetching CallBackinfo');
            const callBackinfo = window.CallBackinfo;
            console.log('[WebView JS] CallBackinfo =', callBackinfo);
            window.ReactNativeWebView.postMessage(JSON.stringify({ 
              type: 'callBackinfo', 
              value: callBackinfo 
            }));
            return true;
          })();
        `);
      } else if (data.type === 'callBackinfo' && data.value) {
        const callBackInfo = data.value;
        console.log('[CallBackInfo] Processing login data:', JSON.stringify(callBackInfo, null, 2));
        
        try {
          // Handle the login
          await authService.login(callBackInfo);
          
          // Verify token storage
          const storedToken = await AsyncStorage.getItem('authToken');
          console.log('[Storage] Token stored successfully:', storedToken ? 'Yes' : 'No');
          
          // Verify refresh token storage
          const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
          console.log('[Storage] Refresh token stored:', storedRefreshToken ? 'Yes' : 'No');
          
          console.log('[Navigation] Login successful, navigating to tabs');
          setShowWebView(false);
          router.replace('/(tabs)');
        } catch (error) {
          console.error('[Error] Login error:', error);
          setError('Failed to process login data');
        }
      }
    } catch (error) {
      console.error('[Error] Message handling error:', error);
      setError('Failed to process login response');
    }
  }, [router]);

  // Handle WebView navigation
  const onNavigationStateChange = useCallback((navState: WebViewNavigation) => {
    const url = navState?.url;
    if (!url) return true;
    console.log('[Navigation] Current URL:', url);

    if (url.includes(Consts.Config.CallbackUrl)) {
      console.log('[Navigation] Detected response-oidc URL');
      // Wait for a moment to ensure the page is fully loaded
      setTimeout(() => {
        if (webViewRef.current) {
          console.log('[WebView] Injecting JavaScript to check variables');
          webViewRef.current.injectJavaScript(`
            (function() {
              try {
                console.log('[WebView JS] Starting JavaScript execution');
                const message = { type: 'test', value: 'Testing message channel' };
                console.log('[WebView JS] Sending test message');
                window.ReactNativeWebView.postMessage(JSON.stringify(message));
                
                console.log('[WebView JS] Checking action variable');
                const action = window.action;
                console.log('[WebView JS] action =', action);
                console.log('[WebView JS] CallBackinfo =', window.CallBackinfo);
                console.log('[WebView JS] Document URL =', window.location.href);
                
                console.log('[WebView JS] Sending debug message');
                window.ReactNativeWebView.postMessage(JSON.stringify({ 
                  type: 'debug', 
                  value: { 
                    action: action,
                    hasCallBackinfo: window.CallBackinfo !== undefined,
                    url: window.location.href
                  }
                }));

                if (action) {
                  console.log('[WebView JS] Sending action message');
                  window.ReactNativeWebView.postMessage(JSON.stringify({ 
                    type: 'action', 
                    value: action 
                  }));
                }
                
                console.log('[WebView JS] JavaScript execution completed');
                return true;
              } catch (error) {
                console.error('[WebView JS] Error:', error);
                window.ReactNativeWebView.postMessage(JSON.stringify({ 
                  type: 'error', 
                  value: error.message 
                }));
                return true;
              }
            })();
          `);
        } else {
          console.warn('[WebView] WebView reference not available');
        }
      }, 1000); // Give the page 1 second to load completely
    }
    return true;
  }, []);

  // Handle WebView load requests
  const onShouldStartLoadWithRequest = useCallback((request: any) => {
    const { url, mainDocumentURL } = request;
    console.log('WebView navigating to:', url);
    if (url && url.includes('token=')) {
      handleTokenFromUrl(url);
      console.log('Token found in URL, handling token and stopping navigation.');
      return true;
    }

    if (url === authUrl) return true;
    
    if (url.includes(Consts.Config.CallbackUrl)) {
        console.log('Navigating to callback URL, allowing load.');
        return true;
    }

    if (Platform.OS === 'ios' && mainDocumentURL === null) {
      Linking.openURL(url);
      console.log('Opening URL in external browser:', url);
      return false;
    }

    if (url.startsWith(Consts.Config.LoginUrl)) {
        console.log('Navigating to login URL, allowing load.');
      return true;
    }

    console.log('Blocking navigation to:', url);
    return true;
  }, [authUrl, handleTokenFromUrl]);

  return (
    <View style={styles.container}>
      <Text style={styles.brandText}>A Caterpillar Brand</Text>

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
          loading={loading}
          disabled={loading}
        >
          {loading ? '登录中...' : '登录'}
        </Button>
      </View>

      <View style={styles.registerContainer}>
        <Text>Don't have an account? </Text>
        <Link href="/User/register" style={styles.registerLink}>Create Account</Link>
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

      <Modal visible={showWebView} animationType="slide" onRequestClose={() => setShowWebView(false)}>
        <View style={{ flex: 1 }}>
          <View style={styles.webviewHeader}>
            <TouchableOpacity onPress={() => setShowWebView(false)} style={styles.closeButton}>
              <Text style={{ color: 'white' }}>Close</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
            {webviewLoading && <ActivityIndicator color="#fff" style={{ marginRight: 12 }} />}
          </View>

          <WebView
            ref={webViewRef}
            source={{
              uri: authUrl ||
                Consts.Config.LoginUrl ||
                `https://${Consts.Config.Host}/Login/GetB2CLogin?isFromMobile=true}`,
            }}
            onNavigationStateChange={onNavigationStateChange}
            onMessage={handleMessage}
            onLoadStart={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.log('[WebView] Start loading:', nativeEvent.url);
              setWebviewLoading(true);
            }}
            onLoadEnd={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.log('[WebView] Finished loading:', nativeEvent.url);
              setWebviewLoading(false);
              
              // Test message channel
              if (webViewRef.current) {
                webViewRef.current.injectJavaScript(`
                  (function() {
                    console.log('[WebView Test] Testing message channel');
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'test',
                      value: 'Message channel test'
                    }));
                    return true;
                  })();
                `);
              }
            }}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('[WebView] Error:', nativeEvent);
            }}
            style={styles.webview}
            startInLoadingState
            javaScriptEnabled={true}
            domStorageEnabled={true}
            injectedJavaScript={`
              (function() {
                // Test if postMessage is available immediately
                console.log('[WebView Init] Testing message channel');
                if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'init',
                    value: 'WebView initialized'
                  }));
                } else {
                  console.error('[WebView Init] ReactNativeWebView.postMessage not available');
                }
                true;
              })();
            `}
            originWhitelist={['*']}
            onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
          />
        </View>
      </Modal>
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
  webview: {
    flex: 1,
  },
  webviewHeader: {
    height: 56,
    backgroundColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#666',
    borderRadius: 4,
  },
});