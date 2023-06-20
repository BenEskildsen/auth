
const React = require('react');
const {login, createUser, axiosInstance} = require('../auth');
const {TextField, Button} = require('bens_ui_components');
const {useState} = React;

const LoginCard = (props) => {
  const {style, onSuccess} = props;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginMessage, setLoginMessage] = useState(null);

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '16px',
        width: 500,
        marginLeft: 'auto',
        marginRight: 'auto',
        ...style,
      }}
    >
      <div>
        <div>
          <TextField
            id="usernameField"
            placeholder="LOGIN"
            value={username}
            onChange={setUsername}
          />
        </div>
        <div>
          <TextField
            id="passwordField"
            placeholder="PASSWORD"
            value={password}
            password={true}
            onChange={setPassword}
          />
        </div>
        <div><b>{loginMessage}</b></div>
        <Button
          id="login"
          label="LOGIN"
          style={{
          }}
          onClick={() => {
            login(username, password)
              .then(() => {
                setLoginMessage(null);
                onSuccess();
              }).catch((err) => {
                let message = 'An Error Occurred';
                if (err?.response?.data?.error) {
                  message = err.response.data.error;
                } else if (err.message) {
                  message = err.message;
                }
                console.log(err);
                setLoginMessage(message);
              });
          }}
        />
      </div>
    </div>
  );
};

module.exports = LoginCard;
