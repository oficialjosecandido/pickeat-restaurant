import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api";
import Splash from "../screens/Splash";

////////////////////////////////////////////////////push notification///////////////////////////////////////////////
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import io from "socket.io-client";

const socket_url =   "https://pickeat-production.azurewebsites.net";

//const socket_url = "http://192.168.0.114:8080/";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotificationsAsync() {
  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Impossibile ottenere il token per le notifiche push!");
      return;
    }

    const token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: "168e5059-2a97-4304-a9cf-8b9eaadcf1d1",
      })
    ).data;
    return token;
  } else {
    alert(
      "È necessario utilizzare un dispositivo fisico per le notifiche push"
    );
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const userContext = createContext();
export const useUser = () => useContext(userContext);

const UserContext = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [expoPushToken, setExpoPushToken] = useState("");
  const [socket, setSocket] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();

  // assegnare il token di notifica push
  const assingPushNotificationToken = async (token, user) => {
    try {
      const userID = user?.userID;
      await api.post("/auth/push-token", { token, userID });
    } catch (error) {
      console.error(
        "Errore nell'assegnazione del token di notifica push",
        error
      );
    }
  };

  const login = async (email, password) => {
    try {
      // Get the Expo push token before login
      const expo_token = await Notifications.getExpoPushTokenAsync({
        projectId: "7ea3a9c8-c926-45dd-a4cc-d3cfcf642c3b",
      }).then((response) => response.data);

      const {
        data: { token, user },
      } = await api.post("/owner/login", {
        email,
        password,
        expo_token, // Added expo_token to the login request
      });

      setUser({
        ...user,
      });
      await AsyncStorage.setItem("token", token);
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
    } catch (error) {
      const message = error.response?.data?.message || "Credenziali non valide";
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      setUser(null);
    } catch (error) {
      console.error("Errore durante il logout", error);
    }
  };

  const verifyUser = async () => {
    setUserLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;
      const { data } = await api.get("/owner/verify", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      setUser(data);
    } catch (error) {
      console.error("Errore nella verifica dell'utente", error);
    } finally {
      setUserLoading(false);
    }
  };

  const getOrders = async () => {
    try {
      const { data } = await api.get("/owner/orders");
      return data;
    } catch (error) {
      console.error("Errore nel recupero degli ordini", error);
    }
  };

  const getOrdersHistory = async () => {
    try {
      const { data } = await api.get("/owner/orders/history");
      return data;
    } catch (error) {
      console.error("Errore nel recupero della cronologia degli ordini", error);
    }
  };

  const changeOrderStatus = async (orderID, status) => {
    try {
      await api.post(`/owner/order/status`, {
        orderID,
        status,
      });
    } catch (error) {
      console.error("Errore nel cambio dello stato dell'ordine", error);
    }
  };

  const markOrderAsDelivered = async (orderID) => {
    try {
      await api.post(`/owner/order/delivered`, {
        orderID,
      });
    } catch (error) {
      console.error(
        "Errore nel contrassegnare l'ordine come consegnato",
        error
      );
    }
  };

  const provided = {
    // autenticazione
    user,
    login,
    logout,
    getOrders,
    getOrdersHistory,
    changeOrderStatus,
    socket,
    markOrderAsDelivered,
  };

  // ottenere la posizione dell'utente e verificare l'utente
  useEffect(() => {
    verifyUser();
  }, []);

  // notifica push
  useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );

    // Listener per le notifiche in primo piano
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notifica ricevuta: ", notification);

        // Accesso ai dati personalizzati
        const customData = notification.request.content.data;
        console.log("Dati personalizzati: ", customData);
      });

    // Listener per la risposta alla notifica (quando l'utente interagisce con la notifica)
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const customData = response.notification.request.content.data;
        console.log("Dati personalizzati dalla risposta: ", customData);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  useEffect(() => {
    if (expoPushToken) {
      assingPushNotificationToken(expoPushToken, user);
    }
  }, [expoPushToken, user]);

  useEffect(() => {
    if (user) {
      const newSocket = io(socket_url);
      newSocket.on("connect", () => {
        newSocket.emit("assign_user", {
          userID: user.userID,
        });
      });

      setSocket(newSocket);
    }
  }, [user]);

  if (userLoading) return <Splash />;

  return (
    <userContext.Provider value={provided}>{children}</userContext.Provider>
  );
};

export default UserContext;
