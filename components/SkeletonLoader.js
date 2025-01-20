import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  useSharedValue,
} from "react-native-reanimated";

const SkeletonLoader = ({ width, height, style }) => {
  // Animated value that loops indefinitely
  const animatedValue = useSharedValue(0);

  // Start animation on component mount
  useEffect(() => {
    animatedValue.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1, // Infinite loop
      true // Reverse the animation after each loop
    );
  }, []);

  // Interpolate opacity for the shimmering effect
  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animatedValue.value,
      [0, 0.5, 1],
      [0.3, 1, 0.3]
    );
    return {
      opacity,
    };
  });

  return (
    <Animated.View
      style={[styles.skeleton, animatedStyle, { width, height }, style]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
  },
});

export default SkeletonLoader;
