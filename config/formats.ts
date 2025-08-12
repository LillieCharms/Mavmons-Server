// Note: This is the list of formats
// The rules that formats use are stored in data/rulesets.ts
/*
If you want to add custom formats, create a file in this folder named: "custom-formats.ts"

Paste the following code into the file and add your desired formats and their sections between the brackets:
--------------------------------------------------------------------------------
// Note: This is the list of formats
// The rules that formats use are stored in data/rulesets.ts

export const Formats: FormatList = [
];
--------------------------------------------------------------------------------

If you specify a section that already exists, your format will be added to the bottom of that section.
New sections will be added to the bottom of the specified column.
The column value will be ignored for repeat sections.
*/

export const Formats: FormatList = [
	///////////////////////////////////////////////////////////////
	///////////////////// Gen 9 Pet Mods //////////////////////////
	///////////////////////////////////////////////////////////////
	{
		section: "Gen 9 Pet Mods",
		column: 1,
		// name: "gen9petmods",
	},
	{
		name: "[Gen 9] Maverick* Mons",
		desc: `Maverick* Mons, a micrometa designed to use Maverick* Server Fakemons.`,
		mod: 'mavmons',
		teambuilderFormat: "National Dex",
		ruleset: ['Standard NatDex', 'OHKO Clause', 'Evasion Moves Clause', 'Species Clause', 'Dynamax Clause', 'Data Mod', 'Sleep Clause Mod', 'Terastal Clause', /* 'Mega Data Mod' */],
		onValidateTeam(team, format) {
			/**@type {{[k: string]: true}}*/
			let speciesTable = {};
			let allowedTiers = ['MV Ubers', 'Uber', 'OU', 'UU', 'RU', 'PU', 'NU'];
			for (const set of team) {
				let template = this.dex.species.get(set.species);
				if (!allowedTiers.includes(template.tier)) {
					return [set.species + ' is not legal in [Gen 9] Maverick* Mons.'];
				}
			}
		},
	},

	//placeholder
	/*
	{
		name: "",
		mod: '',
		desc: ``,
		ruleset: ['Standard', 'Data Mod'],
		//teambuilderFormat: 'National Dex', //uncomment if your mod is natdex
		onValidateTeam(team, format) {
			let speciesTable = {};
			let allowedTiers = [''];
			for (const set of team) {
				let template = this.dex.species.get(set.species);
				if (!allowedTiers.includes(template.tier)) {
					return [set.species + ' is not legal in the format.'];
				}
			}
		},
	},
	*/
];
