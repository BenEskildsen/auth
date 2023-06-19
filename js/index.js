
const React = require('react');
const ReactDOM = require('react-dom/client');
const {login, createUser, axiosInstance} = require('./auth');

window.login = login;
window.createUser = createUser;
window.axiosInstance = axiosInstance;

function renderUI(root) {
  root.render(
    <div>
      Hello World
    </div>
  );
}


const root = ReactDOM.createRoot(document.getElementById('container'));
renderUI(root);


