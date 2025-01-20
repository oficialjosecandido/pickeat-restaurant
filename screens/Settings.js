import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";

const SettingsPage = () => {
  const navigation = useNavigation();

  const settingsOptions = [
    {
      title: "Inventory",
      description: "Manage menu items and stock availability",
      onPress: () => navigation.navigate("Inventory"),
      icon: require("../assets/media/inventory.png")
    },
    {
      title: "Timeslots",
      description: "Configure available ordering time slots",
      onPress: () => navigation.navigate("Timeslots"),
      icon: require("../assets/media/timeslot.png")
    },
    {
      title: "Order History",
      description: "View past orders and transactions",
      onPress: () => navigation.navigate("OrderHistory"),
      icon: require("../assets/media/ordershistory.png")
    },
  ];

  return (
    <View className="flex-1 bg-white">
      <View className="py-5 bg-main-1">
        <Text className="text-white text-2xl font-bold text-left px-4">
          Settings
        </Text>
      </View>

      <View className="px-4 py-5">
        {settingsOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            onPress={option.onPress}
            className={`
              flex-row items-center p-4 bg-main-1/10 rounded-lg
              ${index !== 0 ? "mt-4" : ""}
              border border-black/10
            `}
          >
            <Image 
              source={option.icon}
              className="h-8 w-8"
              resizeMode="contain"
            />
            <View className="ml-4 flex-1">
              <Text className="text-lg font-semibold">{option.title}</Text>
              <Text className="text-sm text-black/70">
                {option.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default SettingsPage;