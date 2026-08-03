import { FormatData } from '../../../sim/dex-formats';

export const Formats: FormatData[] = [
	{
		name: "[Gen 9] National Dex Maverick* Mons",
		desc: `Maverick* Mons, a micrometa designed to use Maverick* Server Fakemons.`,
		mod: 'mavmons',
		teambuilderFormat: "National Dex Ubers",
		ruleset: ['Standard NatDex', 'OHKO Clause', 'Evasion Moves Clause', 'Species Clause', 'Dynamax Clause', 'Data Mod', 'Sleep Clause Mod', 'Terastal Clause', '+ lgpe', '+ unreleased',  /* 'Mega Data Mod' */],
	},
	{
		name: "[Gen 9] National Dex Maverick* Mons AG",
		desc: `Overflow from Maverick* Mons, including transformations and Raid Bosses.`,
		mod: 'mavmons',
		teambuilderFormat: "National Dex AG",
		ruleset: ['[Gen 9] National Dex Maverick* Mons'],
	},

];