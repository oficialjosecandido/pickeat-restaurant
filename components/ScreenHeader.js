import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import { ICONS } from "../constants";

const ScreenHeader = ({ title, goBack }) => {
  return (
    <View className="py-4 flex-row items-center justify-center">
      <TouchableOpacity onPress={goBack} className="absolute left-2 z-10 p-2">
        <Image source={ICONS.back} className="h-4 w-4" resizeMode="container" />
      </TouchableOpacity>
      <Text className="font-bold text-lg">{title}</Text>
    </View>
  );
};

export default ScreenHeader;
