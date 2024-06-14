'use strict';

const { ReviewImage } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return ReviewImage.bulkCreate([{
      reviewId: 1,
      url: 'https://example.com/image1.jpg',
  
    }, {
      reviewId: 2,
      url: 'https://example.com/image2.jpg',

    }], { validate: true });
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'ReviewImages';
    return queryInterface.bulkDelete(options, null, {});
  }
};
