
const React = require('react');
const {createUser, axiosInstance} = require('../auth');
const {TextField, Button} = require('bens_ui_components');
const {useState} = React;

const CreateUserCard = (props) => {
  const {style, onSuccess} = props;
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [createUserMessage, setCreateUserMessage] = useState(null);

  return (
    <div
      style={{
        ...style,
      }}
    >
      New User:
      <TextField
        id="usernameField"
        placeholder="USERNAME"
        value={username}
        onChange={setUsername}
      />
      <TextField
        id="passwordField"
        placeholder="PASSWORD"
        value={password}
        password={true}
        onChange={setPassword}
      />
      <TextField
        id="emailField"
        placeholder="EMAIL"
        value={email}
        onChange={setEmail}
      />
      <Button
        id="create"
        label="Create User"
        style={{
          display: 'inline',
        }}
        onClick={() => {
          createUser({username, password, email})
            .then(() => {
              setCreateUserMessage(null);
              onSuccess();
            }).catch((err) => {
              let message = 'An Error Occurred';
              if (err?.response?.data?.error) {
                message = err.response.data.error;
              } else if (err.message) {
                message = err.message;
              }
              console.log(err);
              setCreateUserMessage(message);
            });
        }}
      />
      <div><b>{createUserMessage}</b></div>
    </div>
  );
};

module.exports = CreateUserCard;
