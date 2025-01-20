import React from "react";
import { useModal } from "../context/ModalContext";
import Modal from "react-native-modal";
import { THEME } from "../constants";

function ModalContainer() {
  const { showModal, setShowModal, modalContent } = useModal();

  if (!modalContent) return null;

  return (
    <Modal
      isVisible={showModal}
      onBackdropPress={() => setShowModal(false)}
      onBackButtonPress={() => setShowModal(false)}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.7}
      backdropColor="#000000A0"
      style={{ margin: 0, zIndex: 0, elevation: 0 }}
      useNativeDriver={true}
      hideModalContentWhileAnimating={true}
      animationInTiming={250}
      animationOutTiming={100}
      backdropTransitionInTiming={250}
      backdropTransitionOutTiming={100}
      deviceHeight={THEME.screenHeight}
      deviceWidth={THEME.screenWidth}
      swipeDirection={["down"]}
      onSwipeComplete={() => setShowModal(false)}
      transparent={true}
    >
      {modalContent}
    </Modal>
  );
}

export default ModalContainer;
