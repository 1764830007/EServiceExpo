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
import { useAuth } from '../../app/contexts/AuthContext';
import { loginEvents } from '../../app/User/login';
import { Consts } from '../../constants/config';

interface WebViewLoginProps {
  visible: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
  onLoginError?: (error: string) => void;
  initialUrl?: string; // Optional custom URL for registration flows
}

export default function WebViewLogin({ visible, onClose, onLoginSuccess, onLoginError, initialUrl }: WebViewLoginProps) {
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

  // Handle WebView messages
  const handleMessage = useCallback(async (event: WebViewMessageEvent) => {
    try {
      //console.log('[Message] Received WebView message', event.nativeEvent);
      const data = JSON.parse(event.nativeEvent.data);
      //console.log('[Message] Message type:', data.type);

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
          // Store the callback info temporarily for PIN setup to use
          await AsyncStorage.setItem('pendingLoginInfo', JSON.stringify(callBackInfo));
          
          console.log('[Navigation] Stored callback info, navigating to PIN setup');
          onClose();
          router.push('/pin/pin-setup');
        } catch (error) {
          console.error('[Error] Failed to store callback info:', error);
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
    //console.log('[Navigation] onShouldStartLoadWithRequest:', request);

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
  }, [authUrl]);

  // Initialize the login URL when the WebView becomes visible
  React.useEffect(() => {
    if (visible) {
      if (initialUrl) {
        // Use the provided initial URL (e.g., for registration flows)
        setLoading(true);
        setAuthUrl(initialUrl);
      } else {
        // Use the default login URL
        const baseLogin = Consts.Config.LoginUrl || `https://${Consts.Config.Host}/Login/GetB2CLogin?isFromMobile=true`;
        const AUTH_URL = `${baseLogin}&isDarkMode=true`;
        setLoading(true);
        setAuthUrl(AUTH_URL);
      }
    }
  }, [visible, initialUrl]);

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
            //console.log('[WebView] Start loading:', nativeEvent.url);
            setWebviewLoading(true);
          }}
          onLoadEnd={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            //console.log('[WebView] Finished loading:', nativeEvent.url);
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