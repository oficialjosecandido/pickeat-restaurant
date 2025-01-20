import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";


const CustomDropdown = ({ selectedValue, onSelect, options }) => {
  const [visible, setVisible] = useState(false);

  const toggleDropdown = () => setVisible((prev) => !prev);

  return (
    <View>
      <TouchableOpacity
        onPress={toggleDropdown}
        style={{
          padding: 8,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: "#ddd",
          backgroundColor: "#f0f0f0",
          justifyContent: "center",
          alignItems: "center",
          width: 100,
        }}
      >
        <Text>{selectedValue}</Text>
      </TouchableOpacity>

      <Modal transparent visible={visible} animationType="fade">
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}
          >
            <TouchableWithoutFeedback>
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 8,
                  padding: 10,
                }}
              >
                {options.map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => {
                      onSelect(option);
                      setVisible(false);
                    }}
                    style={{
                      padding: 10,
                      borderBottomWidth: 1,
                      borderBottomColor: "#ddd",
                    }}
                  >
                    <Text>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const TimeslotsPage = () => {
  const [timeSlots, setTimeSlots] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [startAmPm, setStartAmPm] = useState("AM");
  const [endAmPm, setEndAmPm] = useState("PM");
  const [slotDuration, setSlotDuration] = useState(15);

  const formatTimeForPayload = (timeStr) => {
    // Convert time like "6:00 AM" to "6:00"
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(Number);

    if (period === 'PM' && hours !== 12) {
      return `${hours + 12}:${minutes.toString().padStart(2, '0')}`;
    } else if (period === 'AM' && hours === 12) {
      return `0:${minutes.toString().padStart(2, '0')}`;
    }

    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const formatTimeToAmPm = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;
    minutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${hours}:${minutes} ${ampm}`;
  };

  const parseTime = (timeStr, ampm) => {
    if (!timeStr.match(/^\d{1,2}:\d{2}$/)) return null;

    const [hours, minutes] = timeStr.split(":").map(Number);
    if (hours < 0 || hours > 12 || minutes < 0 || minutes > 59) return null;

    const adjustedHours = ampm === "PM" && hours !== 12 ? hours + 12 : ampm === "AM" && hours === 12 ? 0 : hours;

    return new Date(1970, 0, 1, adjustedHours, minutes);
  };

  const generateTimeSlots = () => {
    if (!selectedDate || !startTime || !endTime) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const start = parseTime(startTime, startAmPm);
    const end = parseTime(endTime, endAmPm);

    if (!start || !end || end <= start) {
      Alert.alert("Error", "Invalid time range");
      return;
    }

    const slots = [];
    const currentTime = new Date(start);

    while (currentTime < end) {
      slots.push({ time: formatTimeToAmPm(currentTime), isAvailable: true });
      currentTime.setMinutes(currentTime.getMinutes() + slotDuration);
    }

    // Generate unique ID for this time slot section
    const sectionId = Date.now().toString();

    setTimeSlots(prev => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        [sectionId]: {
          startTime,
          endTime,
          startAmPm,
          endAmPm,
          slots
        }
      }
    }));

    // Clear input fields after generating slots
    setStartTime("");
    setEndTime("");
    setStartAmPm("AM");
    setEndAmPm("PM");
  };

  const saveTimeSlots = async (date, sectionId, section) => {
    console.log('=== Starting saveTimeSlots ===');
    console.log('Date:', date);
    console.log('Section ID:', sectionId);

    try {
      // Get only the selected (available) time slots
      const selectedSlots = section.slots
        .filter(slot => slot.isAvailable)
        .map(slot => formatTimeForPayload(slot.time));

      console.log('Selected slots:', selectedSlots);

      if (selectedSlots.length === 0) {
        console.warn('No time slots selected');
        Alert.alert("Error", "Please select at least one time slot");
        return;
      }

      const payload = {
        date: date,
        slots: selectedSlots.join(',')
      };

      console.log('Prepared payload:', JSON.stringify(payload, null, 2));

      Alert.alert(
        "Save Time Slots",
        "Are you sure you want to save these time slots?",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => console.log('Save operation cancelled by user')
          },
          {
            text: "Save",
            onPress: async () => {
              console.log('Starting API call...');
              try {
                const token = await AsyncStorage.getItem('token');
                if (!token) {
                  console.error('Authentication token not found');
                  throw new Error('Authentication token not found');
                }

                console.log('Making API request to generate time slots...');

                // Add https:// to the URL
                const response = await fetch('https://pickeat-backend.azurewebsites.net/owner/settings/generate-time-slot', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify(payload)
                });

                const responseData = await response.json();
                console.log('API Response:', JSON.stringify(responseData, null, 2));

                // Validate response structure
                if (responseData.message && responseData.timeSlots) {
                  console.log('Success Response Details:', {
                    message: responseData.message,
                    restaurantID: responseData.timeSlots.restaurantID,
                    date: responseData.timeSlots.date,
                    totalSlots: responseData.timeSlots.slots.length,
                    createdAt: responseData.timeSlots.createdAt
                  });

                  Alert.alert("Success", responseData.message);
                } else {
                  throw new Error('Invalid response format from server');
                }

              } catch (error) {
                console.error('Error during API call:', {
                  name: error.name,
                  message: error.message,
                  stack: error.stack
                });

                // More user-friendly error messages
                let errorMessage = 'Failed to save time slots: ';
                if (error.message === 'Network request failed') {
                  errorMessage += 'Please check your internet connection';
                } else if (error.message === 'Invalid response format from server') {
                  errorMessage += 'Unexpected server response';
                } else {
                  errorMessage += error.message;
                }

                Alert.alert("Error", errorMessage);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error in saveTimeSlots:', {
        message: error.message,
        stack: error.stack
      });
      Alert.alert("Error", "An error occurred while saving time slots");
    } finally {
      console.log('=== Finished saveTimeSlots ===');
    }
  };

  const deleteTimeSlotSection = (date, sectionId) => {
    Alert.alert(
      "Delete Time Slots",
      "Are you sure you want to delete these time slots?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setTimeSlots(prev => {
              const newDateSlots = { ...prev[date] };
              delete newDateSlots[sectionId];

              // If no more sections for this date, remove the date entry
              if (Object.keys(newDateSlots).length === 0) {
                const newTimeSlots = { ...prev };
                delete newTimeSlots[date];
                return newTimeSlots;
              }

              return {
                ...prev,
                [date]: newDateSlots
              };
            });
          }
        }
      ]
    );
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimeRange = (section) => {
    return `${section.startTime} ${section.startAmPm} - ${section.endTime} ${section.endAmPm}`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ paddingVertical: 20, backgroundColor: "#ec7d55" }}>
        <Text style={{ color: "white", fontSize: 24, fontWeight: "bold", paddingLeft: 20 }}>
          Manage Time Slots
        </Text>
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }}>
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>Slot Duration (mins):</Text>
          <CustomDropdown
            selectedValue={slotDuration.toString()}
            onSelect={(value) => setSlotDuration(parseInt(value))}
            options={["10", "15", "20"]}
          />
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>Date:</Text>
          <TextInput
            placeholder="YYYY-MM-DD"
            style={{
              borderWidth: 1,
              borderColor: "#ddd",
              padding: 8,
              borderRadius: 8,
              marginBottom: 10,
            }}
            value={selectedDate}
            onChangeText={setSelectedDate}
          />
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>Time Range:</Text>

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
            <TextInput
              placeholder="Start Time (HH:mm)"
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                padding: 8,
                borderRadius: 8,
                flex: 1,
                marginRight: 10,
              }}
              value={startTime}
              onChangeText={setStartTime}
            />
            <CustomDropdown
              selectedValue={startAmPm}
              onSelect={setStartAmPm}
              options={["AM", "PM"]}
            />
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <TextInput
              placeholder="End Time (HH:mm)"
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                padding: 8,
                borderRadius: 8,
                flex: 1,
                marginRight: 10,
              }}
              value={endTime}
              onChangeText={setEndTime}
            />
            <CustomDropdown
              selectedValue={endAmPm}
              onSelect={setEndAmPm}
              options={["AM", "PM"]}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={generateTimeSlots}
          style={{
            backgroundColor: "#ec7d55",
            padding: 10,
            borderRadius: 8,
            alignItems: "center",
            marginVertical: 12,
          }}
        >
          <Text style={{ color: "white" }}>Generate Time Slots</Text>
        </TouchableOpacity>

        {/* Display time slots grouped by date */}
        {Object.entries(timeSlots).sort().map(([date, sections]) => (
          <View key={date} style={{ marginBottom: 24 }}>
            <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 8 }}>
              {formatDate(date)}
            </Text>

            {Object.entries(sections).map(([sectionId, section]) => (
              <View key={sectionId} style={{ marginBottom: 16, backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ fontWeight: 'bold' }}>{formatTimeRange(section)}</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => saveTimeSlots(date, sectionId, section)}
                      style={{
                        backgroundColor: '#4CAF50',
                        padding: 6,
                        borderRadius: 4,
                      }}
                    >
                      <Text style={{ color: 'white' }}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deleteTimeSlotSection(date, sectionId)}
                      style={{
                        backgroundColor: '#ff4444',
                        padding: 6,
                        borderRadius: 4,
                      }}
                    >
                      <Text style={{ color: 'white' }}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {section.slots.map((slot, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() =>
                        setTimeSlots(prev => ({
                          ...prev,
                          [date]: {
                            ...prev[date],
                            [sectionId]: {
                              ...prev[date][sectionId],
                              slots: prev[date][sectionId].slots.map((s, i) =>
                                i === index ? { ...s, isAvailable: !s.isAvailable } : s
                              )
                            }
                          }
                        }))
                      }
                      style={{
                        margin: 4,
                        padding: 8,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: "#ddd",
                        backgroundColor: slot.isAvailable ? "#81b0ff" : "#f0f0f0",
                      }}
                    >
                      <Text>{slot.time}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default TimeslotsPage;