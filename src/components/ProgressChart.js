// src/components/ProgressChart.js

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width - 40;
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
  const maxVal = Math.max(...values, 1);

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
        data={{ labels, datasets: [{ data: values,},],}}
        width={screenWidth}
        height={chartHeight}
        chartConfig={{
          color:       (opacity = 1) => `rgba(243,243,25,${opacity})`, // línea
          labelColor:  (opacity = 1) => `rgba(243,243,25,${opacity})`, // ejes
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
        decorator={() =>
          values.map((val, i) => {
            const x = (i * screenWidth) / values.length + 20;
            const y = (1 - val / maxVal) * (chartHeight - 40) + 20;

            return (
              <Text
                key={`dot-label-${i}`}
                style={[
                  styles.dotLabel,
                  {
                    left: x - 10,
                    top: y - 20,
                    color: getPointColors(i).text,
                  },
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
    textAlign: 'center',
    color: '#666',
    marginVertical: 16,
  },
  dotLabel: {
    position: 'absolute',
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: 'transparent',
  },
});