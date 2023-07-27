require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 8080;
// const categoriesRouter = require('./routes/categories.route');
const usersRouter = require('./routes/users.route');

// const corsOptions = {
//   origin: 'http://localhost:3000',
// };

// app.use(cors(corsOptions));

// parse requests of content-type - application json
app.use(express.json());

//parse requests of content-type - application/x-www=form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', usersRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
