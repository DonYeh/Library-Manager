var express = require('express');
var router = express.Router();

var Book = require("../models").Book;
var Patron = require("../models").Patron;
var Loan = require("../models").Loan;

var moment = require('moment');


router.get('/', function(req, res, next) {
	Patron.findAll().then(function(patronlistings){
	  if (patronlistings) {
		res.render('all_patrons', {
		  title: 'Patrons',
		  patrons: patronlistings
		});
	  } else {
		  err.status == 404;
		  return next(err);
		}
	}).catch(function(err){
	  return next(err);
	});
});


router.get('/new_patron', function(req, res, next) {
	res.render('new_patron', {
	  title: 'Create New Patron'
	});
	if (err) return next(err);
  });


// POST new patron
router.post('/new_patron', function(req, res, next) {
	Patron.create(req.body)
	.then(function(patron){
	  res.redirect('/all_patrons/');
	}).catch(function(err){
	  // if there's a validation error, re-render page with errors
	  if (err.name == 'SequelizeValidationError') {
  
		// loop over err messages
		var errMessages = [];
		for (var i=0; i<err.errors.length; i++) {
		  errMessages[i] = err.errors[i].message;
		}
  
		// maintain the completed fields of the form
		res.render('new_patron', {
		  title: 'Create New Patron',
		  patronFirstName: req.body.first_name,
		  patronLastName: req.body.last_name,
		  patronAddress: req.body.address,
		  patronEmail: req.body.email,
		  patronLibraryId: req.body.library_id,
		  patronZipCode: req.body.zip_code,
		  errors: errMessages
		}); // end render
	  } else {
				return next(err);
	  } // end else
	}); // ends catch
}); // ends post

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
	}); // end then
}); // end get

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
	}); // end catch
}); // end put


module.exports = router;

