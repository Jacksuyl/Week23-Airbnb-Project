'use strict';

module.exports = {
 async up (queryInterface, Sequelize)  {
    await queryInterface.bulkInsert('SpotImages', [{
      spotId: 1,
      url: 'https://example.com/image.jpg',
      preview: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('SpotImages', null, {});
  }
};
