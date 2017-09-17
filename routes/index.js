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
        db.collection('lists').updateMany({order: {$gte: newIndex}}, {$inc: {order: 1}}, function (err, result) { // If yes, update then insert
            assert.equal(null, err);
            console.log('Index updated');
            db.collection('lists').updateOne({title: req.body.title}, {$set: {order: newIndex}}, function (err, res) { // If no just insert
                assert.equal(null, err);
                console.log('List Inserted');
                db.close();
            });
        });
        res.redirect('/');
    });
});

router.post('/editlist/:listId', function(req, res, next) {
    mongo.connect(url, function (err, db) {
        var newIndex = parseInt(req.body.order, 10);
        db.collection('lists').updateMany({order: {$gte: newIndex}}, {$inc: {order: 1}}, function (err, result) { // Update order of all following lists then insert
            assert.equal(null, err);
            console.log('Index updated');
            db.collection('lists').updateOne({title: req.body.title}, {$set: {order: newIndex}}, function (err, res) { // Update specified list
                assert.equal(null, err);
                console.log('List Inserted');
                db.collection('lists').find().sort({order: 1});
                console.log('List Sorted');
                db.close();
            });
        });
        res.redirect('/');
    });
});

module.exports = router;
