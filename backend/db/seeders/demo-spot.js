'use strict';

const { Spot } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Spot.bulkCreate([{
      address: '123 Disney Lane',
      city: 'San Francisco',
      state: 'California',
      country: 'United States of America',
      lat: 37.7645358,
      lng: -122.4730327,
      name: 'App Academy',
      description: 'Place where web developers are created',
      price: 123,
      ownerId: 1,  // 确保此用户ID在 Users 表中存在
      createdAt: new Date(),
      updatedAt: new Date()
    }], { validate: true });
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'Spots';
    return queryInterface.bulkDelete(options, null, {});
  }
};
