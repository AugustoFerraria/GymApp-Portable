// src/components/ProgressChart.js

import React from 'react';
import { View, Text as RNText, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Text as SvgText } from 'react-native-svg';

const screenWidth = Dimensions.get('window').width - 40;
const chartHeight = 300;

export default function ProgressChart({ data, viewMode }) {
  // Filtrar sólo valores numéricos válidos
  const filtered = data.filter(entry => {
    const v = viewMode === 'Peso' ? entry.weight : entry.reps;
    return typeof v === 'number' && !isNaN(v);
  });
  if (!filtered.length) {
    return <RNText style={styles.empty}>No hay datos disponibles</RNText>;
  }

  const labels = filtered.map(item => {
    const d = new Date(item.date);
    return !isNaN(d) ? d.toLocaleDateString() : '–';
  });
  const values = filtered.map(item =>
    viewMode === 'Peso' ? item.weight : item.reps
  );

  const getPointColors = (index) => {
    const isFailure = Boolean(filtered[index]?.failure);

    return {
      fill: isFailure ? '#FF3B30' : '#FFF200',
      stroke: isFailure ? '#B91C1C' : '#FFD700',
      text: isFailure ? '#FF3B30' : '#FFF200',
    };
  };

  return (
    <View style={styles.container}>
      <LineChart
        data={{ labels, datasets: [{ data: values }] }}
        width={screenWidth}
        height={chartHeight}
        yAxisSuffix={viewMode === 'Peso' ? 'kg' : ''}
        yAxisInterval={1}
        fromZero
        segments={4}
        withInnerLines
        withDots
        withShadow
        chartConfig={{
          backgroundColor: '#B0B0B0',
          backgroundGradientFrom: 'rgba(70, 77, 79, 0.6)',
          backgroundGradientTo: 'rgba(0, 0, 0, 0.6)',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(243,243,25,${opacity})`,
          labelColor: (opacity = 1) => `rgba(243,243,25,${opacity})`,
          style: { borderRadius: 16 },
          propsForBackgroundLines: {
            strokeDasharray: [6, 4],
            stroke: 'rgba(243,243,25,0.3)',
          },
          fillShadowGradient: 'rgba(243,243,25,0.2)',
          fillShadowGradientOpacity: 1,
        }}
        style={styles.chart}
        bezier
        getDotColor={(_, index) => getPointColors(index).fill}
        getDotProps={(_, index) => ({
          r: '6',
          strokeWidth: '2',
          stroke: getPointColors(index).stroke,
        })}
        renderDotContent={({ x, y, index, indexData }) => (
          <SvgText
            key={`dot-label-${index}`}
            x={x}
            y={y + 22}
            fill={getPointColors(index).text}
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
          >
            {indexData}
          </SvgText>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
    paddingVertical: 10,
  },
  empty: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 16,
  },
});