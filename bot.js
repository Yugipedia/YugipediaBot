/**
 * BecaBot
 * Using Discord.js
 * @author: Becasita
 */
 //(async () => {
"use strict";
/**
 * Imports:
 */
const Discord   = require('discord.js');
const { token } = require('./config.json');
const commands  = require('./commands.json');
//const index = require('./index');
const _page = require('./page');
const _help = require('./help');

/*****************************************************************************/

/**
 * Initialize Discord Bot:
 */
const bot = new Discord.Client();
bot.login(token);

bot.on('ready', () => {
	console.log('Connected!');
	console.log(`Logged in as: ${bot.user.username}#${bot.user.discriminator} (${bot.user.id})`);
	//bot.user.setGame('... Using JavaScript.');
});

/*****************************************************************************/

/**
 * Message event:
 */
bot.on('message', message => {

	// ------------------------------
	// Check if everything's alright:
	if( // Return if the message
		message.author.bot || // was sent from the bot itself.
		message.channel.type === 'dm' // was a DM.
	) return;


	// ------------------
	// Serialize message:
	function Input(message) {
		const regex = /(^\s*(.*?)(\s+(.*?)(\s+([\s\S]*))?)?$)?/gm;
		let parts = regex.exec(message);
		this.command = parts[2] ? parts[2].toLowerCase() : null;
		this.alias = this.command ? this.command.substr(0,2) : null;
		this.function = parts[4] ? parts[4].toLowerCase() : null;
		this.arguments = parts[6];
		this.rest = parts[3] ? parts[3].trim() : '';
	}
	function Catcher(message) {
		const regex = /\[\[([^\]]+)]]|\{\{([^}]+)}}/g;
		this.square = [];
		this.curly  = [];
		let match;
		while ((match = regex.exec(message)) !== null) {
			if (match.index === regex.lastIndex) {
				regex.lastIndex++;
			}
			let $1, $2;
			($1 = match[1]) !== undefined ? this.square.push($1) : null;
			($2 = match[2]) !== undefined ? this.curly.push($2) : null;
		}
		this.exists = (this.square.length || this.curly.length);
	}
	var input = new Input(message);
	var catcher = new Catcher(message);

	// ----------
	// Procedure:
	if(Object.keys(commands).includes(input.command)) {
		//index[input.command](input);
		switch(input.alias) {
			case '-b':
			case '-c':
			case '-p':
				_page(message, input.rest);
				break;
			case '-h':
				_help(message, commands);
				break;
			default:
				message.channel.send(`${input.command} is not implemented yet.`);
		}
	}
	//: message.channel.send(`No function called!\nValid functions are: ${_listItems(functions)}.`)
	return;
});

/*****************************************************************************/

/**
 * Control:
 */
// Debug:
bot.on('debug', (e) => console.info('\x1b[33m%s\x1b[0m', `Debug: ${e}`));
// Warnings:
bot.on('warn', (e) => console.warn('\x1b[35m%s\x1b[0m', `Warn: ${e}`));
// Errors:
bot.on('error', (e) => console.error('\x1b[31m%s\x1b[0m', `Error: ${e}`));

/*****************************************************************************/

/**
 * Logout:
 */
/*bot.destroy((err) => {
	err !== undefined
	? console.error(err)
	: console.timeEnd('Logging out!');
	//process.exit(0);
});*/

/*****************************************************************************/

/**
 * Functions:
 */
// --------
// Helpers:
function _listItems(o) {
	return (
		Array.isArray(o)
		? o
		: Object.keys(o)
	).map(i => `«${i}»`).join(', ');
}

//})();