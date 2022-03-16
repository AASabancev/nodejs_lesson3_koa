const router = require('koa-router')();

router.use('/', require('./main').routes())

router.use('/login', require('./login').routes())

router.use('/admin', require('./admin').routes())

module.exports = router
