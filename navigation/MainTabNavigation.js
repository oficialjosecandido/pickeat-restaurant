import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { View, Image, Keyboard, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

import { ICONS } from "../constants";

import Home from "../screens/Home";
import Orders from "../screens/Orders";
import OrdersHistory from "../screens/OrdersHistory";
import Scanner from "../screens/Scanner";
import SettingsPage from "../screens/Settings";
import InventoryPage from "../screens/Inventory";
import TimeslotsPage from "../screens/Timeslots";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabBarComponent = ({ name, active, onLayout, onPress }) => {
  const tabBarIconStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(active ? 1 : 0.7, { duration: 250 }),
    };
  });

  if (name === "scanner") {
    return (
      <Pressable
        className="h-14 justify-center items-center flex-row gap-1 flex-1 bg-main-1 rounded-full"
        onLayout={onLayout}
        onPress={onPress}
      >
        <Animated.View style={tabBarIconStyle}>
          <Image
            className="h-8 w-8"
            resizeMethod="contain"
            source={ICONS[name]}
            style={{ tintColor: active ? "#000000" : "white" }}
          />
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Pressable
      className="h-14 justify-center items-center flex-row gap-1 flex-1"
      onLayout={onLayout}
      onPress={onPress}
    >
      <Animated.View style={tabBarIconStyle}>
        <Image
          className="h-8 w-8"
          resizeMethod="contain"
          source={ICONS[name]}
          style={{ tintColor: active ? "#000000" : "#A0A0A0" }}
        />
      </Animated.View>
    </Pressable>
  );
};

const AnimatedTabBar = ({
  state: { index: activeIndex, routes },
  navigation,
}) => {
  const [tabBarHide, setTabBarHide] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (e) => {
        setTabBarHide(true);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setTabBarHide(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <View
      className="w-full bg-white border-t-0 py-2 border-gray-200"
      style={{
        display: tabBarHide ? "none" : "flex",
        zIndex: 100,
      }}
    >
      <View className="flex-row px-6 justify-between">
        {routes.map((route, index) => {
          const active = index === activeIndex;

          return (
            <TabBarComponent
              key={route.key}
              name={route.name}
              active={active}
              onPress={() => navigation.navigate(route.name)}
            />
          );
        })}
      </View>
    </View>
  );
};

// Settings Stack Navigator
const SettingsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="SettingsMain" component={SettingsPage} />
      <Stack.Screen name="Inventory" component={InventoryPage} />
      <Stack.Screen name="Timeslots" component={TimeslotsPage} />
      <Stack.Screen name="OrderHistory" component={OrdersHistory} />
    </Stack.Navigator>
  );
};

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <AnimatedTabBar {...props} />}
    >
      <Tab.Screen name="orders" component={Orders} />
      <Tab.Screen name="scanner" component={Scanner} />
      <Tab.Screen name="settings" component={SettingsStack} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;