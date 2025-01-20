import React, { useEffect, useRef } from "react";
import { useModal } from "../context/ModalContext";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { BackHandler } from "react-native";

const BottomSwiper = () => {
  const {
    bottomSheetRef,
    isBottomSheetVisible,
    setBottomSheetVisible,
    bottomSheetContent,
    setBottomSheetContent,
  } = useModal();

  const scrollViewRef = useRef(null);

  const handleClose = () => {
    setBottomSheetVisible(false);
  };

  // Automatically open or close the bottom sheet based on visibility
  useEffect(() => {
    if (isBottomSheetVisible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
      setBottomSheetContent(null); // Clear the content when the sheet is closed
    }
  }, [isBottomSheetVisible]);

  // Handle back button press on Android when the bottom sheet is visible
  useEffect(() => {
    const onBackPress = () => {
      if (isBottomSheetVisible) {
        handleClose(); // Close the bottom sheet if it is visible
        return true; // Prevent the default back button action
      }
      return false; // Allow the default back button action
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    return () => {
      backHandler.remove(); // Cleanup the event listener
    };
  }, [isBottomSheetVisible]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={isBottomSheetVisible ? 0 : -1} // Open at 0, closed at -1
      snapPoints={["25%", "50%"]} // Adjust snap points based on your design
      enableContentPanningGesture={true}
      enablePanDownToClose={true}
      dismissOnPanDown={true}
      enableTouchOutsideToClose={true}
      enableDynamicSizing={true} // Enable dynamic sizing of the sheet
      keyboardBehavior="padding" // Adjust behavior when the keyboard is open
      onClose={handleClose} // Triggered when the sheet is fully closed
    >
      <BottomSheetScrollView ref={scrollViewRef}>
        {bottomSheetContent}
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

export default BottomSwiper;
