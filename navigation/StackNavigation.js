import { createStackNavigator } from "@react-navigation/stack";
import MainTabNavigator from "./MainTabNavigation";
import Login from "../screens/Login";
import Orders from "../screens/Orders";
import { useUser } from "../context/UserContext";

const Stack = createStackNavigator();

const StackNavigation = ({ ...props }) => {
  const { user } = useUser();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {user?.userID ? (
        <>
          <Stack.Screen name="main" component={MainTabNavigator} />
        </>
      ) : (
        <>
          <Stack.Screen name="login" component={Login} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default StackNavigation;
