'use strict';

const { Review } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Review.bulkCreate([{
      userId: 1,  // 确保此用户ID在 Users 表中存在
      spotId: 1,  // 确保此 Spot ID 在 Spots 表中存在
      review: 'Great place to stay!',
      stars: 5,
      createdAt: new Date(),
      updatedAt: new Date()
    }], { validate: true });
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'Reviews';
    return queryInterface.bulkDelete(options, null, {});
  }
};

