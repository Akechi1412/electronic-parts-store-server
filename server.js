require('dotenv').config();

const cluster = require('node:cluster');
const express = require('express');
const totalCPUs = require('os').availableParallelism();
const cors = require('cors');
const PORT = process.env.PORT || 8080;

const usersRouter = require('./routes/users.route');
const categoriesRouter = require('./routes/categories.route');
const brandsRouter = require('./routes/brands.route');
const productsRouter = require('./routes/products.route');
const importRouter = require('./routes/imports.route');

if (cluster.isPrimary) {
  console.log(`Number of CPUs is ${totalCPUs}`);
  console.log(`Primary ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < totalCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    console.log("Let's fork another worker!");
    cluster.fork();
  });
} else {
  console.log(`Worker ${process.pid} started`);

  const corsOptions = {
    origin: ['http://localhost:3000'],
  };

  const app = express();

  app.use(cors(corsOptions));

  // parse requests of content-type - application json
  app.use(express.json());

  //parse requests of content-type - application/x-www=form-urlencoded
  app.use(express.urlencoded({ extended: true }));

  app.use('/api/users', usersRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/brands', brandsRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/import', importRouter);

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}
