import { View, Text, TouchableOpacity } from "react-native";
import React from "react";

const Confirmation = ({ title, onCancel, onConfirm }) => {
  return (
    <View className="bg-white rounded max-w-[80%] m-auto">
      <Text className="text-xs p-4">{title}</Text>
      <View className="flex-row">
        <TouchableOpacity
          className="flex-1 justify-center items-center py-2 border-t border-gray-200"
          onPress={onCancel}
        >
          <Text>No</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 justify-center items-center py-2 border-t border-gray-200 bg-black"
          onPress={onConfirm}
        >
          <Text className="text-white">Sì</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Confirmation;
