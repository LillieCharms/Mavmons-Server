/*
Ratings and how they work:
-1: Detrimental
	  An ability that severely harms the user.
	ex. Defeatist, Slow Start
 0: Useless
	  An ability with no overall benefit in a singles battle.
	ex. Color Change, Plus
 1: Ineffective
	  An ability that has minimal effect or is only useful in niche situations.
	ex. Light Metal, Suction Cups
 2: Useful
	  An ability that can be generally useful.
	ex. Flame Body, Overcoat
 3: Effective
	  An ability with a strong effect on the user or foe.
	ex. Chlorophyll, Sturdy
 4: Very useful
	  One of the more popular abilities. It requires minimal support to be effective.
	ex. Adaptability, Magic Bounce
 5: Essential
	  The sort of ability that defines metagames.
	ex. Imposter, Shadow Tag
*/

export const Abilities: {[abilityid: string]: ModdedAbilityData} = {
	victorystar: {
		onAnyModifyAccuracyPriority: -1,
		onAnyModifyAccuracy(accuracy, target, source) {
			if (source.isAlly(this.effectState.target) && typeof accuracy === 'number') {
				return this.chainModify([5006, 4096]);
			}
		},
		flags: {},
		name: "Victory Star",
		rating: 2,
		num: 162,
	},
	protosynthesis: {
		onStart(pokemon) {
			this.singleEvent('WeatherChange', this.effect, this.effectState, pokemon);
		},
		onWeatherChange(pokemon) {
			// Protosynthesis is not affected by Utility Umbrella
			if (this.field.isWeather(['sunnyday', 'desolateland'])) {
				pokemon.addVolatile('protosynthesis');
			} else if (!pokemon.volatiles['protosynthesis']?.fromBooster && this.field.weather !== 'sunnyday') {
				// Protosynthesis will not deactivite if Sun is suppressed, hence the direct ID check (isWeather respects supression)
				pokemon.removeVolatile('protosynthesis');
			}
		},
		onEnd(pokemon) {
			delete pokemon.volatiles['protosynthesis'];
			this.add('-end', pokemon, 'Protosynthesis', '[silent]');
		},
		condition: {
			noCopy: true,
			onStart(pokemon, source, effect) {
				if (effect?.name === 'Booster Energy') {
					this.effectState.fromBooster = true;
					this.add('-activate', pokemon, 'ability: Protosynthesis', '[fromitem]');
				} else {
					this.add('-activate', pokemon, 'ability: Protosynthesis');
				}
				this.effectState.bestStat = pokemon.getBestStat(false, true);
				this.add('-start', pokemon, 'protosynthesis' + this.effectState.bestStat);
			},
			onModifyAtkPriority: 5,
			onModifyAtk(atk, pokemon) {
				if (this.effectState.bestStat !== 'atk' || pokemon.ignoringAbility()) return;
				this.debug('Protosynthesis atk boost');
				return this.chainModify([5325, 4096]);
			},
			onModifyDefPriority: 6,
			onModifyDef(def, pokemon) {
				if (this.effectState.bestStat !== 'def' || pokemon.ignoringAbility()) return;
				this.debug('Protosynthesis def boost');
				return this.chainModify([5325, 4096]);
			},
			onModifySpAPriority: 5,
			onModifySpA(spa, pokemon) {
				if (this.effectState.bestStat !== 'spa' || pokemon.ignoringAbility()) return;
				this.debug('Protosynthesis spa boost');
				return this.chainModify([5325, 4096]);
			},
			onModifySpDPriority: 6,
			onModifySpD(spd, pokemon) {
				if (this.effectState.bestStat !== 'spd' || pokemon.ignoringAbility()) return;
				this.debug('Protosynthesis spd boost');
				return this.chainModify([5325, 4096]);
			},
			onModifySpe(spe, pokemon) {
				if (this.effectState.bestStat !== 'spe' || pokemon.ignoringAbility()) return;
				this.debug('Protosynthesis spe boost');
				return this.chainModify(1.5);
			},
			onEnd(pokemon) {
				this.add('-end', pokemon, 'Protosynthesis');
			},
		},
		flags: {failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, notransform: 1},
		name: "Protosynthesis",
		rating: 3,
		num: 281,
	},
	starstruckveil: {
		shortDesc: "Fire type volt absorb. Special Justified. Ignore other abilities.",
		onTryHit(target, source, move) {
			if (target !== source && move.type === 'Fire') {
				if (!this.heal(target.baseMaxhp / 4)) {
					this.add('-immune', target, '[from] ability: Starstruck Veil');
				}
				return null;
			}
		},
		onModifyMove(move) {
			move.ignoreAbility = true;
		},
		onDamagingHit(damage, target, source, move) {
			if (move.type === 'Dark') {
				this.boost({spa: 1});
			}
		},
		name: "Starstruck Veil",
		rating: 3.5,
		num: -1,
	},
	benmode: {
		shortDesc: "When at 50% or less HP Ben transforms into his Ben Mode.",
		onStart(pokemon) {
			if (pokemon.baseSpecies.baseSpecies !== 'Minior' || pokemon.transformed) return;
			if (pokemon.hp > pokemon.maxhp / 2) {
				if (pokemon.species.forme !== 'Ben-Mode') {
					pokemon.formeChange('Ben-BenMode');
				}
			} else {
				if (pokemon.species.forme === 'Ben-Mode') {
					pokemon.formeChange(pokemon.set.species);
				}
			}
		},
		onResidualOrder: 29,
		onResidual(pokemon) {
			if (pokemon.baseSpecies.baseSpecies !== 'Ben' || pokemon.transformed || !pokemon.hp) return;
			if (pokemon.hp > pokemon.maxhp / 2) {
				if (pokemon.species.forme !== 'Ben Mode') {
					pokemon.formeChange('Ben-BenMode');
				}
			} else {
				if (pokemon.species.forme === 'Ben-Mode') {
					pokemon.formeChange(pokemon.set.species);
				}
			}
		},
		flags: {failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1},
		name: "Ben Mode",
		rating: 3,
		num: -2,
	},
	harmfulmental: {
		shortDesc: "The users attacks are powered up by 20%, but they take 10% recoil after landing an attack.",
		onModifyDamage(damage, source, target, move) {
			return this.chainModify([1200, 1000]);
		},
		onAfterMoveSecondarySelf(source, target, move) {
			if (source && source !== target && move && move.category !== 'Status' && !source.forceSwitchFlag) {
				this.damage(source.baseMaxhp / 10, source, source, this.dex.items.get('lifeorb'));
			}
		},
		name: "Harmful Mental",
		rating: 4,
		num: -3,
	},
	halaltrip: {
		shortDesc: "This Pokémon restores 3% of its HP at the end of every turn.",
		onResidualOrder: 5,
		onResidualSubOrder: 4,
		onResidual(pokemon) {
			this.heal(pokemon.baseMaxhp / 32);
		},
		name: "Halal Trip",
		rating: 3,
		num: -4,
	},
	anticipatedstrikes: {
		shortDesc: "Deals 2.1x (instead of 1.5x) for STAB moves.",
		onModifySTAB(stab, source, target, move) {
			if (move.forceSTAB || source.hasType(move.type)) {
				if (stab === 2) {
					return 2.50;
				}
				return 2;
			}
		},
		name: "Anticipated Strikes",
		rating: 4,
		num: -5,
	},
	colorpulse: {
		shortDesc: "When this Pokemon is hit by an attack, the effect of Psychic Terrain begins.",
		onDamagingHit(damage, target, source, move) {
			this.field.setTerrain('psychicterrain');
		},
		flags: {},
		name: "Color Pulse",
		rating: 2.5,
		num: -6,
	},
	serenity: {
		shortDesc: "This Pokemon’s Normal type moves become Psychic type and have 1.2x power",
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				'judgment', 'multiattack', 'naturalgift', 'revelationdance', 'technoblast', 'terrainpulse', 'weatherball',
			];
			if (move.type === 'Normal' && !noModifyType.includes(move.id) &&
				!(move.isZ && move.category !== 'Status') && !(move.name === 'Tera Blast' && pokemon.terastallized)) {
				move.type = 'Psychic';
				move.typeChangerBoosted = this.effect;
			}
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect) return this.chainModify([4915, 4096]);
		},
		flags: {},
		name: "Serenity",
		rating: 4,
		num: -7,
	},
	cageddemon: {
		shortDesc: "When the user is hit by a super effective attack, raises Atk/SpA by 2, lowers Def/SpD by 2, and the user slowly perishes. ",
		onModifyTypePriority: -1,
			onTryHit(target, source, move) {
				if (target !== source && move.type === 'Poison','Steel') {
					if (!this.boost({spa: 2, atk: 2, def: -2, spd: -2})) 
					source.addVolatile('perishsong');
					this.add('-start', source, 'perish3', '[silent]');
					return null;	
				}
			},
		name: "Caged Demon",
		rating: 4,
		num: -8,
	},
	katieluck: {
		shortDesc: "This pokemon has their secondary effect chance raised by 1.5x, crit chance raised by one stage, and multi hit moves hit at least 3 times.",
		onModifyMovePriority: -2,
		onModifyMove(move) {
			if (move.secondaries) {
				this.debug('doubling secondary chance');
				for (const secondary of move.secondaries) {
					if (secondary.chance) secondary.chance *= 2;
				}
			if (move.multihit && Array.isArray(move.multihit) && move.multihit.length) {
				move.multihit = move.multihit[1];
			}
			if (move.multiaccuracy) {
				delete move.multiaccuracy;
			}	
			}
			if (move.self?.chance) move.self.chance *= 2;
		},
		name: "Katie Luck",
		rating: 4,
		num: -10,
	},
	callofdarkness: {
		shortDesc: "At the end of each turn, if this Pokémon’s HP is at half or lower, causes all opposing Pokemon to lose 1/8 of their maximum HP, rounded down.",
		onResidualOrder: 28,
		onResidualSubOrder: 2,
		onResidual(pokemon) {
			if (!pokemon.hp) return;
			for (const target of pokemon.foes()) {
				if (pokemon.hp <= pokemon.maxhp / 2) {
					this.add('-anim', pokemon, "Dark Pulse", target);
					this.damage(target.baseMaxhp / 8, target, pokemon);
				}
			}
		},
		name: "Call of Darkness",
		rating: 4,
		num: -11,
	},
	colorfilter: {
		name: "Color Filter",
		shortDesc: "Limber + Keen Eye",
		onTryBoost(boost, target, source, effect) {
			if (source && target === source) return;
			if (boost.accuracy && boost.accuracy < 0) {
				delete boost.accuracy;
				if (!(effect as ActiveMove).secondaries) {
					this.add("-fail", target, "unboost", "accuracy", "[from] ability: Keen Eye", "[of] " + target);
				}
			}
		},
		onModifyMove(move) {
			move.ignoreEvasion = true;
		},
		onUpdate(pokemon) {
			if (pokemon.status === 'par') {
				this.add('-activate', pokemon, 'ability: Limber');
				pokemon.cureStatus();
			}
		},
		onSetStatus(status, target, source, effect) {
			if (status.id !== 'par') return;
			if ((effect as Move)?.status) {
				this.add('-immune', target, '[from] ability: Limber');
			}
			return false;
		},
		flags: {breakable: 1},
		rating: 2.5,
		num: -12,
	},
	blackoutcurtain: {
		onDamagingHit(damage, target, source, effect) {
			this.boost({atk: 1});
		},
		name: "Blackout Curtain",
		shortDesc: "When this Pokemon is damaged by an attack, its Atk is raised by 1.",
		rating: 4.5,
		num: -13,
	},
	frigidbloodline: {
		onTryHit(target, source, move) {
			if (target !== source && move.type === 'Ice') {
				if (!this.heal(target.baseMaxhp / 4)) {
					this.add('-immune', target, '[from] ability: Frigid Bloodline');
				}
				return null;
			}
		},
		flags: {breakable: 1},
		name: "Frigid Bloodline",
		shortDesc: "This Pokemon heals 1/4 of its max HP when hit by Ice moves; Ice immunity.",
		rating: 3.5,
		num: -14,
	},
	// Curse Weaver utilizing Ghost-type curse is handled within moves.ts
	curseweaver: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk, attacker, defender, move) {
			if (move.type === 'Ghost') {
				this.debug('Curse Weaver boost');
				return this.chainModify(1.5);
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, attacker, defender, move) {
			if (move.type === 'Ghost') {
				this.debug('Curse Weaver boost');
				return this.chainModify(1.5);
			}
		},
		onSourceModifyAtkPriority: 6,
		onSourceModifyAtk(atk, attacker, defender, move) {
			if (move.type === 'Ghost') {
				this.debug('Curse Weaver weaken');
				return this.chainModify(0.5);
			}
		},
		onSourceModifySpAPriority: 5,
		onSourceModifySpA(spa, attacker, defender, move) {
			if (move.type === 'Ghost') {
				this.debug('Curse Weaver weaken');
				return this.chainModify(0.5);
			}
		},
		flags: {breakable: 1},
		name: "Curse Weaver",
		shortDesc: "Attacking stat multiplied by 1.5 while using a Ghost-type attack; halves damage received from Ghost attacks. Curse becomes Ghost-type version.",
		rating: 3.5,
		num: -16,
	},
	jellydessertqueen: {
		onResidual(pokemon) {
			// this.add('-heal', pokemon, pokemon.getHealth, '[from] ability: Jelly Dessert Queen');
			this.heal(pokemon.baseMaxhp / 16);
		},
		name: "Jelly Dessert Queen",
		shortDesc: "This Pokemon recovers 1/16 max HP at the end of each turn.",
		rating: 4,
		num: -17,
	},
	binarysoul: {
		onResidualOrder: 29,
		onResidual(pokemon) {
			if (pokemon.species.baseSpecies !== 'Twinrova' || pokemon.terastallized) return;
			const targetForme = pokemon.species.name === 'Twinrova' ? 'Twinrova-Fire' : 'Twinrova';
			pokemon.formeChange(targetForme);
		},
		// I have no clue what's going on here, all I know is that this is how Morpeko was coded
		flags: {failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, notransform: 1},
		name: "Binary Soul",
		shortDesc: "If Twinrova, it changes between Fire and Ice at the end of each turn.",
		rating: 1,
		num: -18,
	},
	perplexinggaze: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk, attacker, defender, move) {
			if (move.type === 'Psychic') {
				this.debug('Perplexing Gaze boost');
				return this.chainModify(1.5);
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, attacker, defender, move) {
			if (move.type === 'Psychic') {
				this.debug('Perplexing Gaze boost');
				return this.chainModify(1.5);
			}
		},
		flags: {},
		name: "Perplexing Gaze",
		shortDesc: "This Pokemon's Psychic moves have 1.5x power.",
		rating: 3.5,
		num: -19,
	},
	rainbowpuppeteer: {
		onModifyMove(move) {
			move.forceSTAB = true;
		},
		flags: {},
		name: "Rainbow Puppeteer",
		shortDesc: "This Pokemon's moves have STAB.",
		rating: 4,
		num: -20,
	},
	devouringjaw: {
		onModifyMove(move) {
			if (move.flags['bite']) { 
				move.drain ||= [1, 2];
			}
		},
		flags: {},
		name: "Devouring Jaw",
		shortDesc: "This Pokemon's biting moves heal it for 50% of the damage dealt.",
		rating: 3,
		num: -21,
	},
	divearmor: {
		onSourceModifyDamage(damage, source, target, move) {
			if (target.getMoveHitData(move).typeMod > 0) {
				this.debug('DiVE Armor neutralize');
				return this.chainModify(0.75);
			}
		},
		onDamage(damage, target, source, effect) {
			if (
				effect.effectType === "Move" &&
				!effect.multihit &&
				(!effect.negateSecondary && !(effect.hasSheerForce && source.hasAbility('sheerforce')))
			) {
				this.effectState.checkedBerserk = false;
			} else {
				this.effectState.checkedBerserk = true;
			}
		},
		onTryEatItem(item) {
			const healingItems = [
				'aguavberry', 'enigmaberry', 'figyberry', 'iapapaberry', 'magoberry', 'sitrusberry', 'wikiberry', 'oranberry', 'berryjuice',
			];
			if (healingItems.includes(item.id)) {
				return this.effectState.checkedBerserk;
			}
			return true;
		},
		onAfterMoveSecondary(target, source, move) {
			this.effectState.checkedBerserk = true;
			if (!source || source === target || !target.hp || !move.totalDamage) return;
			const lastAttackedBy = target.getLastAttackedBy();
			if (!lastAttackedBy) return;
			const damage = move.multihit ? move.totalDamage : lastAttackedBy.damage;
			if (target.hp < target.maxhp / 4 && target.hp + damage >= target.maxhp / 4) {
				const bestStat = target.getBestStat(true, true);
				this.boost({[bestStat]: 1}, target, target);
			}
		},
		flags: {breakable: 1},
		name: "DiVE Armor",
		shortDesc: "Recieves 3/4 damage from SE attacks; highest stat raised by 1 when hp below 25%.",
		rating: 3,
		num: -22,
	},
	shadowgift: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk, attacker, defender, move) {
			if (move.type === 'Ghost') {
				this.debug('Shadowgift boost');
				return this.chainModify(1.5);
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, attacker, defender, move) {
			if (move.type === 'Ghost') {
				this.debug('Shadowgift boost');
				return this.chainModify(1.5);
			}
		},
		name: "Shadowgift",
		shortDesc: "Attacking stat multiplied by 1.5 while using a Ghost-type attack.",
		rating: 3.5,
		num: -23,
	},
	galeforce: {
		onSourceAfterFaint(length, target, source, effect) {
			if (effect && effect.effectType === 'Move') {
				this.add('-anim', source, "Tailwind", source);
				source.addVolatile('galeforce');
			}
		},
		condition: {
			onModifyPriority(priority, pokemon, target, move) {
				pokemon.removeVolatile('galeforce')
				return priority + 1;
			},
		},
		name: "Galeforce",
		shortDesc: "If this Pokemon attacks and KO's a target, next move used has +1 priority.",
		rating: 3,
		num: -24,
	},
	smirk: {
		// On protect effect handled in moves.ts
		onFoeDamagingHit(damage, target, source, move) {
			if (target.getMoveHitData(move).typeMod > 0) {
				this.debug('Smirk trigger');
				source.addVolatile('laserfocus');
			}
		},
		onAfterMove(pokemon, target, move) {
			if (pokemon.moveThisTurnResult === false) {
				this.debug('Smirk trigger');
				target.addVolatile('laserfocus');
			}
		},
		name: "Smirk",
		shortDesc: "On Supereffective attack or a failed move against this Pokemon, grants Laser Focus.",
		rating: 3,
		num: -25,
	},
	// This isn't a doubles mod!
	refresher: {
		name: "Refresher",
		shortDesc: "30% chance to restore ally's health for 1/4 at the end of each turn",
		rating: 1,
		num: -26,
	},
	autobuild: {
		name: "Autobuild",
		shortDesc: "This Pokemon is immune to hazards & terrain.",
		// Literally every element of this has to be handled via moves.ts
		rating: 4,
		num: -27,
	},
};
