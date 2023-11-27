const fs = require('fs');

// User data to be added to the file
const userData = {
  username: 'your_username',
  password: 'your_password',
  email: 'your_email@example.com'
};

// Convert the user data to a JSON string
const userDataString = JSON.stringify(userData);

// Specify the file path
const filePath = 'database/model.txt';

// Write the user data to the file
fs.writeFile(filePath, userDataString, (err) => {
  if (err) {
    console.error('Error writing to file:', err);
  } else {
    console.log('User data has been written to the file.');
  }
});
