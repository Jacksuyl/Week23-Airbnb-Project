'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Bookings', [
      {
        spotId: 1,
        userId: 1,
        startDate: '2021-11-19',
        endDate: '2021-11-20',
       
      },
      {
        spotId: 2,
        userId: 2,
        startDate: '2021-12-01',
        endDate: '2021-12-05',
   
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Bookings', null, {});
  }
};
