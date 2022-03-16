const router = require('koa-router')();
const koaBody = require('koa-body');
const path = require('path');
const { products, skills } = require(path.join(process.cwd(), 'data.json'));
const { config } = require('../config.json')
const nodemailer = require('nodemailer')

router.get('/', async (ctx, next) => {
  await ctx.render('pages/index', { title: 'Main page', products, skills, user: ctx.session.user })
})

router.post('/', koaBody(), async (ctx, next) => {

  const fields = ctx.request.body;
  // требуем наличия имени, обратной почты и текста
  if (!fields.name || !fields.email || !fields.text) {
    // если что-либо не указано - сообщаем об этом
    ctx.body = { msg: 'Все поля нужно заполнить!', status: 'Error' }
    next();
  }
  // инициализируем модуль для отправки писем и указываем данные из конфига

  const result = await sendMail(fields);
  console.log('result', result);
  ctx.body = result;
})

const sendMail = async (fields) => {
  return new Promise((resolve,reject)=> {
    const transporter = nodemailer.createTransport(config.mail.smtp)
    const mailOptions = {
      from: config.mail.smtp.auth.user,
      to: config.mail.send_to,
      subject: config.mail.subject,
      text:
         fields.text.trim().slice(0, 500) +
         `\n Отправитель: ${fields.name} <${fields.email}>`
    }
    // отправляем почту
    transporter.sendMail(mailOptions, function (error, info) {
      // если есть ошибки при отправке - сообщаем об этом
      if (error) {
        return resolve({
          msg: `При отправке письма произошла ошибка!: ${error}`,
          status: 'Error'
        });
      }
      return resolve({msg: 'Письмо успешно отправлено!', status: 'Ok'});
    })
  })
}

module.exports = router
