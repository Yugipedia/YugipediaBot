// Enforce strict:
"use strict";

/**
 * Imports:
 */
const Yugipedia = require('../utils').Yugipedia;

const Embed = require('./Embed');

/**
 * Yugipedia Embed Class:
 */
class YugipediaEmbed extends Embed {

	constructor(pageName = Yugipedia.random, label = 'Random page') {
		super()
		.setAuthor(Yugipedia.main, Yugipedia.pageLink(), Yugipedia.thumbnail())
		.setTitle(label || pageName, Yugipedia.pageLink(pageName));
	}

}

/**
 * Exports:
 */
module.exports = YugipediaEmbed;