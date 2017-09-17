var express = require('express');
var router = express.Router();
var mongo = require('mongodb').MongoClient;
var assert = require('assert');

var url = 'mongodb://localhost:27017/trello';

function addAndUpdateOrders(list, newIndex, db) {
    if (db.mycollection.find({order: { "$in": newIndex}}).count() > 0) { // Check if the order spot is already taken
        db.collection('lists').updateMany({"order": {$gte: newIndex}}, {$inc: {order: 1}}, function (err, result) { // If yes, update then insert
            assert.equal(null, err);
            console.log('Index updated');
            db.collection('lists').insertOne(list, function (err, res) { // If no just insert
                assert.equal(null, err);
                console.log('List Inserted');
                db.close();
            });
        });
    } else {
        db.collection('lists').insertOne(list, function (err, res) {
        assert.equal(null, err);
        console.log('List Inserted');
        db.close();
        });
    }
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Yonah@Penn' });
});


router.post('/list', function(req, res, next) {
    mongo.connect(url, function(err, db) {
        var order;
        if (req.body.order == null) {
            order = db.collection('lists').count();
        } else {
            if (parseInt(req.body.order) >= db.collection('lists').count()) {
                order = db.collection('lists').count(); // Cut off order at max
            } else {
                order = parseInt(req.body.order, 10);
            }
        }
        // Create list to insert
        var list = {
            title: req.body.title,
            id: req.body.id,
            order: order,
        };
        addAndUpdateOrders(list, order, db)
    });
    res.redirect('/');
});

router.post('/card', function(req, res, next) {
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

router.get('/card/:cardId', function(req, res, next) {
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
            res.render('card', {card: returnDoc});
        });
    });
});

router.get('/list/:listId', function(req, res, next) {
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
            res.render('list', {list: returnDoc});
        });
    });
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

module.exports = router;
