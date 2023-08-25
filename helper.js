const { sign } = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');

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
  if (!str?.trim()) {
    return '';
  }

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

async function sendVerifyEmail(email, id) {
  if (typeof email !== 'string' || email.trim().length === 0) {
    throw new Error('Email is not found');
  }

  const myOAuth2Client = InitOAuth2Client();
  const myAccessTokenObject = await myOAuth2Client.getAccessToken();
  const myAccessToken = myAccessTokenObject?.token;
  console.log(myAccessToken);
  const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.ADMIN_EMAIL_ADDRESS,
      clientId: process.env.GOOGLE_MAILER_CLIENT_ID,
      clientSecret: process.env.GOOGLE_MAILER_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_MAILER_REFRESH_TOKEN,
      accessToken: myAccessToken,
    },
  });
  const url = `${process.env.CLIENT_HOST}/verify-email?id=${id}`;
  const mailOptions = {
    to: email,
    subject: '[ELECTRONIC PARTS STORE] Verify your email',
    html: `<h3>Xác thực email của bạn</h3>
        <p>Vui lòng truy cập vào đường dẫn sau và xác thực email để đăng nhập: <a href=${url}>EPS Verify Email</a></p>
      `,
  };
  // Send email
  await transport.sendMail(mailOptions);
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
  sendVerifyEmail,
  // generateRefreshToken,
};
