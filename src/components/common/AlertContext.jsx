import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  const [alert, setAlert] = useState(null);
  const scale = React.useRef(new Animated.Value(0.92)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  const show = useCallback(config => {
    setAlert(config);
    scale.setValue(0.92);
    opacity.setValue(0);
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        tension: 180,
        friction: 12,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const dismiss = useCallback(callback => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.92,
        tension: 180,
        friction: 12,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 140,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setAlert(null);
      callback?.();
    });
  }, []);

  return (
    <AlertContext.Provider value={{ show }}>
      {children}
      <Modal
        visible={!!alert}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => dismiss()}
      >
        <View style={s.overlay}>
          <Animated.View style={[s.box, { transform: [{ scale }], opacity }]}>
            {/* Title */}
            {alert?.title ? <Text style={s.title}>{alert.title}</Text> : null}

            {/* Message */}
            {alert?.message ? (
              <Text style={s.message}>{alert.message}</Text>
            ) : null}

            {/* Divider */}
            <View style={s.divider} />

            {/* Buttons */}
            <View style={s.btnRow}>
              {(alert?.buttons || [{ text: 'OK' }]).map((btn, i) => {
                const isDestructive = btn.style === 'destructive';
                const isCancel = btn.style === 'cancel';

                return (
                  <TouchableOpacity
                    key={i}
                    style={[
                      s.btn,
                      { flex: 1 },
                      isCancel && s.btnCancel,
                      isDestructive && s.btnDestructive,
                      !isDestructive && !isCancel && s.btnPrimary,
                    ]}
                    onPress={() => dismiss(btn.onPress)}
                    activeOpacity={0.82}
                  >
                    <Text
                      style={[
                        s.btnTxt,
                        isCancel && { color: colors.textSecondary },
                        isDestructive && { color: '#f87171' },
                        !isDestructive && !isCancel && { color: '#000' },
                      ]}
                    >
                      {btn.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlert must be used inside <AlertProvider>');

  const showAlert = useCallback(
    (titleOrConfig, message, buttons) => {
      if (typeof titleOrConfig === 'object' && titleOrConfig !== null) {
        ctx.show(titleOrConfig);
        return;
      }
      ctx.show({
        title: titleOrConfig,
        message,
        buttons: buttons || [{ text: 'OK' }],
      });
    },
    [ctx],
  );

  return { showAlert };
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  box: {
    width: '100%',
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 20,
  },
  title: {
    fontSize: typography.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs + 2,
  },
  message: {
    fontSize: typography.sm + 1,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.base,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginBottom: spacing.base,
  },
  btnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  btn: {
    paddingVertical: spacing.sm + 4,
    borderRadius: spacing.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  btnCancel: {
    backgroundColor: colors.bgInput,
    borderColor: colors.border,
  },
  btnDestructive: {
    backgroundColor: 'rgba(248,113,113,0.10)',
    borderColor: 'rgba(248,113,113,0.30)',
  },
  btnTxt: {
    fontSize: typography.sm + 1,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
