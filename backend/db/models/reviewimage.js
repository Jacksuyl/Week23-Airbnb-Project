'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ReviewImage extends Model {
    static associate(models) {
      // define association here
      ReviewImage.belongsTo(models.Review, { foreignKey: 'reviewId' });
    }
  }
  ReviewImage.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    reviewId: { // 外键字段
      type: DataTypes.INTEGER,
      references: { model: 'Reviews', key: 'id' },
      onDelete: 'CASCADE',
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'ReviewImage',
  });
  return ReviewImage;
};
