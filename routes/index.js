var express = require('express');
var router = express.Router();
var ParseService = require('../services/parse');
var SearchService = require('../services/search');

router.get('/parse', function(req, res, next) {
  
    ParseService.Parse(function(err) {
        if (err) {
            return res.json(err);
        }
        res.json();
    });
});

router.post('/search/:query', function(req, res, next) {
    
    var term = req.params.query || '';

    SearchService.search(term, 20, function(err, result) {
        if (err) {
            return res.json(err);
        }
        res.json(result);
    });
});

module.exports = router;
