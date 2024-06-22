const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize.config');

const Course = sequelize.define(
  'Course',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    thumbnail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER, // Use INTEGER for duration in minutes
      allowNull: false,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2), // Ensure the rating is a decimal value between 0 and 5
      allowNull: false,
      validate: {
        min: 0,
        max: 5,
      },
    },
    enrolled: {
      type: DataTypes.INTEGER, // Use INTEGER for the number of enrolled students
      allowNull: false,
      defaultValue: 0, // Default value is 0
    },
    price: {
      type: DataTypes.DECIMAL(10, 2), // Use DECIMAL for the price with 2 decimal places
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: 'courses',
  }
);

Course.sync();

module.exports = Course;
