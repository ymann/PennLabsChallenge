var express = require('express');
var router = express.Router();
var mongo = require('mongodb').MongoClient;
var assert = require('assert');

var url = 'mongodb://localhost:27017/organizations';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Yonah@Penn' });
});


router.get('/organizations', function(req, res, next) {
    var resultArray = [];
    mongo.connect(url, function(err, db) {
        assert.equal(null, err);
        var cursor = db.collection('clubs').find();
        cursor.forEach(function(doc, err) {
            assert.equal(null, err);
            resultArray.push(doc);
        }, function() {
            db.close();
            res.render('clubs', {clubs: resultArray});
        });
    });
});

router.get('/organizations/:id', function(req, res, next) {
    var returnDoc = null;
    mongo.connect(url, function(err, db) {
        assert.equal(null, err);
        var cursor = db.collection('clubs').find();
        cursor.forEach(function(doc, err) {
            assert.equal(null, err);
            if(doc._id == req.params.id) {
                returnDoc = doc;
            }
        }, function() {
            db.close();
            res.render('club-page', {club: returnDoc});
        });
    });
});

router.post('/insert', function(req, res, next) {
    var club = {
        name: req.body.name,
        description: req.body.description,
        url: req.body.url,
        tags: req.body.tags
    };

    mongo.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection('clubs').insertOne(club, function(err, res) {
            assert.equal(null, err);
            console.log('Item Inserted');
            db.close();
        });
    });

    res.redirect('/');
});

module.exports = router;
