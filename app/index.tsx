import React from 'react';
import { ActivityIndicator, View } from 'react-native';

// This is the root index page that shows briefly before route protection takes over
// It only shows a loading spinner to prevent any content flash
export default function Index() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}