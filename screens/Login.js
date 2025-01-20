import React, { useState } from "react";
import { ICONS } from "../constants";
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "../context/UserContext";
import Toast from "react-native-toast-message";

const Login = () => {
  const { login } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Errore",
        text2: error?.message || error || "Errore del server interno.",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className={`bg-main-1/10 p-4 flex-1`}>
        <View className="flex-1 items-center bg-gray-100 p-4 pt-20">
          <Image
            className="h-24 w-24 sm:h-32 sm:w-32 rounded-lg bg-main-1/20 mb-10"
            source={ICONS.logo}
            resizeMode="contain"
          />

          <TextInput
            className="w-full max-w-md sm:w-10/12 h-14 px-4 mb-4 rounded-lg border border-gray-300 bg-white text-base text-left"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View className="w-full max-w-md sm:w-10/12 relative mb-6">
            <TextInput
              className="w-full h-14 px-4 rounded-lg border border-gray-300 bg-white text-base text-left"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              className="absolute right-4 top-4"
              onPress={togglePasswordVisibility}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={24}
                color="grey"
              />
            </TouchableOpacity>
          </View>
          <View className="flex-1" />
          <TouchableOpacity
            onPress={handleLogin}
            className={`w-full mb-4 h-14 bg-main-1 justify-center items-center rounded-lg ${
              loading ? "opacity-50" : "opacity-100"
            }`}
          >
            <Text className="text-white font-bold text-lg">Accedi</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Login;