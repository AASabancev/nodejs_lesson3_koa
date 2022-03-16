const router = require('koa-router')();
const koaBody = require('koa-body')
const path = require('path');
const { users } = require(path.join(process.cwd(), 'config.json'));

router.get('/', async (ctx, next) => {
  await ctx.render('pages/login', { title: 'SigIn page', err: ctx.query.err })
})

router.post('/', koaBody(),async  (ctx, next) => {
  // TODO: Реализовать функцию входа в админ панель по email и паролю
  console.log('hello')

  if (!ctx.request.body.email || !ctx.request.body.password) {
    // если что-либо не указано - сообщаем об этом
    ctx.redirect('/login?err=Введите логин и пароль')
    return next();
  }

  const userFound = users.filter( user => {
    return user.login === ctx.request.body.email && user.password === ctx.request.body.password;
  }).shift();

  if(userFound) {
    ctx.session.user = {
      id: userFound.id,
      name: userFound.name,
    }
    ctx.redirect('/admin/')
  } else {
    ctx.redirect('/login?err=Пользователь не найден')
  }
})

router.get('/out', async (ctx, next) => {
  ctx.session.user = null;
  ctx.redirect('/')
});

module.exports = router
