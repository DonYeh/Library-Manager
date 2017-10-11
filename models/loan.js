'use strict';
module.exports = function(sequelize, DataTypes) {
  var Loan = sequelize.define('Loan', {
    id: { type: DataTypes.INTEGER, 
          primaryKey: true
    },
    book_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    patron_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    loaned_on: {
      type: DataTypes.DATEONLY,
      validate: {
        notEmpty: {
          msg: 'Loaned On Date is required.'
        },
        isDate: {
          msg: 'Loaned On Date must be a valid date in the format; YYYY-MM-DD'
        }
      }
    },
    return_by: {
      type: DataTypes.DATEONLY,
      validate: {
        notEmpty: {
          msg: 'Return By Date is required.'
        },
        isDate: {
          msg: "Please enter a return by date"
        }
      }
    },
    returned_on: {
      type: DataTypes.DATEONLY,
      validate: {
        isDate: {
          msg: "Please enter a returned on date"
        }
      }
    }
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined 
        
        Loan.belongsTo(models.Patron, {foreignKey: 'patron_id'});
        Loan.belongsTo(models.Book, {foreignKey: 'book_id'});

      }
    },
    timestamps: false 

    // instanceMethods : {
    //   loanedOn: function() {
    //     return dateFormat(this.loaned_on, "yyyy-mm-dd");
    //   },
    //   returnBy: function() {
    //     return dateFormat(this.return_by, "yyyy-mm-dd");
    //   },
    //   returnedOn: function() {
    //   return dateFormat(this.returned_on, "yyyy-mm-dd");
    //   }
    // }
  });
   return Loan;
};