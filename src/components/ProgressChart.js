// src/components/ProgressChart.js

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text as RNText, StyleSheet, Dimensions, Animated } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Text as SvgText } from 'react-native-svg';

const screenWidth = Dimensions.get('window').width - 40;
const chartHeight = 300;

export default function ProgressChart({ data, viewMode }) {
  // Filtrar sólo valores numéricos válidos
  const filtered = useMemo(() => {
    return data.filter(entry => {
      const v = viewMode === 'Peso' ? entry.weight : entry.reps;
      return typeof v === 'number' && !isNaN(v);
    });
  }, [data, viewMode]);

  if (!filtered.length) {
    return <RNText style={styles.empty}>No hay datos disponibles</RNText>;
  }

  const labels = useMemo(() => {
    return filtered.map(item => {
      const d = new Date(item.date);
      return !isNaN(d) ? d.toLocaleDateString() : '–';
    });
  }, [filtered]);

  const targetValues = useMemo(() => {
    return filtered.map(item =>
      viewMode === 'Peso' ? item.weight : item.reps
    );
  }, [filtered, viewMode]);

  // Nueva feature: firma estable del dataset para que el effect
  // no se dispare por referencias nuevas de arrays en cada render.
  const valuesSignature = useMemo(() => {
    return `${viewMode}|${labels.join('|')}|${targetValues.join('|')}`;
  }, [viewMode, labels, targetValues]);

  // Nueva feature: valores realmente renderizados por el chart.
  // Normalmente son iguales a targetValues, pero cuando entra
  // un punto nuevo al final lo hacemos aparecer desde y = 0.
  const [animatedValues, setAnimatedValues] = useState(targetValues);

  // Nueva feature: opacidad del último punto y su label.
  // Se usa para el "appear" de 0.25s antes de la subida.
  const [lastPointOpacity, setLastPointOpacity] = useState(1);

  // Nueva feature: referencia al dataset anterior para detectar
  // cuándo realmente se agregó un punto nuevo al final.
  const previousValuesRef = useRef([]);

  // Nueva feature: controlamos el primer render para no animar
  // cuando el gráfico simplemente se monta por primera vez.
  const isFirstRenderRef = useRef(true);

  // Nueva feature: animación del fade-in del último punto.
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Nueva feature: animación de subida vertical del último punto
  // desde 0 hasta su valor final.
  const riseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const previousValues = previousValuesRef.current;

    // Primer render: mostrar directamente los datos actuales.
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      setAnimatedValues(targetValues);
      setLastPointOpacity(1);
      previousValuesRef.current = targetValues;
      return;
    }

    // Detectar si se agregó exactamente un punto nuevo al final
    // y los anteriores se mantuvieron iguales.
    const isNewPointAppended =
      previousValues.length > 0 &&
      targetValues.length === previousValues.length + 1 &&
      previousValues.every((value, index) => value === targetValues[index]);

    if (!isNewPointAppended) {
      // Si cambió el modo, se editó un valor viejo, o vino cualquier
      // otro cambio que no sea "agregar un punto nuevo al final",
      // renderizamos normal para evitar efectos raros.
      setAnimatedValues(targetValues);
      setLastPointOpacity(1);
      previousValuesRef.current = targetValues;
      return;
    }

    const lastIndex = targetValues.length - 1;
    const finalLastValue = targetValues[lastIndex];

    // Nueva feature: el nuevo punto arranca en y = 0.
    const startValues = [...previousValues, 0];

    setAnimatedValues(startValues);
    setLastPointOpacity(0);
    previousValuesRef.current = targetValues;

    fadeAnim.stopAnimation();
    riseAnim.stopAnimation();

    fadeAnim.setValue(0);
    riseAnim.setValue(0);

    const fadeListenerId = fadeAnim.addListener(({ value }) => {
      setLastPointOpacity(value);
    });

    const riseListenerId = riseAnim.addListener(({ value }) => {
      const nextValues = [...previousValues, finalLastValue * value];
      setAnimatedValues(nextValues);
    });

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      }),
      Animated.timing(riseAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      }),
    ]).start(({ finished }) => {
      fadeAnim.removeListener(fadeListenerId);
      riseAnim.removeListener(riseListenerId);

      if (finished) {
        setAnimatedValues(targetValues);
        setLastPointOpacity(1);
      }
    });

    return () => {
      fadeAnim.removeListener(fadeListenerId);
      riseAnim.removeListener(riseListenerId);
      fadeAnim.stopAnimation();
      riseAnim.stopAnimation();
    };
  }, [valuesSignature, targetValues, viewMode, fadeAnim, riseAnim]);

  const values = animatedValues.length ? animatedValues : targetValues;

  const getPointColors = (index) => {
    const isFailure = Boolean(filtered[index]?.failure);

    return {
      fill: isFailure ? '#FF3B30' : '#FFF200',
      stroke: isFailure ? '#B91C1C' : '#FFD700',
      text: isFailure ? '#FF3B30' : '#FFF200',
    };
  };

  // Nueva feature: detectar si el índice actual es el último punto
  // para aplicarle el fade-in cuando recién se agrega.
  const getPointOpacity = (index) => {
    return index === values.length - 1 ? lastPointOpacity : 1;
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
  withVerticalLabels={false}
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
    opacity: getPointOpacity(index),
  })}
  renderDotContent={({ x, y, index, indexData }) => (
    <SvgText
      key={`dot-label-${index}`}
      x={x}
      y={y + 22}
      fill={getPointColors(index).text}
      opacity={getPointOpacity(index)}
      fontSize="12"
      fontWeight="bold"
      textAnchor="middle"
    >
      {Math.round(indexData)}
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