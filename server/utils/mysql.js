const config = require('../config')

//createConnection

let knex = require("knex")({
	client: "mysql",
	connection: {
		host: config.mysql.host,
		user: config.mysql.user,
		password: config.mysql.pass,
		database: config.mysql.db
	},
	debug: false
});

module.exports = knex;
