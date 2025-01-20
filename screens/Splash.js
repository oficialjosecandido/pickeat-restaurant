import { View, Text, Image } from "react-native";
import React from "react";
import { ICONS } from "../constants";

const Splash = () => {
  return (
    <View className="flex-1 bg-white items-center justify-center">
      <Image source={ICONS.loading} className="w-full" resizeMode="contain" />
    </View>
  );
};

export default Splash;
