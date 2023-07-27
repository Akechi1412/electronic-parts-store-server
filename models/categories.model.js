const { pool } = require('./db');
const { getOffset } = require('../helper');
const config = require('../config');

const Categories = {
  create: (data, callback) => {
    const queryString = `INSERT INTO category(name, parent_id, slug, thumbnail, created_at, updated_at)
                          VALUE(?, ?, ?, ?, ?, ?)`;
    pool.query(
      queryString,
      [data.name, data.parentId, data.slug, data.thumbnail, data.createdAt, data.updatedAt],
      (error, results, fields) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results);
      }
    );
  },
  getMultiple: (query, callback) => {
    const { page, limit, name } = query;
    const queryString = `SELECT C.id C.name P.name C.slug C.thumbnail C.created_at C.updated_at
        FROM category E LEFT OUTER JOIN category P ON E.parrent_id = P.id`;
    if (page) {
      if (!limit) limit = config.limit;
      const offset = getOffset(page, limit);
      queryString += ` LIMIT ${offset}, ${limit}`;
    }
    if (name) {
      queryString += ` WHERE name LIKE '${name}'`;
    }

    pool.query(queryString, [], (error, results, fields) => {
      if (error) {
        return callback(error);
      }
      return callback(null, results);
    });
  },
};

module.exports = Categories;
