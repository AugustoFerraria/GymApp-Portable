// src/components/ProgressChart.js

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width - 40; // 20px padding cada lado
const chartHeight = 300;

export default function ProgressChart({ data, viewMode }) {
  // Filtrar sólo valores numéricos válidos
  const filtered = data.filter(entry => {
    const v = viewMode === 'Peso' ? entry.weight : entry.reps;
    return typeof v === 'number' && !isNaN(v);
  });
  if (!filtered.length) {
    return <Text style={styles.empty}>No hay datos disponibles</Text>;
  }

  const labels = filtered.map(item => {
    const d = new Date(item.date);
    return !isNaN(d) ? d.toLocaleDateString() : '–';
  });
  const values = filtered.map(item =>
    viewMode === 'Peso' ? item.weight : item.reps
  );
  const maxVal = Math.max(...values);

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
        // activamos rejilla
        withInnerLines
        withDots
        withShadow
        chartConfig={{
          backgroundColor: '#B0B0B0',
          backgroundGradientFrom: 'rgba(70, 77, 79, 0.6)',
          backgroundGradientTo:   'rgba(0, 0, 0, 0.6)',
          decimalPlaces: 0,
          color:       (opacity = 1) => `rgba(243,243,25,${opacity})`, // línea
          labelColor:  (opacity = 1) => `rgba(243,243,25,${opacity})`, // ejes
          style: { borderRadius: 16 },
          // rejilla punteada
          propsForBackgroundLines: {
            strokeDasharray: [6, 4],
            stroke: 'rgba(243,243,25,0.3)',
          },
          // sombreado bajo curva
          fillShadowGradient:       'rgba(243,243,25,0.2)',
          fillShadowGradientOpacity: 1,
          // puntos
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#FFD700',
            fill:   '#FFF200',
          },
        }}
        style={styles.chart}
        bezier
        // decorator para poner valor encima de cada punto
        decorator={() =>
          values.map((val, i) => {
            const x = (i * screenWidth) / values.length + 20;
            const y = ((1 - val / maxVal) * (chartHeight - 40)) + 20;
            return (
              <Text
                key={i}
                style={[
                  styles.dotLabel,
                  { left: x, top: y },
                ]}
              >
                {val}
              </Text>
            );
          })
        }
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
    textAlign:      'center',
    color:         '#666',
    marginVertical: 16,
  },
  dotLabel: {
    position:       'absolute',
    fontSize:       12,
    fontWeight:   'bold',
    color:         '#FFF200',
    backgroundColor: 'transparent',
  },
});