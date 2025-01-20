import { View, Text, BackHandler, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import Modal from "react-native-modal";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

const ConfirmAppExit = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigation = useNavigation(); // Access navigation state

  const handleBackPress = () => {
    // Check if we are on the first screen of the navigation stack
    if (navigation.isFocused() && navigation.canGoBack() === false) {
      setIsModalVisible(true);
      return true; // Prevent the default back action
    }
    return false; // Allow default back button action if not on the first screen
  };

  useFocusEffect(
    React.useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBackPress
      );

      return () => backHandler.remove(); // Clean up on unmount
    }, [navigation])
  );

  return (
    <Modal
      isVisible={isModalVisible}
      onBackdropPress={() => setIsModalVisible(false)}
      onBackButtonPress={() => setIsModalVisible(false)}
    >
      <View className="bg-white rounded">
        <Text className="text-xs p-4">
          Sei sicuro di voler chiudere l'applicazione?
        </Text>
        <View className="flex-row">
          <TouchableOpacity
            className="flex-1 justify-center items-center py-2 border-t border-gray-200"
            onPress={() => setIsModalVisible(false)}
          >
            <Text>No</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 justify-center items-center py-2 border-t border-gray-200 bg-black"
            onPress={() => {
              setIsModalVisible(false);
              BackHandler.exitApp(); // Exit the app if confirmed
            }}
          >
            <Text className="text-white">Sì</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmAppExit;
