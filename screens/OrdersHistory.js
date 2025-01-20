import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, Modal, Button, Platform } from "react-native";
import { useUser } from "../context/UserContext";
import { useFocusEffect } from "@react-navigation/native";
import { useData } from "../context/DataContext";
import { Filter } from "react-native-feather";
import Loader from '../components/Loader';
import AsyncStorage from "@react-native-async-storage/async-storage";

const OrdersHistory = () => {
  const { getOrdersHistory } = useUser();
  const { currencies } = useData();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [tempDates, setTempDates] = useState({
    startDate: {
      day: '',
      month: '',
      year: ''
    },
    endDate: {
      day: '',
      month: '',
      year: ''
    }
  });
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    dateRange: 'all'
  });

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);

      let url = "https://pickeat-backend.azurewebsites.net/owner/orders/history";

      // Format date as YYYY-MM-DD
      const formatDate = (date) => {
        return date.toISOString().split('T')[0];  // This will return YYYY-MM-DD format
      };

      // Create payload object to track what we're sending
      let payload = {
        endpoint: url,
        filterType: filters.dateRange,
        dateParams: {}
      };

      // Add query parameters based on the selected filter
      if (filters.dateRange === "last3hours") {
        const threeHoursAgo = new Date();
        threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);
        url += `?from=${threeHoursAgo.toISOString()}`;
        payload.dateParams.from = threeHoursAgo.toISOString();
      }
      else if (filters.dateRange === "today") {
        const todayDate = formatDate(new Date());
        url += "?date=" + todayDate;
        payload.dateParams.date = todayDate;
      } else if (filters.dateRange === "week") {
        url += "?last=7";
        payload.dateParams.last = 7;
      } else if (filters.dateRange === "custom") {
        if (filters.startDate && filters.endDate) {
          const startDate = formatDate(filters.startDate);
          const endDate = formatDate(filters.endDate);
          url += `?range=${startDate},${endDate}`;
          payload.dateParams.range = `${startDate},${endDate}`;
        }
      }

      const token = await AsyncStorage.getItem("token");

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      // Log complete request details
      console.log("Request Details:", {
        ...payload,
        headers: {
          ...headers,
          Authorization: "Bearer [TOKEN HIDDEN]" // Hide actual token in logs
        },
        fullUrl: url
      });

      const response = await fetch(url, {
        headers: headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Response Data:", data);

      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching order history", error);
    } finally {
      setLoading(false);
    }
  };



  useFocusEffect(
    useCallback(() => {
      fetchOrders(filters);
    }, [filters])
  );


  const handleDateChange = (type, field, value) => {
    setTempDates(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  const handleApplyCustomDates = () => {
    const createDate = (dateObj, isEnd = false) => {
      if (!dateObj.year || !dateObj.month || !dateObj.day) return null;
      const date = new Date(
        parseInt(dateObj.year),
        parseInt(dateObj.month) - 1,
        parseInt(dateObj.day)
      );
      if (isEnd) {
        date.setHours(23, 59, 59, 999);
      } else {
        date.setHours(0, 0, 0, 0);
      }
      return date;
    };

    setFilters(prev => ({
      ...prev,
      startDate: createDate(tempDates.startDate),
      endDate: createDate(tempDates.endDate, true),
      dateRange: 'custom'
    }));
  };

  const filterOrdersByDate = (orders) => {
    if (filters.dateRange === 'all') return orders;

    return orders.filter(order => {
      // Convert order's timeSlot to a comparable date object
      const orderDate = new Date(order.createdAt);
      const [hours, minutes] = order.timeSlot.split(':');
      orderDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      switch (filters.dateRange) {
        case 'last3hours': {
          const threeHoursAgo = new Date();
          threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);
          return orderDate >= threeHoursAgo;
        }
        case 'today': {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return orderDate >= today;
        }
        case 'week': {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return orderDate >= weekAgo;
        }
        case 'custom': {
          if (!filters.startDate || !filters.endDate) return true;
          const start = new Date(filters.startDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(filters.endDate);
          end.setHours(23, 59, 59, 999);
          return orderDate >= start && orderDate <= end;
        }
        default:
          return true;
      }
    });
  };

  const calculateOrderTotal = (order) => {
    return order.items.reduce(
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
  };

  const DatePicker = ({ type }) => {
    const [expanded, setExpanded] = useState({
      day: false,
      month: false,
      year: false,
    });

    const toggleExpand = (field) => {
      setExpanded((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    return (
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 5 }}>
        {["day", "month", "year"].map((field) => (
          <View key={field} style={{ flex: 1, marginHorizontal: 5 }}>
            <Text style={{ fontSize: 12, marginBottom: 2 }}>{field.charAt(0).toUpperCase() + field.slice(1)}</Text>
            <TouchableOpacity
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 4,
                padding: 10,
                backgroundColor: "white",
              }}
              onPress={() => toggleExpand(field)}
            >
              <Text>{tempDates[type][field] || `${field}`}</Text>
            </TouchableOpacity>
            {expanded[field] && (
              <ScrollView
                style={{
                  maxHeight: 150,
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 4,
                  marginTop: 5,
                  backgroundColor: "white",
                }}
              >
                {(field === "day"
                  ? Array.from(
                    { length: getDaysInMonth(tempDates[type].month || 12, tempDates[type].year || new Date().getFullYear()) },
                    (_, i) => i + 1
                  )
                  : field === "month"
                    ? months
                    : years
                ).map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={{
                      padding: 10,
                      backgroundColor: tempDates[type][field] === String(value) ? "#ec7d55" : "white",
                    }}
                    onPress={() => {
                      handleDateChange(type, field, String(value));
                      toggleExpand(field);
                    }}
                  >
                    <Text style={{ color: tempDates[type][field] === String(value) ? "white" : "black" }}>{value}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        ))}
      </View>
    );
  };

  const FilterModal = () => (
    <Modal
    visible={showFilters}
    animationType="slide"
    transparent
    onRequestClose={() => setShowFilters(false)}
  >
    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
      <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, maxHeight: '80%' }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 15 }}>
          Filter Orders by Date
        </Text>

        <View style={{ marginBottom: 20 }}>
          {['all', 'last3hours', 'today', 'week', 'custom'].map((option) => (
            <TouchableOpacity
              key={option}
              style={{
                padding: 15,
                backgroundColor: filters.dateRange === option ? '#ec7d55' : '#f0f0f0',
                borderRadius: 8,
                marginVertical: 5
              }}
              onPress={() => {
                setFilters(prev => ({ ...prev, dateRange: option }));
                if (option !== 'custom') {
                  setTempDates({
                    startDate: { day: '', month: '', year: '' },
                    endDate: { day: '', month: '', year: '' }
                  });
                }
              }}
            >
              <Text style={{
                color: filters.dateRange === option ? 'white' : 'black',
                textAlign: 'center',
                textTransform: 'capitalize'
              }}>
                {option === 'all' ? 'Show All' :
                  option === 'last3hours' ? 'Last 3 Hours' :
                  option === 'today' ? 'Today' :
                  option === 'week' ? 'Last 7 Days' :
                  'Custom Range'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

          {filters.dateRange === 'custom' && (
            <ScrollView style={{ marginBottom: 20 }}>
              <Text style={{ marginBottom: 10, fontWeight: 'bold' }}>Start Date:</Text>
              <DatePicker type="startDate" />

              <Text style={{ marginTop: 15, marginBottom: 10, fontWeight: 'bold' }}>End Date:</Text>
              <DatePicker type="endDate" />

              <Button
                title="Apply Date Range"
                onPress={handleApplyCustomDates}
              />
            </ScrollView>
          )}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
            <Button
              title="Clear Filters"
              onPress={() => {
                setFilters({
                  startDate: null,
                  endDate: null,
                  dateRange: 'all'
                });
                setTempDates({
                  startDate: { day: '', month: '', year: '' },
                  endDate: { day: '', month: '', year: '' }
                });
              }}
            />
            <Button
              title="Close"
              onPress={() => setShowFilters(false)}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) return <Loader />;

  const filteredOrders = filterOrdersByDate(orders);

  const renderOrderItems = (order) => {
    return order.items.map((item, itemIndex) => {
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
          className={`flex-row space-x-3 mt-4 pb-4 ${itemIndex === order.items.length - 1 ? "" : "border-b border-black/10"
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
                <Text numberOfLines={2} className="font-semibold">
                  {item.title}
                </Text>
              </View>
              <Text className="flex-shrink-0">
                {currencies[order.currency]}
                {itemTotalPrice.toFixed(2)}
              </Text>
            </View>
            <Text className="text-xs mb-1">
              Quantity: {item.quantity} x {currencies[order.currency]}
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
                  No extras
                </Text>
              )}
            </View>
            <Text className="text-xs font-semibold">
              Notes: {item.notes ? item.notes : "No Notes"}
            </Text>
          </View>
        </View>
      );
    });
  };

  return (
    <View className="flex-1 bg-white">
      <View className="py-5 bg-main-1">
        <Text className="text-white text-2xl font-bold text-left px-4">
          Order History
        </Text>
      </View>

      <View className="px-4 py-3 flex-row justify-between items-center">
        <Text className="text-sm text-gray-600">
          {filteredOrders.length} {filteredOrders.length === 1 ? 'Order' : 'Orders'}
          {filters.dateRange !== 'all' && (
            <Text className="text-xs text-gray-500">
             {filters.dateRange === 'custom' && filters.startDate && filters.endDate
  ? ` (${filters.startDate.toLocaleDateString()} - ${filters.endDate.toLocaleDateString()})`
  : filters.dateRange === 'today'
  ? ' (Today)'
  : filters.dateRange === 'week'
  ? ' (Last 7 Days)'
  : ' (Last 30 Days)'
}
            </Text>
          )}
        </Text>
        <TouchableOpacity
          className="p-2 bg-main-1 rounded-lg"
          onPress={() => setShowFilters(true)}
        >
          <Filter stroke="white" width={24} height={24} />
        </TouchableOpacity>
      </View>

      <ScrollView className="px-4">
        {filteredOrders.map((order, index) => (
          <View
            key={index}
            className="rounded-lg border border-black/10 p-2 bg-main-1/10 mt-4"
          >
            <View className="flex-row items-start justify-between">
              <View>
                <Text className="text-xs font-semibold">{`Order: ${order.orderID}`}</Text>
                <Text className="text-xs font-bold">{`${order.user.firstName} ${order.user.lastName}`}</Text>
              </View>
              <View className="items-end justify-end">
                <Text>{order.timeSlot}</Text>
                <Text className="font-bold text-lg">
                  {`${currencies[order.currency]}${calculateOrderTotal(order).toFixed(2)}`}
                </Text>
              </View>
            </View>
            {renderOrderItems(order)}
          </View>
        ))}

        {filteredOrders.length === 0 && (
          <View className="flex-1 items-center justify-center py-8">
            <Text className="text-gray-500 text-lg">
              No orders found for the selected period
            </Text>
          </View>
        )}
      </ScrollView>

      <FilterModal />
    </View>
  );
};

export default OrdersHistory;