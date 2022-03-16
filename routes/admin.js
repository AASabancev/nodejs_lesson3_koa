const fs = require('fs')
const fsPromises = fs.promises;

const path = require('path');
const dataJson = require(path.join(process.cwd(), 'data.json'));
const { products, skills } = require(path.join(process.cwd(), 'data.json'));
const chance = require('chance')();

const router = require('koa-router')();
const koaBody = require('koa-body')
const {reject} = require("eslint-plugin-promise/rules/lib/promise-statics");

router.get('/', async (ctx, next) => {
  // TODO: Реализовать, подстановку в поля ввода формы 'Счетчики'
  // актуальных значений из сохраненых (по желанию)
  await ctx.render('pages/admin', { title: 'Admin page',  products, skills, error:ctx.query.error, success:ctx.query.success  })
})


const saveToJson = async (json) => {
  /**
   * TODO: никак не могу победить этот промиз, опишу проблему в телеграмме
   */
  return new Promise((resolve, reject) => {
    fs.writeFile(path.join(process.cwd(), 'data.json'), JSON.stringify(json), 'utf8', (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
      resolve(json);
    });
  });
}

router.post('/skills', koaBody(), async (ctx, next) => {


  const fields = ctx.request.body;
  console.log('fields', fields)
  const valid = validSkills(fields)

  if (valid.err) {
    return ctx.redirect(`/admin/?error=${valid.status}`)
  }

  const {age, concerts, cities, years} = fields;
  dataJson.skills = [
    {"number":age, "text":"Возраст начала занятий на скрипке"},
    {"number":concerts, "text":"Концертов отыграл"},
    {"number":cities, "text":"Максимальное число городов в туре"},
    {"number":years, "text":"Лет на сцене в качестве скрипача"},
  ];


   await saveToJson(dataJson)
       .then(function(result){
         console.log('result', result);
         ctx.flash = {'status':'Счетчики успешно сохранены'};
         return ctx.redirect('/admin/?success=Счетчики успешно сохранены');
       })
       .catch(function(){
         ctx.flash = {'status':'Ошибка сохранения счетчиков'};
         return ctx.redirect('/admin/?error=Ошибка сохранения счетчиков');
       });
})

router.post('/upload', koaBody({
  multipart: true,
  formidable: {
    uploadDir: process.cwd() + '/upload'
  }
}), async (ctx, next) => {

  const upload = path.join('./public', 'assets','img','products');
  if (!fs.existsSync(upload)) {
    fs.mkdirSync(upload, {recursive: true});
  }

  const fields = ctx.request.body;
  const files =  ctx.request.files;

  const valid = validGood(fields, files)

  if (valid.err) {
    fs.unlinkSync(files.photo.path)
    ctx.flash = {'status':`Ошибка ${valid.status}`};
    return ctx.redirect(`/admin/?error=${valid.status}`)
  }


  const fileName = chance.string({ pool: 'qwertyuiopasdfghjklzxcvbnm', length: 15 }) + path.extname(files.photo.name);
  const filePath = path.join(process.cwd(), upload, fileName);

  console.log('copy from to ', files.photo.path,  filePath)

  await fsPromises.copyFile(files.photo.path, filePath)
     .then( async () => {

       dataJson.products.push({
         "src":`./assets/img/products/${fileName}`,
         "name":fields.name,
         "price":fields.price
       })

       fs.unlink(files.photo.path,()=>{});

       await saveToJson(dataJson)
          .then(()=>{
            ctx.flash = {'status':'Товар добавлен'};
            return ctx.redirect('/admin/?success=Товар добавлен');
          })
          .catch(() => {
            ctx.flash = {'status':'Ошибка  добавления товара'};
            return ctx.redirect('/admin/?error=Ошибка добавления товара');
          });

     })
     .catch(() => {
       return ctx.redirect('/admin/?error=Ошибка добавления товара');
     });

})

const validGood = (fields, files) => {
  if (files.photo.name === '' || files.photo.size === 0) {
    return { status: 'Не загружено фото товара!', err: true }
  }
  if (!fields.name) {
    return { status: 'Не указано название товара!', err: true }
  }
  if (!fields.price) {
    return { status: 'Не указана цена товара!', err: true }
  }
  return { status: 'Ok', err: false }
}


const validSkills = (fields) => {
  if (!fields.age || fields.age < 1) {
    return { status: 'Не указан возраст!', err: true }
  }
  if (!fields.concerts || fields.concerts < 1) {
    return { status: 'Не указаны концерты!', err: true }
  }
  if (!fields.cities || fields.cities < 1) {
    return { status: 'Не указаны города!', err: true }
  }
  if (!fields.years || fields.years < 1) {
    return { status: 'Не указан опыт на сцене!', err: true }
  }
  return { status: 'Ok', err: false }
}


module.exports = router
