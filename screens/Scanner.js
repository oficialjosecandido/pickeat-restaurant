import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useUser } from "../context/UserContext";
import Loader from "../components/Loader";

const scannedBarcode = [];

const Scanner = () => {
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);

  const { markOrderAsDelivered } = useUser();

  const handleScanBarcode = async (barcode) => {
    if (loading || scannedBarcode.includes(barcode.data)) return;

    try {
      setLoading(true);
      console.log("Codice a barre scansionato", barcode.data);
      await markOrderAsDelivered(barcode.data);
      scannedBarcode.push(barcode.data);
      alert("Ordine contrassegnato come consegnato");
    } catch (error) {
      console.error(
        "Errore nel contrassegnare l'ordine come consegnato",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    // Permessi della fotocamera non ancora concessi.
    return (
      <View className="flex-1 item-center justify-center max-w-xs mx-auto">
        <Text className="font-bold text-sm text-center mb-4">
          Abbiamo bisogno della tua autorizzazione per mostrare la fotocamera
        </Text>
        <Button onPress={requestPermission} title="Continuare" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Loader />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <CameraView
        onBarcodeScanned={handleScanBarcode}
        className="flex-1"
        facing={facing}
      >
        <View>
          <TouchableOpacity
            className="px-4 py-2 rounded-full bg-main-1 self-start m-2 ml-auto"
            onPress={toggleCameraFacing}
          >
            <Text className="text-white">Cambia Fotocamera</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
};

export default Scanner;
