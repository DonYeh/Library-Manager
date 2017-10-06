'use strict';

var express = require('express');
var router = express.Router();

var Book = require("../models").Book;
var Patron = require("../models").Patron;
var Loan = require("../models").Loan;

var moment = require('moment');


// GET all books
router.get('/', function (req, res, next) {
  Book.findAll().then(function(booklistings){
      if(booklistings){
          res.render('all_books', {
              title: 'Books',
              books: booklistings
      }); // end render
  } else {
      err.status == 404;
      return next (err);
    } // end else
  }).catch(function(err){
    return next(err);
  }); // end catch
}); // end get

// GET new books
router.get('/new_book', function(req, res, next){
    res.render('new_book', {
        title: 'Create New Book',
        // book: Book.build()
    }); // end render
   if (err) return next(err);
}); // end get

// POST new book
router.post('/new', function(req, res, next) {
  Book.create(req.body).then(function(){
    res.redirect('/all_books');
  }).catch(function(err){
    if (err.name === 'SequelizeValidationError') {

      // loop over err messages
      var errMessages = [];
      for (var i=0; i<err.errors.length; i++) {
        errMessages[i] = err.errors[i].message;
      }

      res.render('new_book', {
        title: 'Create New Book',
        bookTitle: req.body.title,
        bookAuthor: req.body.author,
        bookGenre: req.body.genre,
        bookPublished: req.body.first_published,
        errors: errMessages
      });
  } else {
      return next(err);
    } // end else
  }); // ends catch
}); // ends post


// Get return book form and details via loan id
router.get('/return_book/:id', function(req, res, next) {
  Loan.findById((req.params.id), {
    include: [{ all: true }],
  })
  .then(function(loandetails){
    if (loandetails) {
      loandetails.returned_on = moment().format('YYYY-MM-DD');
      res.render('return_book', {
        title: 'Return Book',
        loan: loandetails
      });
    } else {
      err.status == 404;
      return next(err);
    }
  }).catch(function(err){
    return next(err);
  });
});


// PUT or update return book using loan id
router.put('/return_book/:id', function(req, res, next) {
  Loan.findById(req.params.id).then(function(loan){
    return loan.update(req.body);
  }).then(function(loan){
    res.redirect('/all_loans/');
  }).catch(function(err){
    // if validation error, re-render page with error messages
<<<<<<< HEAD
    if (err.name === 'SequelizeValidationError') {
=======
    if (err.name == 'SequelizeValidationError') {
>>>>>>> 8361c4975cf1f7c993e8c90bd0402e1daa58aea0

      Loan.findById((req.params.id), {
        include: [{ all: true }],
      })
      .then(function(loandetails){
        // loop over err messages
        var errMessages = [];
        for (var i=0; i<err.errors.length; i++) {
          errMessages[i] = err.errors[i].message;
        }
        loandetails.returned_on = moment().format('YYYY-MM-DD');
        res.render('return_book', {
          title: 'Return Book',
          loan: loandetails,
          errors: errMessages
        });
      });
    } else {
      // if it's not a validation error, send to middleware error handler
      return next(err);
    }

  }); // ends catch
}); // end put


//find all checked out books
router.get('/checked_books', function(req, res){
  Loan.belongsTo(Book, {foreignKey: 'book_id'});
  Loan.findAll({include: [
      {model: Book, required: true}],
      where: { returned_on: {$eq: null}}}).then(function(loans) {
      res.render('checked_books', {loans: loans})
  }); // end then
}); // end get


//overdue books
router.get('/overdue_books', function(req, res, next) {
    Loan.belongsTo(Book, {foreignKey: 'book_id'});
    //edited format()
    var date = moment().format('YYYY-MM-DD');
    Loan.findAll({include: [
        {model: Book, required: true}],
        where: { return_by: {$lt: date},
        returned_on: {$eq: null}}}).then(function(booklistings) {
        if(booklistings){
            res.render('overdue_books', {
                title: 'Overdue Books',
                loans: booklistings
            });
            } else {
            err.status == 404;
            return next(err);
            }
        }).catch(function(err){
            return next(err);
        }); // end catch
}); // end get


//find the book detail, and get the history of all checkouts
router.get('/book_detail/:id', function(req, res){
        var date = moment();
        Loan.belongsTo(Book, {foreignKey: 'book_id'});
        Loan.belongsTo(Patron, {foreignKey: 'patron_id'});
        Book.findById(req.params.id).then(function(book){
            Loan.findAll({
                include: [
                    {model: Book, required: true},
                    {model: Patron, required: true}
                ],
                where: {
                    book_id: book.id
                }
            }).then(function(loans){
                res.render('book_detail', {book: book, loans: loans})
            }).catch(function(err) {
                res.sendStatus(500);
            }); //end catch()
        }); //end then(data)
}); //end router.get

// PUT or update book details form
router.put('/book_detail/:id', function(req, res, next) {
  Book.findById(req.params.id).then(function(book){
    return book.update(req.body);
  }).then(function(book){
    res.redirect('/all_books/');
  }).catch(function(err){
    // if validation error, re-render page with error messages
    if (err.name === 'SequelizeValidationError') {

      Book.findAll({
        include: [{ model: Loan, include: [{ model: Patron }] }],
        where: { id: req.params.id }
      })
      .then(function(bookdetails){

        var loansdata = JSON.parse(JSON.stringify(bookdetails));
        // loop over err messages
        var errMessages = [];
        for (var i=0; i<err.errors.length; i++) {
          errMessages[i] = err.errors[i].message;
        }

        if (bookdetails) {
          res.render('all_books/book_detail', {
            title: 'Book Details',
            book: loansdata[0],
            loans: loansdata[0].Loans,
            errors: errMessages
          });
        } else {
          err.status == 404;
          return next(err);
        }

      }).catch(function(err){
        return next(err);
      });
    } // ends if validation error
  }); // ends first catch block
}); // ends PUT



module.exports = router;
