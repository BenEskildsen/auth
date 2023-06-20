
const React = require('react');
const ReactDOM = require('react-dom/client');
const {login, createUser, axiosInstance} = require('../auth');
const {fullTest} = require('../tests');

window.login = login;
window.createUser = createUser;
window.axiosInstance = axiosInstance;

location.assign(location.origin + '/login');

// fullTest("mazer1010");

function renderUI(root) {
  root.render(
    <div>
      Test Page Placeholder
    </div>
  );
}


const root = ReactDOM.createRoot(document.getElementById('container'));
renderUI(root);


