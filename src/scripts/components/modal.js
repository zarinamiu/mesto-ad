export const openModalWindow = (modalWindow) => {
  modalWindow.classList.add("popup_is-opened");
  document.addEventListener("keydown", handleEscapeKey);
};

export const closeModalWindow = (modalWindow) => {
  modalWindow.classList.remove("popup_is-opened");
  document.removeEventListener("keydown", handleEscapeKey);
};

const handleEscapeKey = (evt) => {
  if (evt.key === "Escape") {
    const openedPopup = document.querySelector(".popup_is-opened");
    if (openedPopup) {
      closeModalWindow(openedPopup);
    }
  }
};

export const setCloseModalWindowEventListeners = (modalWindow) => {
  modalWindow.addEventListener("click", (evt) => {
    if (evt.target === modalWindow) {
      closeModalWindow(modalWindow);
    }
  });

  const closeButton = modalWindow.querySelector(".popup__close");
  if (closeButton) {
    closeButton.addEventListener("click", () => {
      closeModalWindow(modalWindow);
    });
  }
};