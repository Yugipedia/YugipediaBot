// Enforce strict:
"use strict";

/**
 * Imports:
 */
const Yugipedia = require('../utils').Yugipedia;

const Embed = require('./Embed');
/**
 * Error Embed Class:
 */
class ErrorEmbed extends Embed {

	constructor(errorName) {
		super()
		.setAuthor(Yugipedia.main, Yugipedia.pageLink(), Yugipedia.thumbnail())
		.setTitle(errorName || 'Unknown Error');
	}

}

/**
 * Exports:
 */
module.exports = ErrorEmbed;