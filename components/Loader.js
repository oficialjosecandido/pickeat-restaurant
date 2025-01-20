import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const Loader = () => {
  // Shared value for scale animation
  const scale = useSharedValue(1);

  // Define the animated style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  // Run the animation once the component mounts
  React.useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.5, {
        duration: 700,
        easing: Easing.inOut(Easing.ease),
      }),
      -1, // Infinite loop
      true // Reverse on each loop
    );
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.loader, animatedStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loader: {
    width: 30,
    height: 30,
    borderRadius: 25, // Make it circular
    backgroundColor: "#ec7d55", // Loader color
  },
});

export default Loader;
