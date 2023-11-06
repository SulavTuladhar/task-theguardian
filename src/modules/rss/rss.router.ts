var router = require('express').Router();
const rssController = require('./rss.controller');

router.route('/:sectionId')
    .get(rssController.fetchData)

module.exports = router;