var express = require('express');
var router = express.Router();
var ParseService = require('../services/parse')

/* GET home page. */
router.get('/parse', function(req, res, next) {
  
    ParseService.Parse(function(err) {
        if (err) {
            return res.json(err);
        }
        res.json();
    });
});

module.exports = router;
