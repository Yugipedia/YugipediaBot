/**
 * @author: Becasita
 *
 * Auxiliary module.
 * @description:
 * --> Contains utilities. Object literals.
 */
'use strict';
/**
 * Object literals:
 */
const utils = {
	colors: {
		red: 'FF0000'
	},
	color: hex => {
		hex = hex.strip('#').trim().toUpperCase();
		return !hex
			? utils.Discord.randomColor() // No color => random color.
			: parseInt(hex.length === 3 // Short hex?
				? hex.split('').map(c => c+c).join('') // Normalize it.
				: hex, 16
			);
	},
	Discord: {
		FIELD_MAX_LENGTH: 1024,
		blockCode: (s, language='') => {
			const delimiter = '```';
			return `${delimiter}${language}\n${s}\n${delimiter}`;
		},
		bold: s => `**${s}**`,
		inlineCode: s => {
			const delimiter = '`';
			return `${delimiter}${s}${delimiter}`;
		},
		embedLink: (link, label) => `[${label}](${link.replace(')', '%29')})`,
		plainLink: link => `<${link}>`,
		randomColor: () => utils.randomInt(16777215),
		emoji: {
			empty: '<:empty:402095164891332608>',
			arrows: {
				topcenter: '<:TopArrow:401900214883057674>',
				topright: '<:TopRightArrow:401900594870353930>',
				right: '<:RightArrow:401900629301395477>',
				bottomright: '<:BottomRightArrow:401900645877153802>',
				bottomcenter: '<:BottomArrow:401900663153491990>',
				bottomleft: '<:BottomLeftArrow:401900676558618634>',
				left: '<:LeftArrow:401900693062942740>',
				topleft: '<:TopLeftArrow:401900867034415105>',

			},
			attributes: {
				DARK: '<:DARKAttribute:401157828934500364>',
				DIVINE: '<:DIVINEAttribute:401157859003596800>',
				EARTH: '<:EARTHAttribute:401157872370843651>',
				FIRE: '<:FIREAttribute:401157888724434945>',
				LIGHT: '<:LIGHTAttribute:401157908580270085>',
				WATER: '<:WATERAttribute:401157927001391104>',
				WIND: '<:WINDAttribute:401157940524089346>'
			},
			stars: {
				level: '<:LevelStar:400785542746472448>',
				dark: '<:DarkStar:401146459983970304>',
				rank: '<:RankStar:400785567241207809>'
			},
			pendulum: {
				left: '<:LeftScale:400783435104518146>',
				right: '<:RightScale:400783463046709249>'
			},
			ST: {
				Spell: '<:SPELL:401157968823058469>',
				Trap: '<:TRAP:401157981745446912>'
			},
			property: {
				continuous: '<:ContinuousProperty:401898207858262038>',
				counter: '<:CounterProperty:401898224190750730>',
				equip: '<:EquipProperty:401898237893672972>',
				field: '<:FieldProperty:401898251961237514>',
				quickplay: '<:QuickPlayProperty:401898270370037770>',
				ritual: '<:RitualProperty:401898288120594443>'
			}
		}
	},
	mapObject: (o, innerDelimiter='=', outerDelimiter='&') => Object.keys(o).map(
		i => `${i}${innerDelimiter}${o[i]}`
	).join(outerDelimiter),
	randomInt: value => Math.floor(Math.random() * value),
	repeat: (s, n) => {
		let r = '';
		for(let i = 0; i < Number(n); i++) {
			r += s;
		}
		return r;
	}
};

const placeholders = {
	path: '$PATH$'
};

const Yugipedia = {
	main: 'Yugipedia',
	random: 'Special:Random',
	icon: 'Wiki.png',
	domain: 'https://yugipedia.com/',
	article: 'wiki/',
	api: 'api.php',
	search: {
		endpoint: 'http://yugioh.wikia.com/api/v1/Search/List',
		query: {
			query: placeholders.path,
			limit: 1,
			namespaces: 0
		}
	},
	content: {
		query: {
			action: 'query',
			redirects: true,
			prop: 'revisions',
			rvprop: 'content',
			format: 'json',
			formatversion: 2,
			titles: placeholders.path
		}
	},
	apiLink: function(type, s) {
		return `${this[type].endpoint || `${this.domain}${this.api}`}?${utils.mapObject(this[type].query).setPath(s)}`;
	},
	pageLink: function(pageName=this.main) {
		return `${this.domain}${this.article}${encodeURIComponent(pageName.strip('#').capitalize())}`;
	},
	thumbnail: function(imageName=this.icon) {
		return `${this.domain}${this.article}Special:Redirect/file/${encodeURIComponent(imageName.trim())}`;
	},
	format: {
		//title: s => s.strip(/^Special:/gi).capitalize(),
		parse: s => { //[named links](https://discordapp.com)
			s = s.trim();
			if(!s) return '';
			const regex = {
				br: {
					pattern: /< *?[bh]r *?\/? *?>/gi,
					with: '\n'
				},
				italics: {
					pattern: /(^''|''$)/gm,
					with: '_'
				},
				comments: {
					pattern: /<!--.*?-->/g,
					with: ''
				},
				links: {
					pattern: /\[\[(.*?)(\|(.*?))?\]\](\w*)/g, // $1 is the link; $3$4 is the label.
					with: (match, $1, $2, $3, $4='') => {
						const newValueLabel = `${$3 ? $3 : $1}${$4}`;
						let newValue = utils.Discord.embedLink(
							Yugipedia.pageLink($1), newValueLabel
						);
						let previousStateOfString = currentStateOfString; // Store the old string.
						currentStateOfString = currentStateOfString.replace(match, newValue); // Update the current string (like this functions is doing).
						if(currentStateOfString.length > utils.Discord.FIELD_MAX_LENGTH) {
							// If its length is bigger than it should,
							currentStateOfString = previousStateOfString.replace(match, newValueLabel); // The current string will be updated only with the label.
							return newValueLabel;
						} else {
							// If it still has room, update with link.
							return newValue;
						}
					}
				}
			};
			var currentStateOfString = s; // To check if length is bigger than 1024.
			Object.keys(regex).forEach(
				(key) => s = s.replace(regex[key].pattern, regex[key].with)
			);
			return s;
		}
	}
};

const card = {
	colors: {
		// Monsters:
		normal: 'FDE68A', effect: 'FF8B53',
		fusion: 'A086B7', link: '00008B',
		ritual: '9DB5CC', synchro: 'CCCCCC',
		xyz: '000000', token: 'C0C0C0',
		//Spells & Traps:
		spell: '1D9E74', trap: 'BC5A84',
		// Other:
		counter: 'C0C0C0', tip: '800080',
		strategy: '6666FF'
	},
	stats: {
		atk: {
			link: 'ATK',
			label: 'ATK',
			delimiter: ' / '
		},
		def: {
			link:  'DEF',
			label: 'DEF',
			delimiter: ' / '
		},
		rating: {
			link: 'Link_Rating',
			label: 'LINK',
			delimiter: '—'
		}
	},
	lorerule: 'In order to [[Special Summon]] this card, subtract the [[Level]] of a "[[Dark Tuner (archetype)|Dark Tuner]]" [[Monster Card|monster]] from the Level of 1 other monster you [[control]]; the value must equal the Level of this card.<br />',
	attribute: s => {
		s = s.trim().toUpperCase();
		if(!s) return '';
		return `${utils.Discord.embedLink(Yugipedia.pageLink(s), s)} ${utils.Discord.emoji.attributes[s] || ''}\n`;
	},
	linkMonsterStats: s => {
		s = s.trim();
		if(!s) return ['',''];
		let rating = 0;
		const arrows = {
			links: [], icons: []
		};
		s.split(',').forEach(i => {
			let arrow = i.trim();
			const page = `${arrow} Link Arrow Monster Cards`;
			arrow ? rating++ : null;
			arrows.links.push(utils.Discord.embedLink(Yugipedia.pageLink(page), arrow));
			arrows.icons.push(utils.Discord.emoji.arrows[arrow.toLowerCase().strip('-')] || '');
		});
		return [`${Object.entries(arrows).map(([key, value]) => value.join(', ')).join(' ')}\n`, rating ? rating.toString() : ''];
	},
	scale: s => {
		s = s.trim();
		if(!s) return '';
		const page = `Pendulum Scale ${s} Monster Cards`;
		const discordLink = utils.Discord.embedLink(Yugipedia.pageLink(page), s);
		return `${utils.Discord.emoji.pendulum.left}${discordLink} | ${discordLink}${utils.Discord.emoji.pendulum.right}\n`;
	},
	stars: (s, type) => {
		s = s.trim();
		if(!s) return '';
		const page = `${type} ${s} Monster Cards`;
		return `${utils.Discord.embedLink(Yugipedia.pageLink(page), s)} ${utils.Discord.emoji.stars[type].repeat(Math.abs(s))}\n`;
	},
	stat: (s, type) => {
		s = s.trim();
		if(!s) return '';
		const page = type ? `${s} ${type} Monster Cards` : `Link ${s} Monster Cards`;
		return `${utils.Discord.embedLink(Yugipedia.pageLink(page), s)}`;
	},
	monsterTypes: a => {
		if(!a.length) return '';
		return `[ ${a.map((value, index) => {
			let type = value.strip(/\[|]/g).trim(); // Unlink.
			return `[[${type}${index ? ' Monster' : ''}|${type}]]`; //utils.Discord.embedLink(Yugipedia.pageLink(`${type}${index ? ' Monster' : ''}`), type);
		}).join(' / ')} ]\n`;
	},
	spellTrapTypes: s => {
		s = s.trim();
		if(!s) return '';
		const type = s.toLowerCase().capitalize();
		return `${utils.Discord.embedLink(Yugipedia.pageLink(`${type} Card`), type)} ${utils.Discord.emoji.ST[type] || '' }\n`;
	},
	property: (s, type) => {
		s = s.trim(); type = type.trim();
		if(!s || !type) return '';
		const STCard = `${type.toLowerCase().capitalize()} Card`;
		return `${utils.Discord.embedLink(Yugipedia.pageLink(`${s} ${STCard}`), s)} ${utils.Discord.emoji.property[s.toLowerCase().strip('-')] || '' }\n`;
	}
};

 module.exports = {
 	utils: utils,
 	placeholders: placeholders,
 	Yugipedia: Yugipedia,
 	card: card
 };