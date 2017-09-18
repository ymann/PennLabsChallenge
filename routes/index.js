var express = require('express');
var router = express.Router();
var mongo = require('mongodb').MongoClient;
var assert = require('assert');

var url = 'mongodb://localhost:27017/trello';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Yonah@Penn' });
});

router.get('/get-data', function(req, res, next) {
    var listsArray = [];
    var cardsArray = [];
    mongo.connect(url, function(err, db) {
        assert.equal(null, err);
        var cursor = db.collection('lists').find();
        var cursor2 = db.collection('cards').find();
        cursor2.forEach(function(doc, err) {
            assert.equal(null, err);
            cardsArray.push(doc);
        });
        cursor.forEach(function(doc, err) {
            assert.equal(null, err);
            listsArray.push(doc);
        }, function() {
            db.close();
            res.render('index', {lists: listsArray, carts: cardsArray});
        });
    });
});

// For debugging purposes: sends to generic update URL. See below router (/:listid) for correct access to update
router.post('/editlist', function(req, res, next) {
    mongo.connect(url, function (err, db) {
        var newIndex = parseInt(req.body.order, 10);
        db.collection('lists').count({}, function (err, numDocs) {
            newIndex = (numDocs < newIndex) ? numDocs : newIndex;
        });
        db.collection('lists').findOne({title: req.body.title}, function(err, res) { // Get doc to be updated
            if (res == null || res.order == null) { // Check if title is incorrect or no number was given
                return;
            } else {
                /*
                We adjust the order of the affected lists as follows:
                If the updated list moves up in order (the order number goes down), we push everything between the old and new order values up one.
                If the updated list moves down in order, we push everything between the old and new values down one.
                 */
                if (newIndex <= res.order) {
                    db.collection('lists').updateMany({
                        $and:
                            [{order: {$gte: newIndex}}, // Adjust lists with indices greater than new index
                                {order: {$lte: res.order}}] // Don't adjust those not being affected by move
                    }, {$inc: {order: 1}}, {upsert: false}, function (err, result) {
                        assert.equal(null, err);
                        console.log('Index updated');
                        db.collection('lists').updateOne({title: req.body.title}, {$set: {order: newIndex}}, {upsert: false}, function (err, res) { // If no just insert
                            assert.equal(null, err);
                            console.log('List Inserted');
                            db.close();
                        });
                    });
                } else {
                    db.collection('lists').updateMany({
                        $and:
                            [{order: {$lte: newIndex}}, // Adjust lists with indices less than or equal to the new index
                                {order: {$gte: res.order}}] // Don't adjust those not being affected by move
                    }, {$inc: {order: -1}}, {upsert: false}, function (err, result) {
                        assert.equal(null, err);
                        console.log('Index updated');
                        db.collection('lists').updateOne({title: req.body.title}, {$set: {order: newIndex}}, {upsert: false}, function (err, res) { // If no just insert
                            assert.equal(null, err);
                            console.log('List Inserted');
                            db.close();
                        });
                    });
                }
            }
        });
        res.redirect('/');
    });
});

router.post('/editlist/:listId', function(req, res, next) {
    mongo.connect(url, function (err, db) {
        var newIndex = parseInt(req.body.order, 10);
        db.collection('lists').count({}, function (err, numDocs) {
            newIndex = (numDocs < newIndex) ? numDocs : newIndex;
        });
        db.collection('lists').findOne({title: req.body.title}, function(err, res) { // Get doc to be updated
            if (res == null || res.order == null) { // Check if title is incorrect or no number was given
                return;
            } else {
                /*
                We adjust the order of the affected lists as follows:
                If the updated list moves up in order (the order number goes down), we push everything between the old and new order values up one.
                If the updated list moves down in order, we push everything between the old and new values down one.
                 */
                if (newIndex <= res.order) {
                    db.collection('lists').updateMany({
                        $and:
                            [{order: {$gte: newIndex}}, // Adjust lists with indices greater than new index
                                {order: {$lte: res.order}}] // Don't adjust those not being affected by move
                    }, {$inc: {order: 1}}, {upsert: false}, function (err, result) {
                        assert.equal(null, err);
                        console.log('Index updated');
                        db.collection('lists').updateOne({title: req.body.title}, {$set: {order: newIndex}}, {upsert: false}, function (err, res) { // If no just insert
                            assert.equal(null, err);
                            console.log('List Inserted');
                            db.close();
                        });
                    });
                } else {
                    db.collection('lists').updateMany({
                        $and:
                            [{order: {$lte: newIndex}}, // Adjust lists with indices less than or equal to the new index
                                {order: {$gte: res.order}}] // Don't adjust those not being affected by move
                    }, {$inc: {order: -1}}, {upsert: false}, function (err, result) {
                        assert.equal(null, err);
                        console.log('Index updated');
                        db.collection('lists').updateOne({title: req.body.title}, {$set: {order: newIndex}}, {upsert: false}, function (err, res) { // If no just insert
                            assert.equal(null, err);
                            console.log('List Inserted');
                            db.close();
                        });
                    });
                }
            }
        });
        res.redirect('/');
    });
});

module.exports = router;
