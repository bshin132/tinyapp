function generateRandomString(len, arr) {
  let result = '';
  for (let i = len; i > 0; i--) {
      result += arr[Math.floor(Math.random() * arr.length)];
  }
  return result;
}

const getUserByEmail = (users, email) => {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }

};

const urlsForUser = (userID, urlDatabase) => {
  const urls = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === userID) {
      urls[key] = urlDatabase[key];
    }
  }
  return urls;
};

module.exports = {generateRandomString, getUserByEmail, urlsForUser}