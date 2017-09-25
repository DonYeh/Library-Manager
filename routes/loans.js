var express = require('express');
var router = express.Router();

var Book = require("../models").Book;
var Patron = require("../models").Patron;
var Loan = require("../models").Loan;

var moment = require('moment');

//TODO: Update functions

// GET /patrons - List All Patrons
router.get('/', function(req, res) {
    Loan.belongsTo(Book, {foreignKey: 'book_id'});
    Loan.belongsTo(Patron, {foreignKey: 'patron_id'});
    Loan.findAll({include: [
        {model: Book, required: true},
        {model: Patron, required: true}]}).then(function(loans) {
        res.render('all_loans', {loans: loans})
    });
});


//get all loans with a return date less than today
router.get('/overdue_loans', function(req, res){
    Loan.belongsTo(Book, {foreignKey: 'book_id'});
    Loan.belongsTo(Patron, {foreignKey: 'patron_id'});
    var date = moment();
    Loan.findAll({include: [
        {model: Book, required: true},
        {model: Patron, required: true}
        ],
        where: { return_by: {$lt: date},
        returned_on: {$eq: null}
        }}).then(function(loans) {
        res.render('overdue_loans', {loans: loans})
    });
});

//get all loans currently checked out with no return date
router.get('/checked_loans', function(req, res){
    Loan.belongsTo(Book, {foreignKey: 'book_id'});
    Loan.belongsTo(Patron, {foreignKey: 'patron_id'});
    Loan.findAll({include: [
        {model: Book, required: true},
        {model: Patron, required: true}
        ],
        where: { returned_on: {$eq: null}}}).then(function(loans) {
        res.render('checked_loans', {loans: loans})
    });
});

//new loan route
router.post('/new', function(req, res, next){
    Loan.create(req.body).then(function(){
        res.redirect("/all_loans");
    }).catch(function(err) {
		if(err.name === "SequelizeValidationError") {
			res.render('new_loan', {
				loan: Loan.build(req.body),
				errors: err.errors
			});
		} else {
			  throw err;
		}
	});
});

//create a brand new loan
router.get('/new_loan', function(req, res) {
    //TODO: Figure out why date isn't in proper format.

    Book.findAll().then(function(books){
        Patron.findAll().then(function(patrons){
            var loanedOn = moment().format('YYYY-MM-DD');
            var returnDate = moment().add('7', 'days').format('YYYY-MM-DD');

            res.render('new_loan', {books: books, patrons: patrons, loanedOn: loanedOn, returnDate: returnDate})
        });
    });

});

// // GET /patrons/:id - Individual Patron detail and Loan History
// router.get('/return_book/:id', function(req, res, next) {
// 	Loan.findById(req.params.id).then(function(loan) {
// 		Loan.belongsTo(Book, {foreignKey: 'book_id'});
// 		Loan.belongsTo(Patron, {foreignKey: 'patron_id'});
// 		Loan.findAll({
// 			include: [
// 					  {model: Book,required: true}, 
// 					  {model: Patron,required: true}
// 			],
// 			where: {
// 				patron_id: req.params.id
// 			}
// 		}).then(function(data) {
// 			res.render('patron_detail', {patron: patron, loans: data});
// 		}).catch(function(err) {
//     		res.sendStatus(500);
//   		});
		
// 	});
// });

// //PUT /loans/:id - Return Book - Update 
// router.put('/return_book/:id', function(req, res, next) {
// 	Loan.findById(req.params.id).then(function(loan) {
// 		return loan.update(req.body);
// 	}).then(function() {
// 		res.redirect('/all_loans');
// 	}).catch(function(err) {
// 		/*
// 		 * If required fields are not there, show error
// 		 */
// 		if(err.name === "SequelizeValidationError") {
// 			Loan.belongsTo(Book, {foreignKey: 'book_id'});
// 			Loan.belongsTo(Patron, {foreignKey: 'patron_id'});
//       // find loan history
// 			Loan.findAll({
// 				include: [
// 					{model: Book, required: true}, 
// 					{model: Patron, required: true}
// 				],
// 				where: {
// 					patron_id: req.params.id
// 				}
// 			}).then(function(data) {
// 				req.body.id = req.params.id;
// 				res.render('/all_books/book_detail', {
// 					book: req.body, 
// 					loans: data,
// 					errors: err.errors
// 				});
// 			}).catch(function(err) {
//     			res.sendStatus(500);
//   			}); // End of Loan.findAll
// 		} else {
// 			throw err;
// 		} // End If
// 	});
// });


// //GET /loans/:id - Return Book
// router.get('/return_book/:id', function(req, res, next) {
// 	Loan.belongsTo(Book, {foreignKey: 'book_id'});
// 	Loan.belongsTo(Patron, {foreignKey: 'patron_id'});
// 	Loan.findAll({
// 			where: {id: {$eq: req.params.id}},
// 			include: [
// 				  		{model: Book,required: true}, 
// 				  		{model: Patron,required: true}
// 				 	 ]
// 		}).then(function(data) {
// 			res.render('return_book', {
// 				loan: data,
// 				returned_on: moment().format('YYYY-MM-DD')
// 			});
// 		}).catch(function(err) {
//     		res.sendStatus(500);
//   		});
// });

// //PUT /loans/:id - Return Book - Update 
// router.put('/return_book/:id', function(req, res, next) {
// 	Loan.findById(req.params.id).then(function(loan) {
// 		return loan.update(req.body);
// 	}).then(function() {
// 		res.redirect('/all_loans');
// 	}).catch(function(err) {
//     	res.sendStatus(500);
//   	});
// });



module.exports = router;



