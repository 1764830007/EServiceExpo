import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  EmitterSubscription,
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView, WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import { useAuth } from '../app/contexts/AuthContext';
import authService from '../app/services/AuthService';
import { loginEvents } from '../app/User/login';
import { Consts } from '../constants/config';

interface WebViewLoginProps {
  visible: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
  onLoginError?: (error: string) => void;
}

export default function WebViewLogin({ visible, onClose, onLoginSuccess, onLoginError }: WebViewLoginProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [webviewLoading, setWebviewLoading] = useState<boolean>(false);
  const [authUrl, setAuthUrl] = useState<string>('');
  const router = useRouter();
  const { login } = useAuth();
  const webViewRef = useRef<WebView>(null);

  // Handle cleanup of event listeners
  useEffect(() => {
    let subscription: EmitterSubscription | null = null;

    const setupListener = () => {
      subscription = loginEvents.addListener('loginFailed', (error: string) => {
        console.error('Login failed:', error);
        onLoginError?.(error);
        setLoading(false);
      });
    };

    setupListener();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [onLoginError]);

  // Handle token received in URL
  const handleTokenFromUrl = useCallback(
    async (url: string) => {
      try {
        const parsed = new URL(url);
        const token = parsed.searchParams.get('token');
        const user = parsed.searchParams.get('user') || '';
        const errorMessage = parsed.searchParams.get('error');
        
        if (errorMessage) {
          onLoginError?.(decodeURIComponent(errorMessage));
          return false;
        }
        
        if (!token) {
          onLoginError?.('No token received from authentication server');
          return false;
        }

        // Create CallBackInfo from response
        const callBackInfo = {
          UserLoginName: user,
          Token: token,
          RefreshToken: parsed.searchParams.get('refresh_token') || '',
          TokenExpiration: '3600',
          RefreshTokenExpiration: '2592000',
        };

        try {
          // Store auth data first
          await authService.login(callBackInfo);
          
          // Verify token storage
          const storedToken = await AsyncStorage.getItem('authToken');
          console.log('Token storage verification:', {
            tokenReceived: !!callBackInfo.Token,
            tokenStored: !!storedToken,
            tokenMatch: storedToken === callBackInfo.Token
          });
          
          if (!storedToken || storedToken !== callBackInfo.Token) {
            throw new Error('Token storage verification failed');
          }
          
          // Set the login state in AuthContext
          await login();
          
          // Check if PIN is needed
          const pinStored = await AsyncStorage.getItem('userPIN');
          if (!pinStored) {
            router.push('/pin-setup');
            return true;
          }

          // Notify other components about user change
          loginEvents.emit('userChanged', true);

          // Close WebView and notify success
          onClose();
          onLoginSuccess?.();
          return true;
        } catch (loginError) {
          onLoginError?.('Failed to save login credentials');
          console.error('Login service error:', loginError);
          return false;
        }
      } catch (err) {
        console.error('Failed to parse token url:', err);
        onLoginError?.('Invalid response from authentication server');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [router, login, onClose, onLoginSuccess, onLoginError],
  );

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
          
          // Set the login state in AuthContext
          await login();
          
          // Verify token storage
          const storedToken = await AsyncStorage.getItem('authToken');
          console.log('[Storage] Token stored successfully:', storedToken ? 'Yes' : 'No');
          
          // Verify refresh token storage
          const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
          console.log('[Storage] Refresh token stored:', storedRefreshToken ? 'Yes' : 'No');
          
          console.log('[Navigation] Login successful');
          onClose();
          onLoginSuccess?.();
        } catch (error) {
          console.error('[Error] Login error:', error);
          onLoginError?.('Failed to process login data');
        }
      }
    } catch (error) {
      console.error('[Error] Message handling error:', error);
      onLoginError?.('Failed to process login response');
    }
  }, [login, onClose, onLoginSuccess, onLoginError]);

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

  // Initialize the login URL when the WebView becomes visible
  React.useEffect(() => {
    if (visible) {
      const baseLogin = Consts.Config.LoginUrl || `https://${Consts.Config.Host}/Login/GetB2CLogin?isFromMobile=true`;
      const AUTH_URL = `${baseLogin}&isDarkMode=true`;
      setLoading(true);
      setAuthUrl(AUTH_URL);
    }
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.webviewHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
          <View style={styles.headerSpacer} />
          {webviewLoading && <ActivityIndicator color="#fff" style={styles.loading} />}
        </View>

        <WebView
          ref={webViewRef}
          source={{
            uri: authUrl ||
              Consts.Config.LoginUrl ||
              `https://${Consts.Config.Host}/Login/GetB2CLogin?isFromMobile=true`,
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
  );
}

const styles = StyleSheet.create({
  container: {
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
  closeButtonText: {
    color: 'white',
  },
  headerSpacer: {
    flex: 1,
  },
  loading: {
    marginRight: 12,
  },
  webview: {
    flex: 1,
  },
});