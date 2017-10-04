
'use strict';

var express = require('express');
var router = express.Router();

var moment = require('moment');

var Book = require("../models").Book;
var Patron = require("../models").Patron;
var Loan = require("../models").Loan;


// Get all patrons
router.get('/', function(req, res, next) {
    Loan.belongsTo(Book, {foreignKey: 'book_id'});
    Loan.belongsTo(Patron, {foreignKey: 'patron_id'});
    Loan.findAll({include: [
        {model: Book, required: true},
        {model: Patron, required: true}]}).then(function(loans) {
            res.render('all_loans', {loans: loans})
    });
});

router.get('/overdue_loans', function(req, res, next) {
    Loan.findAll({
      include: [{ all: true }],
          where: { return_by: { $lt: moment().format('YYYY-MM-DD').toString() }, returned_on: null }
    }).then(function(loanlistings){
      var loansdata = JSON.parse(JSON.stringify(loanlistings));
  
      if (loanlistings) {
        res.render('overdue_loans', {
          title: 'Overdue Loans',
          loans: loansdata
        });
      } else {
        err.status == 404;
        return next(err);
      }
  
    }).catch(function(err) {
      return next(err);
    }); // end catch
  }); // ends get


  // GET checked-out loans
router.get('/checked_loans', function(req, res, next) {
    Loan.findAll({
      include: [{ all: true }],
        where: { returned_on: null }
    }).then(function(loanlistings){
      if (loanlistings) {
        res.render('checked_loans', {
          title: 'Checked-out Loans',
          loans: loanlistings
        });
      } else {
        err.status == 404;
        return next(err);
      }
    }).catch(function(err) {
      return next(err);
    });
  });
  

  // GET new loan form
router.get('/new_loan', function(req, res, next) {
  var bookdetails;
  var patrondetails;
  Book.findAll().then(function(results){
    // a single book cannot be borrowed more than once
    bookdetails = results;
  }).then(
    Patron.findAll().then(function(results){
      patrondetails = results;
    }).then(function(){
      res.render('new_loan', {
        title: 'Create New Loan',
        books: bookdetails,
        patrons: patrondetails,
        loaned_on: moment().format('YYYY-MM-DD'),
        return_by: moment().add(7, 'days').format('YYYY-MM-DD')
      });
    }).catch(function(err){
      return next(err);
    })
  );
});

// POST new loan form
router.post('/new', function(req, res, next) {
  Loan.create(req.body).then(function(loan){
    res.redirect('/all_loans');
  }).catch(function(err){
    // if validation error, re-render page with error messages
    if (err.name === 'SequelizeValidationError') {

      // loop over err messages
      var errMessages = [];
      for (var i=0; i<err.errors.length; i++) {
        errMessages[i] = err.errors[i].message;
      }

      var bookdetails;
      var patrondetails;

      Book.findAll({attributes: ['id', 'title'], order: 'title'}).then(function(results){
        bookdetails = results;
      }).then(
        Patron.findAll({
          attributes: ['id', 'first_name', 'last_name'],
          order: 'last_name'
        }).then(function(results){
          patrondetails = results;
        }).then(function(){
          res.render('new_loan', {
            title: 'Create New Loan',
            books: bookdetails,
            patrons: patrondetails,
            loaned_on: moment().format('YYYY-MM-DD'),
            return_by: moment().add(7, 'days').format('YYYY-MM-DD'),
            errors: errMessages
          });
        }) // ends then
      ); // ends then
    } else {
      // if it's not a validation error, send to middleware error handler
      return next(err);
    }
  }); // ends catch
}); // ends POST


module.exports = router;



