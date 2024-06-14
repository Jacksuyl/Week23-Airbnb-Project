'use strict';

const { Review } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}
//options.tableName = "Reviews";

module.exports = {
  async up(queryInterface, Sequelize) {
    await Review.bulkCreate([
      {
        
        userId: 1,
        spotId: 1,
        review: "Great place!",
        stars: 5,
       
      },
      {
      
        userId: 2,
        spotId: 2,
        review: "Loved it!",
        stars: 4,
      
      },
      {
        userId: 3,
        spotId: 1,
        review: "Not bad.",
        stars: 3,
      }
    ], { validate: true });
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Reviews';
    return queryInterface.bulkDelete(options, {}, {});
  }
};
