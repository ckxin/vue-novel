var express = require('express');
var router = express.Router();
var novel_info = require('../public/js/novel_info');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.json(novel_info);
});

module.exports = router;
