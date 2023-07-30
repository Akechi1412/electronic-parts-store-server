const { sign } = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

function getOffset(currentPage = 1, limit) {
  return (currentPage - 1) * limit;
}

function emptyOrRows(results) {
  if (!results) {
    return [];
  }
  return results;
}

function createRandomString(length) {
  return Math.random()
    .toString(36)
    .substring(2, length - 2);
}

function generateAccessToken(id) {
  const accessToken = sign({ id }, process.env.ACCESS_SECRET_KEY, {
    algorithm: 'HS256',
    allowInsecureKeySizes: true,
    expiresIn: Number(process.env.ACCESS_EXPIRES_SECOND),
  });
  return accessToken;
}

// function generateRefreshToken(id) {
//   const refreshToken = sign({ id }, process.env.REFRESH_SECRET_KEY, {
//     algorithm: 'HS256',
//     allowInsecureKeySizes: true,
//     expiresIn: Number(process.env.REFRESH_EXPIRES_SECOND),
//   });
//   return refreshToken;
// }

function generateResetPasswordToken(email) {
  const resetPasswordToken = sign({ email }, process.env.RESET_PASSWORD_TOKEN_KEY, {
    algorithm: 'HS256',
    allowInsecureKeySizes: true,
    expiresIn: Number(process.env.RESET_PASSWORD_EXPIRES_SECOND),
  });
  return resetPasswordToken;
}

function InitOAuth2Client() {
  const GOOGLE_MAILER_CLIENT_ID = process.env.GOOGLE_MAILER_CLIENT_ID;
  const GOOGLE_MAILER_CLIENT_SECRET = process.env.GOOGLE_MAILER_CLIENT_SECRET;
  const GOOGLE_MAILER_REFRESH_TOKEN = process.env.GOOGLE_MAILER_REFRESH_TOKEN;

  const myOAuth2Client = new OAuth2Client(GOOGLE_MAILER_CLIENT_ID, GOOGLE_MAILER_CLIENT_SECRET);
  myOAuth2Client.setCredentials({
    refresh_token: GOOGLE_MAILER_REFRESH_TOKEN,
  });

  return myOAuth2Client;
}

module.exports = {
  getOffset,
  emptyOrRows,
  createRandomString,
  generateAccessToken,
  generateResetPasswordToken,
  InitOAuth2Client,
  // generateRefreshToken,
};
