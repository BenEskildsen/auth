
const React = require('react');
const ReactDOM = require('react-dom/client');
const LoginCard = require('../components/LoginCard.react');

function renderUI(root) {
  root.render(
    <LoginCard
      onSuccess={() => {
        location.assign(location.origin + '/dashboard');
      }}
    />
  );
}


const root = ReactDOM.createRoot(document.getElementById('container'));
renderUI(root);


