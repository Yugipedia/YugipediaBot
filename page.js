/**
 * BecaBot procedure: «Page»
 * @triggers:
 * --> «-b», «-bot», «-becabot»,
 * --> «-c», «-card»,
 * --> «-p», «-page,
 * @description:
 * --> Processes a page. Returns embed that shows info about the page.
 * --> Exceptions are returned as embeds as well.
 * @author:
 * --> Becasita
 */

// Enforce strict:
"use strict";

/**
 * Imports:
 */
const fetch = require('node-fetch');
const {
	utils, placeholders,
	Yugipedia, card
} = require('./utils');
const [SearchError, ContentFetchError] = require('./errors');
const Embed = require('./embeds/YugipediaEmbed');

/*****************************************************************************/

/**
 * Standard types Prototypes:
 */
// -------
// String: 
String.prototype.strip = function(c=' ') {
	return String(this).replace(c, '');
};
String.prototype.setPath = function(s) {
	return String(this).replace(placeholders.path, encodeURIComponent(s.trim()));
};
String.prototype.capitalize = function() {
	return String(this).trim()/*.toLowerCase()*/.replace(/^./, c => c.toUpperCase());
};

/*****************************************************************************/

/**
 * Objects:
 */
// --------------------------
// Constructors & prototypes:
function Page() {
	this.name = undefined;
	this.search = this.content = this.smw = {};
	this.errors = {};
}
Page.prototype.getContentValue = function(parameter) {
	let regex = new RegExp(`\\| *${parameter} *= *([\\s\\S]*?)(\\| *[\\-\\w\\d]+ *= *|}}\\n?$)`, 'g');
	let result = regex.exec(this.content.result);
	return result && result.length ? result[1] : '';
};

function Options(v) {
	const regex = /(\w+)::(.+?)(;|$)/g
	let parts = {};
	v.replace(regex, (match, $1, $2) => {
		parts[$1.trim().toLowerCase()] = $2.trim().toLowerCase();
	});
	console.log(parts);
	this.namespace = parts.ns || parts.namespace;
	this.language = parts.ln || parts.lang || parts.language;
}
Options.prototype.print = function() {
	console.log(this);
};

/*****************************************************************************/

/**
 * Functions:
 */
function _mapCatcher(catcher) {
	//[named links](https://discordapp.com)
	var linkedSquareLength = catcher.square.length;
	var linkedCurlyLength = catcher.curly.length;
	var linkedSquare = linkedSquareLength ? catcher.square.map(
		i => `* [${i}](${utils.Discord.plainLink(Yugipedia.pageLink(i))})`
	) : [];
	var linkedCurly = linkedCurlyLength ? catcher.curly.map(
		i => `* [${utils.Discord.inlineCode(`{{${(i)}}}`)}](${utils.Discord.plainLink(Yugipedia.pageLink(`Template:${i}`))})`
	) : [];
	var delimiter = linkedSquareLength && linkedCurlyLength ? '\n\n' : '';
	return new Embed().setDescription(`${linkedSquare.join('\n')}${delimiter}${linkedCurly.join('\n')}`);
}

function processPage(page) {
	const empty = utils.Discord.emoji.empty;
	const cardName = page.getContentValue('name');
	let lorerule;
	// Stats box:
	const statsBox = (() => {
		const attribute = card.attribute(page.getContentValue('attribute'));
		const [cardType, property] = (() => {
			let rawCardType = page.getContentValue('card_type');
			let rawProperty = page.getContentValue('property');
			return [card.spellTrapTypes(rawCardType), card.property(rawProperty, rawCardType)];
		})();
		const stars = (() => {
			let level = page.getContentValue('level');
			let rank = page.getContentValue('rank');
			lorerule = level < 0 ? card.lorerule : '';
			return card.stars(level || rank, rank ? 'rank' : lorerule ? 'dark' : 'level');
		})();
		const scale = card.scale(page.getContentValue('pendulum_scale'));
		let [arrows, rating] = card.linkMonsterStats(page.getContentValue('link_arrows'));
		const atk = page.getContentValue('atk');
		const def = page.getContentValue('def');
		const lowerStats = ((atk, def, rating) => {
			const embedLink = utils.Discord.embedLink;
			const defVsRating = rating
				? `${embedLink(Yugipedia.pageLink(card.stats.rating.link), card.stats.rating.label)}${card.stats.rating.delimiter}${rating}`
				: `${embedLink(Yugipedia.pageLink(card.stats.def.link), card.stats.def.label)}${card.stats.def.delimiter}${def}`;
			return atk || def || rating
				? `\n${embedLink(Yugipedia.pageLink(card.stats.atk.link), card.stats.atk.label)}${card.stats.atk.delimiter}${atk}${empty}${defVsRating}`
				: '';
		})(card.stat(atk, card.stats.atk.label), card.stat(def, card.stats.def.label), card.stat(rating));
		return `${attribute}${cardType}${property}${stars}${arrows}${scale}${lowerStats}`;
	})();
	// Booster stuff:
	const releaseDates = (() => {
		return page.getContentValue('na_release_date');
	})();
	// Monster types:
	const types = (() => {
		let CT2Types = [];
		for(let i = 1; i < 5; i++) {
			let value = page.getContentValue(`type${i.toString().strip('1')}`);
			value ? CT2Types.push(value) : null;
		}
		const CardTableTypes = page.getContentValue('types');
		return card.monsterTypes(CardTableTypes ? CardTableTypes.split('/') : CT2Types);
	})();
	let textLabel;
	const color = utils.color(page.getContentValue('color') || (() => {
		const regex = {
			monsterCardType: /fusion|link|ritual|synchro|xyz/gi,
			effectNormal: /effect|normal/gi,
			spellTrap: /spell|trap/gi,
			nonGame: /counter|token|strategy|tip/gi
		};
		let match;
		if(match = (
			types.match(regex.monsterCardType)
			|| types.match(regex.effectNormal)
			|| statsBox.match(regex.spellTrap)
			|| types.match(regex.nonGame)
		)) {
			textLabel = types.match(/normal/gi) ? 'Lore:' : 'Effect:';
			return card.colors[match[0].toLowerCase()];
		} else if(statsBox && types) {
			textLabel = 'Lore:';
			return card.colors.normal;
		} else {
			return ''; 
		}
	})());
	// Lore/Effect boxes:
	const pendulumEffect = Yugipedia.format.parse(page.getContentValue('pendulum_effect'));
	const materials = '';//page.getContentValue('materials'); TODO
	const lore = Yugipedia.format.parse(`${types}${materials}${lorerule}${releaseDates}${page.getContentValue('lore')}`);
	// Image:
	const cardImage = page.getContentValue('image') || page.getContentValue('ja_image');
	// Embed:
	const embed = new Embed(page.name, cardName || page.name).setColor(color)
		.setThumbnail(cardImage ? Yugipedia.thumbnail(cardImage) : '');
	const hasStats = statsBox.trim();
	const hasPendulumEffect = pendulumEffect.trim();
	const hasText = lore.trim();
	if(hasStats) {
		embed.addField('Stats:', statsBox);
	}
	if(hasPendulumEffect) {
		embed.addField('Pendulum Effect', pendulumEffect);
	}
	if(hasText) {
		embed.addField(textLabel || empty, lore);
	}
	//embed.addField('image:', cardImage ? Yugipedia.thumbnail(cardImage) : 'no image')
	return embed;
}

/*****************************************************************************/

/**
 * Module main:
 */
module.exports = async (msg, args) => {
	console.time('Took');
	const user = `${msg.author.username}#${msg.author.discriminator}`;
	const server = msg.member.guild.name;
	const channel = msg.channel.name;
	console.log('--------');
	console.log(`Replying to «${user}», on «${channel}» (from «${server}»).`);

	function _logError(error) {
		error.log();
		msg.channel.send(error.getMessage());
	}

	// ------------
	// Page object:
	const page = new Page();

	// ------------------
	// Process arguments:
	let [pageArg, optionsArg] = args.split(/\s*\/\/\s*/).map(i=>i.trim());
	if(!pageArg) {
		msg.channel.send('No page to parse...');
		return;
	}
	const options = optionsArg !== undefined ? new Options(optionsArg) : null;

	// ----------
	// Procedure:

	// Search:
	page.search.input = pageArg;
	page.search.url = Yugipedia.apiLink('search', pageArg.strip('#'));
	fetch(page.search.url)
	.then(res => res.json().then(
		json => {
		page.search.result = json;
		page.name = json.items[0].title;
		//msg.channel.send(`Got: «${page.name}».`);
		return page.name;
		}
	))
	.then(pageName => {
		// All good:
		console.log('SEARCH RESULT (pageName): ', page.name);
		// Content:
		page.content.url = Yugipedia.apiLink('content', page.name);
		return fetch(page.content.url)
		.then(res => res.json().then(
			json => {
				page.content.result = json.query.pages[0].revisions[0].content;
				return page.content.result;
			}
		)).then(content => {
			// Retrieved content successfully.
			console.log('CONTENT FETCHED SUCCESSFULLY!');
			console.timeEnd('Took');
			msg.channel.send(processPage(page) || 'error').then(() => {
				console.log(`Sent to «${channel}» (from «${server}»).`);
				console.log('--------');
			});
		}, error => {
			// Content fetch error:
			_logError(new ContentFetchError(error, page));
		});
	}, error => {
		// Search error:
		_logError(new SearchError(error, page));
	})
	.catch(e=>console.log(e)).catch(error => console.error('\x1b[31m%s\x1b[0m', `ERROR: ${error}`));
};