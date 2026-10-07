import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { PROGRESS_PERIODS } from '../domain/progressDateRange';

const SHORT_LABELS = {
  all: 'All',
  year: '1A',
  sixMonths: '6M',
  twoMonths: '2M',
  month: '1M',
};

export default function ProgressPeriodSelector({ period, onSelect, rangeLabel, isDark, availablePeriods }) {
  const textColor = isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(17, 24, 39, 0.6)';
  const activeColor = isDark ? '#FFE477' : '#756000';
  const [barWidth, setBarWidth] = useState(0);
  const slide = useRef(new Animated.Value(0)).current;
  const previousWidth = useRef(0);
  const optionWidth = Math.max(0, (barWidth - 8) / PROGRESS_PERIODS.length);
  const selectedIndex = Math.max(0, PROGRESS_PERIODS.findIndex(option => option.value === period));

  useEffect(() => {
    if (!barWidth) return;
    const destination = selectedIndex * optionWidth;
    if (previousWidth.current !== barWidth) {
      slide.setValue(destination);
      previousWidth.current = barWidth;
      return;
    }
    const animation = Animated.spring(slide, {
      toValue: destination,
      damping: 24,
      stiffness: 250,
      mass: 0.8,
      useNativeDriver: true,
      isInteraction: false,
    });
    animation.start();
    return () => animation.stop();
  }, [barWidth, selectedIndex, optionWidth, slide]);

  return (
    <View style={styles.container}>
      <View
        onLayout={event => setBarWidth(event.nativeEvent.layout.width)}
        style={[
          styles.options,
          {
            backgroundColor: isDark ? 'rgba(8, 13, 18, 0.32)' : 'rgba(255, 255, 255, 0.5)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(17, 24, 39, 0.1)',
          },
        ]}
      >
        {barWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.indicator,
              {
                width: optionWidth,
                backgroundColor: isDark ? 'rgba(255, 215, 0, 0.18)' : 'rgba(255, 215, 0, 0.26)',
                borderColor: isDark ? 'rgba(255, 215, 0, 0.25)' : 'rgba(168, 139, 0, 0.2)',
                transform: [{ translateX: slide }],
              },
            ]}
          />
        )}
        {PROGRESS_PERIODS.map(option => {
          const selected = period === option.value;
          const disabled = availablePeriods?.[option.value] === false;
          return (
            <TouchableOpacity
              key={option.value}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              accessibilityState={{ selected, disabled }}
              accessibilityHint={disabled ? 'No hay registros en este período' : undefined}
              disabled={disabled}
              hitSlop={{ top: 4, bottom: 4 }}
              onPress={() => onSelect(option.value)}
              style={[styles.option, disabled && styles.disabledOption]}
            >
              <View style={[
                styles.optionContent,
                selected && styles.selectedOption,
              ]}>
                {option.value === 'custom' ? (
                  <Icon name="date-range" size={17} color={selected ? activeColor : textColor} />
                ) : (
                  <Text style={[styles.optionText, { color: selected ? activeColor : textColor }]}>
                    {SHORT_LABELS[option.value]}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      {period === 'custom' && rangeLabel && (
        <Text style={[styles.caption, { color: isDark ? '#9AA4B2' : '#6B7280' }]}>
          {rangeLabel}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignSelf: 'stretch', paddingHorizontal: 20, paddingTop: 2, paddingBottom: 10 },
  options: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 300,
    paddingHorizontal: 3,
    borderRadius: 22,
    borderWidth: 1,
  },
  indicator: {
    position: 'absolute',
    left: 3,
    top: 5,
    bottom: 5,
    borderRadius: 18,
    borderWidth: 1,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  optionContent: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
    marginHorizontal: 3,
    borderRadius: 18,
  },
  disabledOption: { opacity: 0.3 },
  selectedOption: {
    transform: [{ scale: 1.04 }],
  },
  optionText: { fontSize: 12, fontWeight: '600' },
  caption: { fontSize: 11, marginTop: 2, textAlign: 'center' },
});