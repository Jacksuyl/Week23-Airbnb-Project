'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Spots', [{
      address: '123 Disney Lane',
      city: 'San Francisco',
      state: 'California',
      country: 'United States of America',
      lat: 37.7645358,
      lng: -122.4730327,
      name: 'App Academy',
      description: 'Place where web developers are created',
      price: 123,
      ownerId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Spots', null, {});
  }
};
