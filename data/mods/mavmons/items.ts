export const Items: {[itemid: string]: ModdedItemData} = {
	starniumz: {
		name: "Starnium Z",
		desc: "If held by Charms with Falling Star, it can use Stars That Pierce the Sky.",
		spritenum: 687,
		onTakeItem: false,
		zMove: "Stars That Pierce the Sky",
		zMoveFrom: "Falling Star",
		itemUser: ["Charms"],
		num: -1,
		gen: 9,
	},
	earthlooplet: {
		name: "Earth Looplet",
		desc: "Ignores Hazards Like Boots",
		spritenum: 715,
		fling: {
			basePower: 80,
		},
		num: -2,
		gen: 9,
		rating: 3,
		// Hazard Immunity implemented in moves.ts
	},
	dianthite: {
		name: "Dianthite",
		desc: "If held by Diantha, this item allows her to Mega Evolve in battle.",
		spritenum: 625,
		megaStone: "Diantha-Mega",
		megaEvolves: "Diantha",
		itemUser: ["Diantha"],
		onTakeItem(item, source) {
			if (item.megaEvolves === source.baseSpecies.baseSpecies) return false;
			return true;
		},
		num: -3,
		gen: 9,
	},
	shelteriumz: {
		name: "Shelterium Z",
		desc: "If held by Roaring Knight with Sword Tunnel, it can use Crystal Nova.",
		spritenum: 686,
		onTakeItem: false,
		zMove: "Crystal Nova",
		zMoveFrom: "Sword Tunnel",
		itemUser: ["Roaring Knight"],
		num: -4,
		gen: 9,
	},
	lesbiumz: {
		name: "Lesbium Z",
		desc: "If held by Raiden Shogun with Musou Isshin, it can use Musou no Hitotachi.",
		spritenum: 634,
		onTakeItem: false,
		zMove: "Musou no Hitotachi",
		zMoveFrom: "Musou Isshin",
		itemUser: ["Raiden Shogun"],
		num: -5,
		gen: 9,
	},
	justiceaxe: {
		name: "Justice Axe",
		desc: "If held by Susie, turn Slash into Rude Buster, turn OKHeal into BetterHeal.",
		onStart(pokemon) {
			for (const moveSlot of pokemon.moveSlots) {
				if (moveSlot.id === 'slash') {
					moveSlot.id = 'rudebuster';
					moveSlot.move = this.dex.moves.get('rudebuster').name;
				}

				if (moveSlot.id === 'okheal') {
					moveSlot.id = 'betterheal';
					moveSlot.move = this.dex.moves.get('betterheal').name;
				}
			}
		},
		onTakeItem(item, source) {
			this.add('c', 'Susie',`As if I would let YOU take this from me!`);
			if (!this.activeMove) return false;
			if (this.activeMove.id !== 'knockoff' && this.activeMove.id !== 'thief' && this.activeMove.id !== 'covet') return false;
		},
		num: -6,
		gen: 9,
	},
	kyuremscoldbrew: {
        name: "Kyurem's Cold Brew",
		desc: "Boosts the power of Ice type moves by 1.2x.",
        onPlate: "Ice",
        onBasePower(basePower, user, target, move) {
			if (move.type === 'Ice') {
				return this.chainModify([4915, 4096]);
			}
		},
		onTakeItem(item, pokemon, source) {
			if ((source && source.baseSpecies.num === 2008) || pokemon.baseSpecies.num === 2008) {
				return false;
			}
			return true;
		},
        forcedForme: "Randeez-Ice",
		num: -7,
		gen: 9,
    },
	braziliandarkroast: {
        name: "Brazilian Dark Roast",
		desc: "Boosts the power of Dark type moves by 1.2x.",
        onPlate: "Dark",
        onBasePower(basePower, user, target, move) {
			if (move.type === 'Dark') {
				return this.chainModify([4915, 4096]);
			}
		},
		onTakeItem(item, pokemon, source) {
			if ((source && source.baseSpecies.num === 2008) || pokemon.baseSpecies.num === 2008) {
				return false;
			}
			return true;
		},
        forcedForme: "Randeez-Dark",
		num: -8,
		gen: 9,
    },
	dianthasauroralfrappe: {
        name: "Diantha's Auroral Frappe",
		desc: "Boosts the power of Fairy type moves by 1.2x.",
        onPlate: "Fairy",
        onBasePower(basePower, user, target, move) {
			if (move.type === 'Fairy') {
				return this.chainModify([4915, 4096]);
			}
		},
		onTakeItem(item, pokemon, source) {
			if ((source && source.baseSpecies.num === 2008) || pokemon.baseSpecies.num === 2008) {
				return false;
			}
			return true;
		},
        forcedForme: "Randeez-Fairy",
		num: -9,
		gen: 9,
    },
	hexmaniacsphantasmalespresso: {
        name: "Hex Maniac's Phantasmal Espresso",
		desc: "Boosts the power of Ghost type moves by 1.2x.",
        onPlate: "Ghost",
        onBasePower(basePower, user, target, move) {
			if (move.type === 'Ghost') {
				return this.chainModify([4915, 4096]);
			}
		},
		onTakeItem(item, pokemon, source) {
			if ((source && source.baseSpecies.num === 2008) || pokemon.baseSpecies.num === 2008) {
				return false;
			}
			return true;
		},
        forcedForme: "Randeez-Ghost",
		num: -10,
		gen: 9,
    },
	earthysumatra: {
        name: "Earthy Sumatra",
		desc: "Boosts the power of Ground type moves by 1.2x.",
        onPlate: "Ground",
        onBasePower(basePower, user, target, move) {
			if (move.type === 'Ground') {
				return this.chainModify([4915, 4096]);
			}
		},
		onTakeItem(item, pokemon, source) {
			if ((source && source.baseSpecies.num === 2008) || pokemon.baseSpecies.num === 2008) {
				return false;
			}
			return true;
		},
        forcedForme: "Randeez-Ground",
		num: -11,
		gen: 9,
    },
	klarasintoxicatingjava: {
        name: "Klara's Intoxicating Java",
		desc: "Boosts the power of Poison type moves by 1.2x.",
        onPlate: "Poison",
        onBasePower(basePower, user, target, move) {
			if (move.type === 'Poison') {
				return this.chainModify([4915, 4096]);
			}
		},
		onTakeItem(item, pokemon, source) {
			if ((source && source.baseSpecies.num === 2008) || pokemon.baseSpecies.num === 2008) {
				return false;
			}
			return true;
		},
        forcedForme: "Randeez-Poison",
		num: -12,
		gen: 9,
    },
	americano: {
        name: "Americano",
		desc: "Boosts the power of Water type moves by 1.2x.",
        onPlate: "Water",
        onBasePower(basePower, user, target, move) {
			if (move.type === 'Water') {
				return this.chainModify([4915, 4096]);
			}
		},
		onTakeItem(item, pokemon, source) {
			if ((source && source.baseSpecies.num === 2008) || pokemon.baseSpecies.num === 2008) {
				return false;
			}
			return true;
		},
        forcedForme: "Randeez-Water",
		num: -13,
		gen: 9,
    },
	nahidiumz: {
		name: "Nahidium Z",
		desc: "If held by Nahida with Scheme of Acuity, it can use Illusory rtburst.",
		spritenum: 635,
		onTakeItem: false,
		zMove: "Illusory Heartburst",
		zMoveFrom: "Scheme of Acuity",
		itemUser: ["Nahida"],
		num: -7,
		gen: 9,
	},
	geniumz: {
		name: "Genium Z",
		desc: "If held by Geno with Moonblast, it can use Star Riders.",
		spritenum: 648,
		onTakeItem: false,
		zMove: "Star Riders",
		zMoveFrom: "Moonblast",
		itemUser: ["Geno"],
		num: -8,
		gen: 9,
	},
	spyniumz: {
		name: "Spynium Z",
		desc: "If held by Spy with Backstab, it can use Right Behind You.",
		spritenum: 646,
		onTakeItem: false,
		zMove: "Right Behind You",
		zMoveFrom: "Backstab",
		itemUser: ["Spy"],
		num: -9,
		gen: 9,
	},
};
