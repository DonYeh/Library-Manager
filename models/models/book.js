'use strict';
module.exports = function(sequelize, DataTypes) {
  var Book = sequelize.define('Book', {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true 
    },
    title: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: "Title is required"
        }
      }
    },
    author: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: "Author is required"
        }
      }
    },
    genre: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: "Genre is required"
        }
      }
    },
    first_published: {
      type: DataTypes.INTEGER,
      validate: {
        isInt: {
          msg: "Please enter the first published year with yyyy format"
        }
      }
    }
  }, {
    classMethods: {
      associate: function(models) {
        Book.hasMany(models.Loan, {foreignKey: 'book_id'});
      }
    },
    timestamps: false
  });

  return Book;
};
