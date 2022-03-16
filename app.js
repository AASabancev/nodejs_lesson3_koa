const path = require('path')
const logger = require('koa-logger')

const Koa = require('koa');
const Pug = require('koa-pug')
const serv = require('koa-static');
const session = require('koa-session')
const app = new Koa();
require('dotenv').config();

// eslint-disable-next-line
const pug = new Pug({
   viewPath: './views',
   pretty: false,
   basedir: './views',
   noCache: true,
   app: app, // equals to pug.use(app) and app.use(pug.middleware)
});

const CONFIG = {
   key: 'koa.sess', /** (string) cookie key (default is koa.sess) */
   /** (number || 'session') maxAge in ms (default is 1 days) */
   /** 'session' will result in a cookie that expires when session/browser is closed */
   /** Warning: If a session cookie is stolen, this cookie will never expire */
   maxAge: 86400000,
   autoCommit: true, /** (boolean) automatically commit headers (default true) */
   overwrite: true, /** (boolean) can overwrite or not (default true) */
   httpOnly: true, /** (boolean) httpOnly or not (default true) */
   signed: false, /** (boolean) signed or not (default true) */
   rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
   renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false) */
   secure: false, /** (boolean) secure cookie */
   sameSite: null, /** (string) session cookie sameSite options (default null, don't set it) */
};

app.use(session(CONFIG, app));

const flash = require('koa-flash');
app.use(flash());


process.env.NODE_ENV === 'development'
  ? app.use(logger('dev'))
  : app.use(logger('short'))

const json = require('koa-json');
app.use(json())
// app.use(express.urlencoded({ extended: false }))

app.use(serv(path.join(__dirname, 'public')))


const router = require('./routes')
const fs = require("fs");

app.use(function(ctx, next) {
   ctx.flash = function(type, msg) {
      ctx.session.flash = { type: type, message: msg };
   }

   return next();
});

app
   .use(router.routes())
   .use(router.allowedMethods());


app.listen(process.env.PORT, () => {
   const upload = path.join(process.cwd(), 'upload');
   if (!fs.existsSync(upload)) {
      fs.mkdirSync(upload, {recursive: true});
   }

   console.log(`Server running on http://localhost:${process.env.PORT}`)
})
