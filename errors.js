const utils = require('./utils').utils;

const ErrorEmbed = require('./embeds/ErrorEmbed');

class CustomError {

	constructor(originalError, customMessage) {
		this.message = {
			console: `${this.constructor.name}:\n\t${customMessage.console}\nOriginal error was:\n\t«${originalError}»\n`,
			Discord: new ErrorEmbed(this.constructor.name).setDescription(customMessage.Discord)
		}
	}

	// Methods:
	log() {
		console.error('\x1b[31m%s\x1b[0m', this.message.console);
	}

	getMessage() {
		return this.message.Discord;
	}

}

class SearchError extends CustomError {

	constructor(originalError, page) {
		const message = {
			console: `Cannot find value for ${page.search.input}!`,
			Discord: `Cannot find value for ${utils.Discord.embedLink(page.search.url, page.search.input)}!`
		};
		super(originalError, message)
	}

}

class ContentFetchError extends CustomError {

	constructor(originalError, page) {
		const message = {
			console: `Cannot fetch content for ${page.search.input}!`,
			Discord: `Cannot fetch content for ${utils.Discord.embedLink(page.search.url, page.search.input)}!`
		};
		super(originalError, message)
	}

}


module.exports = [SearchError, ContentFetchError];