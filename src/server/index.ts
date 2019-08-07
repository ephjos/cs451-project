var express = require('express');
var router = express.Router();

router.get('/', function(req: any, res: { render: (arg0: string, arg1: { title: string }) => void }) {
  res.render('index', { title: 'Express server' });
});

module.exports = router;