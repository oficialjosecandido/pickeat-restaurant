import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Updates from "expo-updates";

import StackNavigation from "./navigation/StackNavigation";
import ModalContext from "./context/ModalContext";
import BottomSwiper from "./components/BottomSwiper";
import UserContext from "./context/UserContext";
import DataContext from "./context/DataContext";
import ModalContainer from "./components/ModalContainer";
import ConfirmAppExit from "./components/ConfirmAppExit";

import Toast from "react-native-toast-message";
import { LogBox } from "react-native";
import { useEffect } from "react";

LogBox.ignoreAllLogs(true);

const App = () => {
  const onFetchUpdateAsync = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      }
    } catch (error) {
      console.log(`Error fetching latest updates`);
    }
  };

  useEffect(() => {
    onFetchUpdateAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1">
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NavigationContainer>
            <ModalContext>
              <UserContext>
                <DataContext>
                  <StatusBar style="dark" />
                  <StackNavigation />
                  <BottomSwiper />
                  <ModalContainer />
                  <ConfirmAppExit />
                  <Toast />
                </DataContext>
              </UserContext>
            </ModalContext>
          </NavigationContainer>
        </GestureHandlerRootView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default App;
