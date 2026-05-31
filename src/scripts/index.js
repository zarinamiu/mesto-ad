import {
    getUserInfo,
    getCardList,
    setUserInfo,
    addNewCard,
    updateAvatar,
    deleteCardFromServer,
    changeLikeCardStatus
} from "./components/api.js";

import { createCardElement } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";

const validationConfig = {
    formSelector: '.popup__form',
    inputSelector: '.popup__input',
    submitButtonSelector: '.popup__button',
    inactiveButtonClass: 'popup__button_disabled',
    inputErrorClass: 'popup__input_type_error',
    errorClass: 'popup__error_visible',
    patternMismatchMessage: 'Разрешены только латинские и кириллические буквы, знаки дефиса и пробелы'
};

let currentUserId = null;
let cardToDeleteElement = null;
let cardToDeleteId = null;

const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input_type_avatar");

const removeCardModalWindow = document.querySelector(".popup_type_remove-card");
const removeCardForm = removeCardModalWindow.querySelector(".popup__form");

const cardInfoModalWindow = document.querySelector(".popup_type_info");
const cardInfoModalInfoList = cardInfoModalWindow.querySelector(".popup__info");
const cardInfoModalUserList = cardInfoModalWindow.querySelector(".popup__list");

const renderLoading = (isLoading, buttonElement, loadingText = "Сохранение...", defaultText = "Сохранить") => {
    if (buttonElement) {
        buttonElement.textContent = isLoading ? loadingText : defaultText;
    }
};

const formatDate = (date) =>
    date.toLocaleDateString("ru-RU", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

const createInfoString = (term, description) => {
    const template = document
        .getElementById("popup-info-definition-template")
        .content.querySelector(".popup__info-item")
        .cloneNode(true);

    template.querySelector(".popup__info-term").textContent = term;
    template.querySelector(".popup__info-description").textContent = description;

    return template;
};

const createUserBadge = (userName) => {
    const template = document
        .getElementById("popup-info-user-preview-template")
        .content.querySelector("li")
        .cloneNode(true);

    template.textContent = userName;

    return template;
};

const handleInfoClick = (cardId) => {
    getCardList()
        .then((cards) => {
            const cardData = cards.find((card) => card._id === cardId);

            if (!cardData) {
                return Promise.reject("Карточка не найдена");
            }

            cardInfoModalInfoList.innerHTML = "";
            cardInfoModalUserList.innerHTML = "";

            cardInfoModalInfoList.append(
                createInfoString("Описание:", cardData.name),
                createInfoString(
                    "Дата создания:",
                    formatDate(new Date(cardData.createdAt))
                ),
                createInfoString("Владелец:", cardData.owner.name),
                createInfoString("Количество лайков:", cardData.likes.length)
            );

            cardData.likes.forEach((user) => {
                cardInfoModalUserList.append(createUserBadge(user.name));
            });

            openModalWindow(cardInfoModalWindow);
        })
        .catch((err) => {
            console.log(err);
        });
};

const handlePreviewPicture = ({ name, link }) => {
    imageElement.src = link;
    imageElement.alt = name;
    imageCaption.textContent = name;
    openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
    evt.preventDefault();
    const submitButton = evt.currentTarget.querySelector(".popup__button");

    renderLoading(true, submitButton, "Сохранение...", "Сохранить");

    setUserInfo({
        name: profileTitleInput.value,
        about: profileDescriptionInput.value,
    })
        .then((userData) => {
            profileTitle.textContent = userData.name;
            profileDescription.textContent = userData.about;
            closeModalWindow(profileFormModalWindow);
        })
        .catch((err) => {
            console.error(`Ошибка при обновлении профиля: ${err}`);
        })
        .finally(() => {
            renderLoading(false, submitButton, "Сохранение...", "Сохранить");
        });
};

const handleAvatarFromSubmit = (evt) => {
    evt.preventDefault();
    const submitButton = evt.currentTarget.querySelector(".popup__button");

    renderLoading(true, submitButton, "Сохранение...", "Сохранить");

    updateAvatar(avatarInput.value)
        .then((userData) => {
            profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
            closeModalWindow(avatarFormModalWindow);
        })
        .catch((err) => {
            console.error(`Ошибка при обновлении аватара: ${err}`);
        })
        .finally(() => {
            renderLoading(false, submitButton, "Сохранение...", "Сохранить");
        });
};

const handleCardFormSubmit = (evt) => {
    evt.preventDefault();
    const submitButton = evt.currentTarget.querySelector(".popup__button");

    renderLoading(true, submitButton, "Создание...", "Создать");

    addNewCard(cardNameInput.value, cardLinkInput.value)
        .then((cardData) => {
            placesWrap.prepend(
                createCardElement(
                    cardData,
                    {
                        onPreviewPicture: handlePreviewPicture,
                        onLikeIcon: handleLikeClick,
                        onDeleteCard: (cardElement, cardId) => {
                            cardToDeleteElement = cardElement;
                            cardToDeleteId = cardId;
                            openModalWindow(removeCardModalWindow);
                        },
                        onInfoClick: handleInfoClick,
                    },
                    currentUserId
                )
            );
            closeModalWindow(cardFormModalWindow);
            cardForm.reset();
            clearValidation(cardForm, validationConfig);
        })
        .catch((err) => {
            console.error(`Ошибка при добавлении карточки: ${err}`);
        })
        .finally(() => {
            renderLoading(false, submitButton, "Создание...", "Создать");
        });
};

const handleLikeClick = (likeButton, cardId, likeCounter) => {
    const isLiked = likeButton.classList.contains("card__like-button_is-active");

    changeLikeCardStatus(cardId, isLiked)
        .then((updatedCardData) => {
            likeButton.classList.toggle("card__like-button_is-active");
            likeCounter.textContent = updatedCardData.likes.length;
        })
        .catch((err) => {
            console.error(`Ошибка при изменении статуса лайка: ${err}`);
        });
};

const handleRemoveCardSubmit = (evt) => {
    evt.preventDefault();
    const submitButton = evt.currentTarget.querySelector(".popup__button");

    renderLoading(true, submitButton, "Удаление...", "Да");

    deleteCardFromServer(cardToDeleteId)
        .then(() => {
            cardToDeleteElement.remove();
            cardToDeleteElement = null;
            cardToDeleteId = null;
            closeModalWindow(removeCardModalWindow);
        })
        .catch((err) => {
            console.error(`Ошибка при удалении карточки: ${err}`);
        })
        .finally(() => {
            renderLoading(false, submitButton, "Удаление...", "Да");
        });
};

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);
removeCardForm.addEventListener("submit", handleRemoveCardSubmit);

openProfileFormButton.addEventListener("click", () => {
    profileTitleInput.value = profileTitle.textContent;
    profileDescriptionInput.value = profileDescription.textContent;
    clearValidation(profileForm, validationConfig);
    openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
    avatarForm.reset();
    clearValidation(avatarForm, validationConfig);
    openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
    cardForm.reset();
    clearValidation(cardForm, validationConfig);
    openModalWindow(cardFormModalWindow);
});

const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
    setCloseModalWindowEventListeners(popup);
});

enableValidation(validationConfig);

Promise.all([getCardList(), getUserInfo()])
    .then(([cardsData, userData]) => {
        currentUserId = userData._id;

        profileTitle.textContent = userData.name;
        profileDescription.textContent = userData.about;
        profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

        cardsData.forEach((data) => {
            placesWrap.append(
                createCardElement(
                    data,
                    {
                        onPreviewPicture: handlePreviewPicture,
                        onLikeIcon: handleLikeClick,
                        onDeleteCard: (cardElement, cardId) => {
                            cardToDeleteElement = cardElement;
                            cardToDeleteId = cardId;
                            openModalWindow(removeCardModalWindow);
                        },
                        onInfoClick: handleInfoClick,
                    },
                    currentUserId
                )
            );
        });
    })
    .catch((err) => {
        console.error(`Ошибка при инициализации данных страницы: ${err}`);
    });