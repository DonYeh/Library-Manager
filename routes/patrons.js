var express = require('express');
var router = express.Router();

var Book = require("../models").Book;
var Patron = require("../models").Patron;
var Loan = require("../models").Loan;

var moment = require('moment');


// GET /patrons - List All Patrons
router.get('/', function(req, res, next) {
	Patron.findAll().then(function(patrons) {
    	res.render('all_patrons', {patrons: patrons});
	});
});

// GET /patrons/new - New Patron
router.get('/new_patron', function(req, res, next) {
	res.render('new_patron', {patron : Patron.build()});
});

// POST /patrons - Create New Patron
router.post('/new', function(req, res, next) {
	Patron.create(req.body).then(function(patron) {
		res.redirect('/all_patrons');
	}).catch(function(err) {
		if(err.name === "SequelizeValidationError") {
			res.render('new_patron', {
				patron: Patron.build(req.body),
				errors: err.errors
			});
		} else {
			  throw err;
		}
	});
});

// GET /patrons/:id - Individual Patron detail and Loan History
router.get('/patron_detail/:id', function(req, res) {
	Loan.belongsTo(Book, {foreignKey: 'book_id'});
	Loan.belongsTo(Patron, {foreignKey: 'patron_id'});
	Patron.findById(req.params.id).then(function(patron) {
		
		Loan.findAll({
			include: [
					  {model: Book,required: true}, 
					  {model: Patron,required: true}
			],
			where: {
				patron_id: patron.id
			}
		}).then(function(loans) {
			res.render('patron_detail', {patron: patron, loans: loans});
		}).catch(function(err) {
    		res.sendStatus(500);
  		});
		
	});
});

// PUT /patrons/:id - Update Patron
router.put('/patron_detail/:id', function(req, res, next) {
	Patron.findById(req.params.id).then(function(patron) {
		return patron.update(req.body);
	}).then(function() {
		res.redirect('/all_patrons');
	}).catch(function(err) {
		/*
		 * If required fields are not there, show error
		 */
		if(err.name === "SequelizeValidationError") {
			Loan.belongsTo(Book, {foreignKey: 'book_id'});
			Loan.belongsTo(Patron, {foreignKey: 'patron_id'});
      // find loan history
			Loan.findAll({
				include: [
					{model: Book, required: true}, 
					{model: Patron, required: true}
				],
				where: {
					patron_id: req.params.id
				}
			}).then(function(data) {
				req.body.id = req.params.id;
				res.render('/all_patrons/patron_detail', {
					patron: req.body, 
					loans: data,
					errors: err.errors
				});
			}).catch(function(err) {
    			res.sendStatus(500);
  			}); // End of Loan.findAll
		} else {
			throw err;
		} // End If
	});
});


module.exports = router;

