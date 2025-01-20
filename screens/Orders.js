import React, { useCallback, useEffect, useState, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Animated } from "react-native";
import { useUser } from "../context/UserContext";
import { ICONS } from "../constants";
import { useFocusEffect } from "@react-navigation/native";
import moment from "moment";
import { useData } from "../context/DataContext";

const Orders = ({ navigation }) => {
  const { logout, getOrders, changeOrderStatus, socket } = useUser();
  const { currencies } = useData();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const startRotationAnimation = () => {
    rotateAnim.setValue(0);
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const getTextStatus = (status) => {
    if (status === "pending") return "Inizia Ordine";
    else if (status === "preparing") return "Completa Ordine";
    else if (status === "ready") return "In attesa di essere scansionato";
  };

  const handleChangeStatus = async (orderId, status) => {
    try {
      setLoading(true);
      if (status === "ready") return navigation.navigate("scanner");
      let new_status = status;
      if (status === "pending") new_status = "preparing";
      else if (status === "preparing") new_status = "ready";
      else if (status === "ready") new_status = "delivered";
      await changeOrderStatus(orderId, new_status);
      setOrders((prevOrders) =>
        prevOrders.map((item) =>
          item._id === orderId ? { ...item, status: new_status } : item
        )
      );
    } catch (error) {
      console.error("Errore nel cambiare lo stato dell'ordine", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setRefreshing(true);
      startRotationAnimation();
      const orders = await getOrders();
      if (orders) {
        const filteredOrders = orders.filter(
          (ord) => ord.status !== "pre" && ord.status !== "delivered"
        );
        setOrders(filteredOrders || []);
      }
    } catch (error) {
      console.log("Errore nel recuperare gli ordini", error);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  useEffect(() => {
    if (!socket) return;

    socket.on("new_order", () => {
      fetchOrders();
    });

    return () => {
      socket.off("new_order");
    };
  }, [socket]);

  return (
    <View className="flex-1 bg-white">
      <View className="py-5 bg-main-1 flex-row items-center justify-between px-4">
        <Text className="text-white text-2xl font-bold">I Tuoi Ordini</Text>
        <View className="flex-row items-center space-x-4">
          <TouchableOpacity 
            onPress={fetchOrders}
            disabled={refreshing}
            className="bg-white rounded-lg px-4 py-2 flex-row items-center space-x-2"
          >
            <Text className="text-main-1 font-bold">Aggiorna</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={logout}>
            <Image
              className="h-6 w-6"
              source={ICONS.logout}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView className="px-4 py-5">
        {refreshing ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-lg text-gray-500 mb-4">Aggiornamento in corso...</Text>
            <Animated.Image
              source={ICONS.refresh}
              style={[
                { height: 40, width: 40 },
                { transform: [{ rotate: spin }] }
              ]}
              resizeMode="contain"
            />
          </View>
        ) : orders.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-lg text-gray-500 text-center">
              Non ci sono ordini al momento.{"\n"}Tocca Refresh per aggiornare.
            </Text>
          </View>
        ) : (
          orders.map((order, index) => {
            const orderTotalPrice = order.items.reduce(
              (acc, item) =>
                acc +
                (item.price +
                  item.extras.reduce(
                    (extraAcc, extra) => extraAcc + extra.price * extra.amount,
                    0
                  )) *
                  item.quantity,
              0
            );
            return (
              <View
                key={index}
                className="rounded-lg border border-black/10 p-2 bg-main-1/10 mt-4"
              >
                <View className="flex-row items-start justify-between">
                  <View>
                    <Text className="text-xs font-semibold">{`Ordine: ${order.orderID}`}</Text>
                    <Text className="text-xs font-bold">{`${order.user.firstName} ${order.user.lastName}`}</Text>
                  </View>
                  <View className="items-end justify-end">
                    <Text>{order.timeSlot}</Text>
                    <Text className="font-bold text-lg">{`${currencies[order.currency]}${orderTotalPrice.toFixed(2)}`}</Text>
                  </View>
                </View>
                {order.items.map((item, itemIndex) => {
                  const itemPriceWithExtras =
                    item.price +
                    item.extras.reduce(
                      (acc, extra) => acc + extra.price * extra.amount,
                      0
                    );
                  const itemTotalPrice = itemPriceWithExtras * item.quantity;

                  return (
                    <View
                      key={itemIndex}
                      className={`flex-row space-x-3 mt-4 pb-4 ${
                        itemIndex === order.items.length - 1
                          ? ""
                          : "border-b border-black/10"
                      }`}
                    >
                      <View className="border rounded-lg border-black/10 flex items-center justify-center px-2 py-4 bg-white">
                        <Image
                          source={{ uri: item.image }}
                          className="h-20 w-20 rounded-lg"
                          resizeMode="cover"
                        />
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-start justify-between space-x-2">
                          <View className="flex-1">
                            <Text 
                              numberOfLines={2} 
                              className="font-semibold"
                            >
                              {item.title}
                            </Text>
                          </View>
                          <Text className="flex-shrink-0">
                            {currencies[order.currency]}
                            {itemTotalPrice.toFixed(2)}
                          </Text>
                        </View>
                        <Text className="text-xs mb-1">
                          Quantità: {item.quantity} x {currencies[order.currency]}
                          {item.price}
                        </Text>
                        <View className="flex-1">
                          {item.extras.length > 0 ? (
                            item.extras.map((extra) => (
                              <View
                                key={extra._id.$oid}
                                className="flex-row items-center justify-between"
                              >
                                <Text className="text-xs text-black/70">
                                  • {extra.title}
                                </Text>
                                <Text className="text-xs text-black/70">
                                  {currencies[order.currency]}
                                  {extra.price} x{extra.amount}
                                </Text>
                              </View>
                            ))
                          ) : (
                            <Text className="text-xs text-black/70">
                              Nessun extra
                            </Text>
                          )}
                        </View>
                        <Text className="text-xs font-semibold">
                          Note: {item.notes ? item.notes : "Nessuna Nota"}
                        </Text>
                      </View>
                    </View>
                  );
                })}
                <TouchableOpacity
                  disabled={loading}
                  onPress={() =>
                    handleChangeStatus(order._id, order?.status ?? "pending")
                  }
                  className="mt-4 bg-main-1 p-2 rounded-lg"
                >
                  <Text className="text-white text-center font-bold">
                    {getTextStatus(order?.status ? order?.status : "pending")}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
};

export default Orders;