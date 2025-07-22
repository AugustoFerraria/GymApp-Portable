// src/components/ProgressChart.js

import React from 'react';
import { Dimensions, View, Text, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width - 32; // deja 16px de padding a cada lado

export default function ProgressChart({ data, viewMode }) {
  if (!data?.length) {
    return <Text style={styles.empty}>No hay datos disponibles</Text>;
  }

  // transformo fechas y valores según el modo
  const labels = data.map(item => {
    const d = new Date(item.date);
    return !isNaN(d) ? d.toLocaleDateString() : '–';
  });
  const values = data.map(item =>
    viewMode === 'Peso' ? item.weight : item.reps
  );

  const chartData = {
    labels,
    datasets: [{ data: values }],
  };

  return (
    <View style={styles.container}>
      <LineChart
        data={chartData}
        width={screenWidth}
        height={220}
        yAxisSuffix={viewMode === 'Peso' ? 'kg' : ''}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: { borderRadius: 8 },
          propsForDots: { r: '4', strokeWidth: '2', stroke: '#888' },
        }}
        style={styles.chart}
        bezier
      />
      {/* si quieres superponer valores encima de cada punto: */}
      {values.map((val, i) => (
        <Text
          key={i}
          style={[
            styles.dotLabel,
            {
              left: (i * screenWidth) / values.length + 16,
              top: 200 - (val / Math.max(...values)) * 180,
            },
          ]}
        >
          {val}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 8,
  },
  empty: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 16,
  },
  dotLabel: {
    position: 'absolute',
    fontSize: 12,
    color: '#333',
  },
});