var express = require('express');
var router = express.Router();
var mongo = require('mongodb').MongoClient;
var assert = require('assert');

var url = 'mongodb://localhost:27017/trello';

// Inserts new list
router.post('/', function(req, res, next) {
    mongo.connect(url, function (err, db) {
        db.collection('lists').count({}, function (err, numDocs) {
            var order = numDocs + 1;
            // Create list to insert
            var list = {
                title: req.body.title,
                id: req.body.id,
                order: order,
            };
            assert.equal(null, err);
            db.collection('lists').insertOne(list, function (err, res) {
                assert.equal(null, err);
                console.log('List Inserted');
                db.close();
            });
        });
        res.redirect('/');
    });
});

// Gets data about given list
router.get('/:listId', function(req, res, next) {
    mongo.connect(url, function(err, db) {
        var returnDoc;
        assert.equal(null, err);
        var cursor = db.collection('lists').find();
        cursor.forEach(function(doc, err) {
            assert.equal(null, err);
            if(doc.id == req.params.listId) {
                returnDoc = doc;
            }
        }, function() {
            db.close();
            res.status(200).json(returnDoc);
        });
    });
});

// Deletes list
router.delete('/:listId', function(req, res) {
    var listId = req.params.listId;
    mongo.connect(url, function(err, db) {
        db.collection('lists').deleteOne({id: listId}, function (err, result) {
            assert.equal(null, err);
            console.log('Item deleted');
            db.close();
        });
    });
});

module.exports = router;
