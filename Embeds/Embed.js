// Enforce strict:
"use strict";

/**
 * Imports:
 */

const utils = require('../utils').utils;

/**
 * Generic Embed Class:
 */
class Embed {

	constructor() {
		this.content = '';
		this.embed = {
			author: {},
			title: '',
			url: '',
			description: '',
			color: utils.Discord.randomColor(),
			thumbnail: {},
			fields: [],
			image: {},
			footer: {}
		};
	}

	// Methods:
	setContent(text) {
		this.content = text;
		return this;
	}
	setAuthor(name, url, icon) {
		this.embed.author.name = name;
		this.embed.author.url = url;
		this.embed.author.icon_url = icon;
		return this;
	}
	setTitle(text, url='') {
		this.embed.title = text;
		this.embed.url = url;
	}
	setDescription(text) {
		this.embed.description = text;
		return this;
	}
	setColor(i) {
		const color = /[a-z]/gi.test(i) || typeof i !== 'number' ? utils.color(i) : i;
		this.embed.color = color || color === 0 ? color : utils.Discord.randomColor();
		return this;
	}
	setThumbnail(url) {
		this.embed.thumbnail.url = url;
		return this;
	}
	setFooter(text) {
		this.embed.footer = text;
		return this;
	}
	/**
	 * @parameter: <Object|Array|String> «o»:
	 * ---- May be an object literal, an array
	 * -- or a string (the name of the field).
	 */
	addField(o, v) {
		function _addField(name, value) {
			const MAX = utils.Discord.FIELD_MAX_LENGTH;
			const label = value.length > MAX ? ' (Truncated)' : '';
			this.embed.fields.push({
				name: `${name}${label}`,
				value: value.substr(0, MAX)
			});
		}
		if(Array.isArray(o)) {
			for(let i = 0; i < o.length; i++) {
				_addField.call(this, o[i].name, o[i].value);
			}
		} else {
			_addField.call(this,
				o.name !== undefined ? o.name : o,
				o.value !== undefined ? o.value : v
			);
		}
		return this;
	}

}

/**
 * Exports:
 */
module.exports = Embed;