const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  "development": {
    "username": "reacttest",
    "password": process.env.DB_PASSWORD,
    "database": "react_nodebird",
    "host": "192.168.219.100",
    "dialect": "mysql",
    "operatorsAliases": false
  },
  "test": {
    "username": "reacttest",
    "password": process.env.DB_PASSWORD,
    "database": "react_nodebird",
    "host": "192.168.219.100",
    "dialect": "mysql",
    "operatorsAliases": false
  },
  "production": {
    "username": "reacttest",
    "password": process.env.DB_PASSWORD,
    "database": "react_nodebird",
    "host": "192.168.219.100",
    "dialect": "mysql",
    "operatorsAliases": false
  },
};
