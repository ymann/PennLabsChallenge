var express = require('express');
var router = express.Router();
var mongo = require('mongodb').MongoClient;
var assert = require('assert');

var url = 'mongodb://localhost:27017/trello';

router.post('/', function(req, res, next) {
    var cart = {
        title: req.body.title,
        description: req.body.description,
        listId: req.body.listId,
        id: req.body.id,
    };

    mongo.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection('cards').insertOne(cart, function(err, res) {
            assert.equal(null, err);
            console.log('Card Inserted');
            db.close();
        });
    });
    res.redirect('/');
});

router.get('/:cardId', function(req, res, next) {
    mongo.connect(url, function(err, db) {
        var returnDoc;
        assert.equal(null, err);
        var cursor = db.collection('cards').find();
        cursor.forEach(function(doc, err) {
            assert.equal(null, err);
            if(doc.id == req.params.cardId) {
                returnDoc = doc;
            }
        }, function() {
            db.close();
            res.status(200).json(returnDoc);
        });
    });
});

// Deletes list
router.delete('/:cardId', function(req, res) {
    var cardId = req.params.cardId;
    mongo.connect(url, function(err, db) {
        db.collection('cards').deleteOne({id: cardId}, function (err, res) {
            assert.equal(null, err);
            console.log('Item deleted');
            db.close();
        });
    });
});

module.exports = router;
