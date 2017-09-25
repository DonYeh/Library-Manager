'use strict';
module.exports = function(sequelize, DataTypes) {
  var Loan = sequelize.define('Loan', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    book_id: DataTypes.INTEGER,
    patron_id: DataTypes.INTEGER,
    loaned_on: DataTypes.DATE,
    return_by: DataTypes.DATE,
    returned_on: DataTypes.DATE
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    },
    timestamps: false, 

    instanceMethods : {
      loanedOn: function() {
        return dateFormat(this.loaned_on, "yyyy-mm-dd");
      },
      returnBy: function() {
        return dateFormat(this.return_by, "yyyy-mm-dd");
      },
      returnedOn: function() {
      return dateFormat(this.returned_on, "yyyy-mm-dd");
      }
    }
  });
   return Loan;
};