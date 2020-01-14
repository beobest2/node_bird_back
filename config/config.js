const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  "development": {
    "username": "reacttest",
    "password": process.env.DB_PASSWORD,
    "database": "react_nodebird",
    "host": process.env.DB_HOST,
    "dialect": "mysql",
    "operatorsAliases": false
  },
  "test": {
    "username": "reacttest",
    "password": process.env.DB_PASSWORD,
    "database": "react_nodebird",
    "host": process.env.DB_HOST,
    "dialect": "mysql",
    "operatorsAliases": false
  },
  "production": {
    "username": "reacttest",
    "password": process.env.DB_PASSWORD,
    "database": "react_nodebird",
    "host": process.env.DB_HOST,
    "dialect": "mysql",
    "operatorsAliases": false
  },
};
