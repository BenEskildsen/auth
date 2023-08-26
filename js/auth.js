//const axios = require('axios');
import axios from 'axios';
const {authURL, cookieName, AUTH_TYPE} = require('./config');

let axiosInstance = axios.create({
  // baseURL: authURL,
  baseURL: location.origin,
  withCredentials: true,
});

const login = (username, password) => {
  return axiosInstance.post('/auth/login', {
    username, password,
  }).then((res) => {
    if (AUTH_TYPE == 'JWT') {
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${res.data.accessToken}`;
    }
    return res.data;
    // how to redirect to a new page
    // location.assign(location.origin + '/projects/?id=' + res.data.data._id);
  });
}


const createUser = (user) => {
  return axiosInstance.post('/auth/create', {
    ...user,
  }).then((res) => {
    // automatically log in created user:
    // if (AUTH_TYPE == 'JWT') {
    //   axiosInstance.defaults.headers.common.Authorization = `Bearer ${res.data.accessToken}`;
    // }
    return res.data;
    // how to redirect to a new page
    // location.assign(location.origin + '/projects/?id=' + res.data.data._id);
  });
}


// Only used for the cookie but maybe not even necessary
const getAccessToken = () => {
  if (AUTH_TYPE == 'COOKIE') {
    // HACK to grab the access token out of the homeCookie
    const token = document.cookie.split(';')
      .map(c => c.split('=')).filter(c => c[0].trim() == cookieName)[0][1];
    return token.trim();
  }
}


const logout = () => {
  // TODO: delete cookie
  axiosInstance.defaults.headers.common.Authorization = null;
}


module.exports = {
  login,
  logout,
  createUser,
  getAccessToken,
  axiosInstance,
};
