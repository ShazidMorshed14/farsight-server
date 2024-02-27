const bcrypt = require("bcrypt");

function generateUniqueCode() {
  let characters = "0123456789";
  let code = "";

  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
    characters =
      characters.slice(0, randomIndex) + characters.slice(randomIndex + 1);
  }

  return code;
}

function generateHashedPassword(password) {
  return (hashedPassword = bcrypt.hashSync(password, 10));
}

function formatPhoneNumber(phoneNumber) {
  if (phoneNumber.startsWith("+")) {
    return phoneNumber.substring(1); // Remove the leading "+"
  }
  if (phoneNumber.startsWith("0")) {
    return "+880" + phoneNumber.substring(1); // Remove the leading 0 and add +880
  }
  return phoneNumber;
}

const userWeight = {
  super_admin: 10,
  admin: 8,
  vendor: 4,
  user: 2,
};

const isArrayAndHasContent = (arr) => {
  return Array.isArray(arr) && arr.length > 0;
};

module.exports = {
  generateUniqueCode,
  generateHashedPassword,
  formatPhoneNumber,
  userWeight,
  isArrayAndHasContent,
};
