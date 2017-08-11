var keystone = require('keystone');
var Promise = require('bluebird');
var queryString = require('query-string');
var striptags = require('striptags');

function getSection(_id) {
  return new Promise((resolve, reject) => {
    if (!_id) {
      return resolve(false)
    }
    let data = {
      section: null,
      article: null,
      category: null,
    }
    keystone.list('Section').model.findOne({ _id: _id })
    .then((section) => {
      section.content = striptags(section.content)
      data.section = section
      if (section) {
        return keystone.list('Article').model.findOne({ _id: section.article })
      }
    })
    .then((article) => {
      article.content = striptags(article.content)
      data.article = article
      if (article) {
        return keystone.list('Category').model.findOne({ _id: article.category })
      }
    })
    .then((category) => {
      category.description = striptags(category.description)
      data.category = category
      resolve(data)
    })
    .catch((err) => {
      console.log(err.stack)
    })
  })
}

function getArticle(_id) {
  return new Promise((resolve, reject) => {
    if (!_id) {
      return resolve(false)
    }
    let data = {
      section: null,
      article: null,
      category: null,
    }
    keystone.list('Article').model.findOne({ _id: _id })
    .then((article) => {
      article.content = striptags(article.content)
      data.article = article
      if (article) {
        return keystone.list('Category').model.findOne({ _id: article.category })
      }
    })
    .then((category) => {
      category.description = striptags(category.description)
      data.category = category
      resolve(data)
    })
  })
}

function getCategory(_id) {
  return new Promise((resolve, reject) => {
    if (!_id) {
      return resolve(false)
    }
    let data = {
      section: null,
      article: null,
      category: null,
    }
    keystone.list('Category').model.findOne({ _id: _id })
    .then((category) => {
      category.description = striptags(category.description)
      data.category = category
      resolve(data)
    })
  })
}

exports = module.exports = function (req, res) {
	var view = new keystone.View(req, res);
  let isBot = false
  if (req.headers['user-agent'].toLowerCase().indexOf('twitter') !== -1) {
    isBot = 'twitter'
  } else if (req.headers['user-agent'].toLowerCase().indexOf('facebook') !== -1) {
    isBot = 'facebook'
  }
  console.log(req.headers)
  const parsed = queryString.parse(req.url.split('?')[1])
  console.log(parsed)
  Promise.resolve()
  .then(() => {
    if (parsed.section) {
      return getSection(parsed.section)
    } else if (parsed.article) {
      return getArticle(parsed.article)
    } else if (parsed.category) {
      return getCategory(parsed.category)
    } else {
      return Promise.resolve({ section: null, article: null, category: null })
    }
  })
  .then(({ section, article, category }) => {
    let data = {
      section,
      article,
      category,
      hasSection: section ? true : false,
      hasArticle: article ? true : false,
      hasCategory: category ? true : false,
      cloudinaryName: process.env.CLOUDINARY_NAME,
      isFacebook: isBot === 'facebook' ? true : false,
      isTwitter: isBot === 'twitter' ? true : false,
    }
    console.log('SHOULD RENDER PAGE!!!')
    console.log(data)
    if (isBot) {
      view.render('share', { layout: 'share', data: data });
    } else {
      //TODO: redirect
      if (section || article) {
        res.redirect(`/category/${category.slug}/articles/${article.slug}`)
      } else if (category) {
        res.redirect(`/category/${category.slug}`)
      } else {
        res.redirect('/')
      }
    }
  })
};
