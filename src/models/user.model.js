const { Sequelize, Model, DataTypes } = require('sequelize');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ServerConfig = require('../config/server.config');
const sequelize = require('../config/sequelize.config');
const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    googleId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
      field: 'google_id',
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'full_name',
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(60),
      allowNull: true, // Allow null for now
      defaultValue: null, // Set default value to null
    },
    phone: {
      type: DataTypes.STRING(10),
      allowNull: true, // Allow null for now
      defaultValue: null, // Set default value to null
      unique: true,
      validate: {
        len: [10, 10], // Ensure the length is exactly 10 characters if provided
      },
    },
  },
  {
    timestamps: true,
    tableName: 'users',
    hooks: {
      beforeCreate: async (user, options) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user, options) => {
        console.log(user);
        if (!user.changed('password')) {
          // If the password is not changed, skip the hashing process
          return; // No need to call next()
        }
        try {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(user.password, salt);
          user.password = hashedPassword;
        } catch (error) {
          throw new Error('Error hashing password: ' + error.message);
          // If an error occurs, throw it to indicate a failure
        }
      },
    },
  }
);

User.sync();

User.prototype.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

User.prototype.generateAccessToken = async function () {
  return await jwt.sign(
    {
      id: this.id,
      email: this.email,
      fullName: this.firstName + ' ' + this.lastName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

module.exports = User;
