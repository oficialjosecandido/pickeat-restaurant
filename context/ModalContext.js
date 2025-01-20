import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Confirmation from "../components/Confirmation";

const modalContext = createContext();
export const useModal = () => useContext(modalContext);

const ModalContext = ({ children }) => {
  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [bottomSheetContent, setBottomSheetContent] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const bottomSheetRef = useRef(null);

  const confirmModal = (title) => {
    return new Promise((resolve) => {
      setModalContent(
        <Confirmation
          title={title}
          onCancel={() => {
            setShowModal(false);
            resolve(false);
          }}
          onConfirm={async () => {
            setShowModal(false);
            resolve(true);
          }}
        />
      );
      setShowModal(true);
    });
  };

  const provided = {
    bottomSheetRef,
    isBottomSheetVisible,
    setBottomSheetVisible,
    bottomSheetContent,
    setBottomSheetContent,
    showModal,
    setShowModal,
    modalContent,
    setModalContent,
    confirmModal,
  };

  return (
    <modalContext.Provider value={provided}>{children}</modalContext.Provider>
  );
};

export default ModalContext;
