const config = {
  baseUrl: "https://mesto.nomoreparties.co/v1/{{apf-cohort-203}}",
  headers: {
    authorization: "{{0ba12ed4-90d1-4fc6-b7df-5d7da37dd437}}",
    "Content-Type": "application/json",
  },
};

const apiBaseUrl = config.baseUrl.replace(/{{|}}/g, "");
const apiHeaders = {
  ...config.headers,
  authorization: config.headers.authorization.replace(/{{|}}/g, "")
};

const getResponseData = (res) => {
  return res.ok ? res.json() : Promise.reject(`Ошибка: ${res.status}`);
};

export const getUserInfo = () => {
  return fetch(`${apiBaseUrl}/users/me`, {
    headers: apiHeaders,
  }).then(getResponseData);
};

export const getCardList = () => {
  return fetch(`${apiBaseUrl}/cards`, {
    headers: apiHeaders,
  }).then(getResponseData);
};

export const setUserInfo = ({ name, about }) => {
  return fetch(`${apiBaseUrl}/users/me`, {
    method: "PATCH",
    headers: apiHeaders,
    body: JSON.stringify({ name, about }),
  }).then(getResponseData);
};

export const addNewCard = (name, link) => {
  return fetch(`${apiBaseUrl}/cards`, {
    method: "POST",
    headers: apiHeaders,
    body: JSON.stringify({ name, link }),
  }).then(getResponseData);
};

export const deleteCardFromServer = (cardId) => {
  return fetch(`${apiBaseUrl}/cards/${cardId}`, {
    method: "DELETE",
    headers: apiHeaders,
  }).then(getResponseData);
};

export const changeLikeCardStatus = (cardID, isLiked) => {
  return fetch(`${apiBaseUrl}/cards/likes/${cardID}`, {
    method: isLiked ? "DELETE" : "PUT",
    headers: apiHeaders,
  }).then(getResponseData);
};

export const updateAvatar = (avatarUrl) => {
  return fetch(`${apiBaseUrl}/users/me/avatar`, {
    method: "PATCH",
    headers: apiHeaders,
    body: JSON.stringify({ avatar: avatarUrl }),
  }).then(getResponseData);
};