/**
 * BecaBot procedure: «Help»
 * @triggers:
 * --> «-h», «-help»
 * @description:
 * --> Help about the bot's commands.
 * --> Returns embed that shows help tips.
 * @author:
 * --> Becasita
 */

// Enforce strict:
"use strict";

/**
 * Imports:
 */
const utils = require('./utils').utils;
const Embed = require('./embeds/YugipediaEmbed');

/**
 * Module main:
 */
module.exports = (msg, commands) => {
	console.log('HELP CALLED!');
	const description = [
		'(Still under construction...)',
		`To call the bot use: ${utils.Discord.inlineCode('<command> <args>')}.`,
		`For card pages use: ${utils.Discord.inlineCode('-c <page name>')} (e.g., ${utils.Discord.inlineCode('-c mst')}).`,
		'List of all commands:',
		utils.Discord.blockCode(utils.mapObject(commands, ': ', '\n'))
	];
	msg.channel.send(new Embed().setDescription(description.join('\n')));
};