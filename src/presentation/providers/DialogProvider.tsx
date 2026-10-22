import React, { createContext, useCallback, useContext, useState } from 'react';
import AppDialog, { DialogButton } from '../components/common/AppDialog';

interface DialogOptions {
  title: string;
  message?: string;
  /** Si se omite, se muestra un solo botón "Entendido". */
  buttons?: DialogButton[];
}

interface DialogContextValue {
  /** Reemplazo temático de Alert.alert — mismo espíritu (title, message, buttons[]). */
  showDialog: (options: DialogOptions) => void;
}

const DialogContext = createContext<DialogContextValue | undefined>(undefined);

interface DialogState extends DialogOptions {
  visible: boolean;
}

const INITIAL_STATE: DialogState = { visible: false, title: '' };

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DialogState>(INITIAL_STATE);

  const hide = useCallback(() => setState(prev => ({ ...prev, visible: false })), []);

  const showDialog = useCallback((options: DialogOptions) => {
    setState({ visible: true, ...options });
  }, []);

  const buttons: DialogButton[] =
    state.buttons && state.buttons.length > 0
      ? state.buttons.map(btn => ({
          ...btn,
          onPress: () => {
            hide();
            btn.onPress?.();
          },
        }))
      : [{ text: 'Entendido', onPress: hide }];

  return (
    <DialogContext.Provider value={{ showDialog }}>
      {children}
      <AppDialog
        visible={state.visible}
        title={state.title}
        message={state.message}
        buttons={buttons}
        onRequestClose={hide}
      />
    </DialogContext.Provider>
  );
}

export function useDialog(): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error('useDialog debe usarse dentro de un <DialogProvider>');
  }
  return ctx;
}
