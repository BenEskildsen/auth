
const {login, createUser, axiosInstance} = require('./auth');

const testCreateUser = (username) => {
  console.log("create user", username || 'mazer1010');
  return createUser({username: username || 'mazer1010', password: 'hunter2'})
    .then(console.log)
    .catch(console.error);
}

const testLogin = (username) => {
  console.log("login", username || 'mazer1010');
  return login(username || 'mazer1010', 'hunter2')
    .then(console.log)
    .catch(console.error);
}

const testIsAuthed = () => {
  console.log("is_authed");
  return axiosInstance.get('/auth/is_authed')
    .then(console.log)
    .catch(console.error);
}

const testIsAuthedAsUser = (username) => {
  console.log("is_authed_as_user", username || 'mazer1010');
  return axiosInstance.get('/auth/is_authed_as_user', {params: {username: username || 'mazer1010'}})
    .then(console.log)
    .catch(console.error);
}

const testUpdate = (username) => {
  console.log("update user", username || 'mazer1010');
  return axiosInstance.post('/auth/update', {username: username || 'mazer1010', email: 'a@b.com'})
    .then(console.log)
    .catch(console.error);
}

const testListUsers = () => {
  console.log("list users");
  return axiosInstance.get('/auth/list_users')
    .then(console.log)
    .catch(console.error);
}

const fullTest = (username) => {
  testIsAuthed().then(() => { // fails
    return testCreateUser(username); // succeeds unless already created
  }).then(() => {
    return testLogin(username) // succeeds
  }).then(() => {
    return testIsAuthed(); // succeeds
  }).then(() => {
    return testIsAuthedAsUser(username); // succeeds
  }).then(() => {
    return testIsAuthedAsUser('admin'); // fails
  }).then(() => {
    return testUpdate(username); // succeeds
  }).then(() => {
    return testUpdate('admin'); // fails
  }).then(() => {
    return testListUsers(); // fails
  }).then(() => {
    return testLogin("admin"); // succeeds (fails unless password is changed to correct one)
  }).then(() => {
    return testUpdate("mazer1010"); // succeeds
  }).then(() => {
    return testListUsers(); // succeeds
  });
}

module.exports = {
  fullTest,

  testCreateUser,
  testLogin,
  testIsAuthed,
  testIsAuthedAsUser,
  testUpdate,
  testListUsers,
};
