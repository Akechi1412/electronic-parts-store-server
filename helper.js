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
    .substring(2, length + 2);
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

function toSlug(str) {
  str = str.toLowerCase();
  str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  str = str.replace(/[đĐ]/g, 'd');
  str = str.replace(/([^0-9a-z-\s])/g, '');
  str = str.replace(/(\s+)/g, '-');
  str = str.replace(/-+/g, '-');
  str = str.replace(/^-+|-+$/g, '');
  return str;
}

function createUsernameFromEmail(email) {
  const randomString = createRandomString(4);
  return email.split('@')[0].replace(/[^a-zA-Z]+/g, '') + randomString;
}

function createFilterQuery(filter, tableName) {
  const filterKeys = Object.keys(filter);
  if (filterKeys.length > 0) {
    const conditions = filterKeys.map((key) => {
      if (key.endsWith('_like')) {
        const fieldName = key.substring(0, key.length - 5);
        return `${tableName}.${fieldName} LIKE '%${filter[key]}%'`;
      } else if (key.endsWith('_gt')) {
        const fieldName = key.substring(0, key.length - 3);
        return `${tableName}.${fieldName} > '${filter[key]}'`;
      } else if (key.endsWith('_lt')) {
        const fieldName = key.substring(0, key.length - 3);
        return `${tableName}.${fieldName} < '${filter[key]}'`;
      } else if (key.endsWith('_gte')) {
        const fieldName = key.substring(0, key.length - 4);
        return `${tableName}.${fieldName} >= '${filter[key]}'`;
      } else if (key.endsWith('_lte')) {
        const fieldName = key.substring(0, key.length - 4);
        return `${tableName}.${fieldName} <= '${filter[key]}'`;
      } else if (key.endsWith('_ne')) {
        const fieldName = key.substring(0, key.length - 3);
        return `${tableName}.${fieldName} <> '${filter[key]}'`;
      } else {
        return `${tableName}.${key} = '${filter[key]}'`;
      }
    });
    return `WHERE ${conditions.join(' AND ')}`;
  }
  return '';
}

module.exports = {
  getOffset,
  emptyOrRows,
  createRandomString,
  generateAccessToken,
  generateResetPasswordToken,
  InitOAuth2Client,
  toSlug,
  createUsernameFromEmail,
  createFilterQuery,
  // generateRefreshToken,
};
