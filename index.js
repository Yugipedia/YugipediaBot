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
 * Index:
 */
const index = {
	'-bot': undefined,
	'-help': require('./Procedures/help'),
	'-info': require('./Procedures/info'),
	'-invite': require('./Procedures/invite'),
	'-page': require('./Procedures/page'),
	'-query': require('./Procedures/query'),
	'-special': require('./Procedures/special'),
};
// Alias:
index['-card'] = index['-c'] = index['-p'] = index['-b']/*TEMP*/ = index['-page'];
index['-h'] = index['-help'];
index['-i'] = index['-info'];
index['-q'] = index['-query'];
index['-s'] = index['-special'];

/**
 * Exports:
 */
module.exports = index;

/*
Making exports a function(command, inputObject)