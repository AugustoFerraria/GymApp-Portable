import React from 'react';
import { StyleSheet, ImageBackground, View } from 'react-native';

const Background = ({ children }) => {
  return (
    <ImageBackground
      source={require('../../assets/Gym.jpg')}
      style={styles.background}
      imageStyle={{ opacity: 1 }}
    >
      <View style={styles.overlay}>
        {children}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    padding: 16,
  },
});

export default Background;