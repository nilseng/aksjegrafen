import { useContext } from "react";
import { Slide, ToastContainer } from "react-toastify";
import { AppContext } from "../AppContext";

export const Overlays = () => {
  const { theme } = useContext(AppContext);

  return (
    <>
      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        transition={Slide}
        hideProgressBar={true}
        theme={theme.id === "dark" ? "dark" : "light"}
      />
    </>
  );
};
