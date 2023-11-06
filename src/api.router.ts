var router = require('express').Router();

var rssRouter = require('./modules/rss/rss.router');

router.use('/rss', rssRouter);

module.exports = router;