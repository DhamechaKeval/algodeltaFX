// src/components/common/GlobalLoadingOverlay.js
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useLoadingLock } from '../../context/LoadingLockContext';
import { colors } from '../../theme/colors';

export default function GlobalLoadingOverlay() {
  const { locked } = useLoadingLock();
  if (!locked) return null;

  return (
    <View style={s.overlay}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject, // covers entire screen
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
});
