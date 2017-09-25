var express = require('express');
var router = express.Router();

var Book = require("../models").Book;
var Patron = require("../models").Patron;
var Loan = require("../models").Loan;

var moment = require('moment');


// GET all books
router.get('/', function (req, res) {
    Book.findAll().then(function(books){
        res.render('all_books', {books: books})
    });
});

// GET new books
router.get('/new_book', function(req, res, next){
    res.render('new_book', {book: Book.build()})
});

// POST new book
router.post('/new', function(req, res){
    Book.create(req.body).then(function(){
        res.redirect("/all_books");
    }).catch(function(err) {
		if(err.name === "SequelizeValidationError") {
			res.render('new_book', {
				book: Book.build(req.body),
				errors: err.errors
			});
		} else {
			  throw err;
		}
	});
});

// // GET book details by ID
// router.get('/return_book/:id', function(req, res){
//     var date = moment().format('YYYY-MM-DD');
//     Loan.belongsTo(Book, {foreignKey: 'book_id'});
//     Loan.belongsTo(Patron, {foreignKey: 'patron_id'});
//     Book.findById(req.params.id).then(function(book){
//         Loan.findOne({include: [
//             {model: Book, required: true},
//             {model: Patron, required: true}],
//             where: { book_id: book.id}}).then(function(loan){
//             res.render('return_book', {date: date, loan: loan})
//         });
//     });
// });

// // Update the loan
// router.put('/return_book/:id', function(req, res, next) {
//     Loan.belongsTo(Book, {foreignKey: 'book_id'});
//     Loan.belongsTo(Patron, {foreignKey: 'patron_id'});
//     Book.findById(req.params.id).then(function(book) {
//         //identify the loan
//         Loan.findOne({
//             include: [
//                 {model: Book, required: true},
//                 {model: Patron, required: true}],
//             where: {book_id: book.id}
//         }).then(function (loan) {
//             return loan.update(req.body);
//         }).then(function (loan) {
//             // if(req.params.location == 1){
//                 //res.redirect('/all_patrons/patron_detail/' + loan.patron_id)
//                 res.redirect('/all_loans/')
//             //}
            
//             // res.redirect('/all_loans/')
//             // //res.redirect('/all_patrons/patron_detail/' + loan.patron_id)
//             // }).catch(function(err) {
//             //     res.sendStatus(500);
//             // });
//         });
//     });
// });


// GET book details by ID
router.get('/return_book/:id', function(req, res){
    var date = moment().format('YYYY-MM-DD');
    Loan.belongsTo(Book, {foreignKey: 'book_id'});
    Loan.belongsTo(Patron, {foreignKey: 'patron_id'});
    Book.findById(req.params.id).then(function(book){
        Loan.findOne({include: [
            {model: Book, required: true},
            {model: Patron, required: true}],
            where: { book_id: book.id}}).then(function(loan){
            res.render('return_book', {date: date, loan: loan})
        });
    });
});

// Update the loan
router.put('/return_book/:id/:location', function(req, res, next) {
    Loan.belongsTo(Book, {foreignKey: 'book_id'});
    Loan.belongsTo(Patron, {foreignKey: 'patron_id'});
    Book.findById(req.params.id).then(function(book) {
        //identify the loan
        Loan.findOne({
            include: [
                {model: Book, required: true},
                {model: Patron, required: true}],
            where: {book_id: book.id}
        }).then(function (loan) {
            return loan.update(req.body);
        }).then(function (loan) {
             if(req.params.location == 1){
                //res.redirect('/all_patrons/patron_detail/' + loan.patron_id)
                res.redirect('/all_loans/')
            }
            
            // res.redirect('/all_loans/')
            // //res.redirect('/all_patrons/patron_detail/' + loan.patron_id)
            // }).catch(function(err) {
            //     res.sendStatus(500);
            //  });
        });
    });
});




//checked out books
router.get('/checked_books', function(req, res){
    Loan.belongsTo(Book, {foreignKey: 'book_id'});
    Loan.findAll({include: [
        {model: Book, required: true}],
        where: { returned_on: {$eq: null}}}).then(function(loans) {
        res.render('checked_books', {loans: loans})
    });
});


//overdue books
router.get('/overdue_books', function(req, res) {
    Loan.belongsTo(Book, {foreignKey: 'book_id'});
    var date = moment();
    Loan.findAll({include: [
        {model: Book, required: true}],
        where: { return_by: {$lt: date},
        returned_on: {$eq: null}}}).then(function(loans) {
        res.render('overdue_books', {loans: loans})
    });
});


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


// Update Book
router.put('/book_detail/:id', function(req, res, next) {
    Book.findById(req.params.id).then(function(book) {
        return book.update(req.body);
    }).then(function() {
        res.redirect('/all_books/');
    }).catch(function(err) {
        /*
            * If required fields are not there, show error
            */
        if(err.name === "SequelizeValidationError") {

            /*
                * Set Associations
                */
            Loan.belongsTo(Book, {foreignKey: 'book_id'});
            Loan.belongsTo(Patron, {foreignKey: 'patron_id'});

            /*
                * Query again to get loan History of book
                */
            Loan.findAll({
                include: [
                    {model: Book,required: true}, 
                    {model: Patron,required: true}
                ],
                where: {
                    book_id: req.params.id
                }
            }).then(function(data) {
        
                req.body.id = req.params.id;
                res.render('all_books/book_detail', {
                    book: req.body, 
                    loans: data,
                    errors: err.errors
                }); // End of res.render 
            }).catch(function(err) {
                res.sendStatus(500);
                }); // End of Loans.findAll
        } else {
            throw err;
        } // End If
    });
});
   


module.exports = router;
