var express = require('express');
var router = express.Router();
var ParseService = require('../services/parse')

router.get('/parse', function(req, res, next) {
  
    ParseService.Parse(function(err) {
        if (err) {
            return res.json(err);
        }
        res.json();
    });
});

router.get('/search', function(req, res, next) {
    res.json(global.everything);
});

module.exports = router;
