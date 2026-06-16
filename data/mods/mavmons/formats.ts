import { FormatData } from '../../../sim/dex-formats';

export const Formats: FormatData[] = [
	{
		name: "[Gen 9] National Dex Maverick* Mons",
		desc: `Maverick* Mons, a micrometa designed to use Maverick* Server Fakemons.`,
		mod: 'mavmons',
		teambuilderFormat: "National Dex Ubers",
		ruleset: ['Standard NatDex', 'OHKO Clause', 'Evasion Moves Clause', 'Species Clause', 'Dynamax Clause', 'Data Mod', 'Sleep Clause Mod', 'Terastal Clause', '+ lgpe', '+ unreleased', '- unobtainable',  /* 'Mega Data Mod' */],
		onValidateTeam(team, format) {
			/**@type {{[k: string]: true}}*/
			let speciesTable = {};
			for (const set of team) {
				let template = this.dex.species.get(set.species);
				if (!allowedTiers.includes(template.tier)) {
					return [set.species + ' is not legal in [Gen 9] National Dex Maverick* Mons.'];
				}
			}
		},
	},

];