var keystone = require('keystone');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'home';
  let envOptions = {
    'API_PORT': process.env.API_PORT || false,
    'API_PROTOCOL': process.env.API_PROTOCOL,
    'API_DOMAIN': process.env.API_DOMAIN,
    'API_ENDPOINT': process.env.API_ENDPOINT,
    'API_WS_PORT': process.env.API_WS_PORT,
  }

	// Render the view
	view.render('index', { env: envOptions });
};
