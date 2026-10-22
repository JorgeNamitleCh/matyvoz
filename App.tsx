import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from './src/infrastructure/theme';
import { DialogProvider } from './src/presentation/providers/DialogProvider';
import { useAuth } from './src/presentation/hooks/useAuth';
import { useFamilyData } from './src/presentation/hooks/useFamilyData';
import { useSyncErrorDialog, useVoiceNoticeDialog } from './src/presentation/hooks/useSyncErrorDialog';
import { useDayClock } from './src/presentation/hooks/useDayClock';
import AppNavigator from './src/presentation/navigation/AppNavigator';

function AppWithAuth() {
  useAuth();
  useFamilyData();
  useSyncErrorDialog();
  useVoiceNoticeDialog();
  useDayClock();
  return <AppNavigator />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <DialogProvider>
          <AppWithAuth />
        </DialogProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
