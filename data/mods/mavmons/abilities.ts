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
	    onResidualOrder: 29,
		onResidual(pokemon) {
			if (pokemon.baseSpecies.baseSpecies !== 'Ben' || pokemon.transformed) {
				return;
			}

			if (pokemon.hp <= pokemon.maxhp / 2 && pokemon.species.forme !== 'Ben-Mode') {
				this.add('-activate', pokemon, 'ability: Ben Mode');
				pokemon.formeChange('benben', this.effect, true);
			} else if (pokemon.hp > pokemon.maxhp / 2 && pokemon.species.forme === 'Ben-Mode') {
				pokemon.formeChange('Ben', this.effect, true);
			}
		},
		condition: {
			onStart(pokemon) {
				if (pokemon.species.id !== 'benben') {
					pokemon.formeChange('Ben-Mode');
				}
			},
			onEnd(pokemon) {
				if (pokemon.species.forme === 'Ben-Mode') {
					pokemon.formeChange('Ben');
				}
			},
		}
		flags: {failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1},
		name: "Ben Mode",
		rating: 5,
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
			condition: 
			{
			onTrapPokemon(pokemon) {
				pokemon.tryTrap();
			},
		},
		boosts: {
			atk: 2,
			spa: 2,
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
	laserpressure: {
		shortDesc: "Decreases Atk and Sp.Atk of all opponents on the field by 20% each.",
		onStart(pokemon) {
			if (this.suppressingAbility(pokemon)) return;
			this.add('-ability', pokemon, 'Laser Pressure');
		},
		onAnyModifyAtk(atk, target, source, move) {
			const abilityHolder = this.effectState.target;
			if (target.hasAbility('Laser Pressure')) return;
			if (!move.ruinedAtk?.hasAbility('Laser Pressure')) move.ruinedAtk = abilityHolder;
			if (move.ruinedAtk !== abilityHolder) return;
			this.debug('Laser Pressure Atk drop');
			return this.chainModify(0.20);
		},
		onAnyModifySpa(spa, target, source, move) {
			const abilityHolder = this.effectState.target;
			if (target.hasAbility('Laser Pressure')) return;
			if (!move.ruinedSpa?.hasAbility('Laser Pressure')) move.ruinedSpa = abilityHolder;
			if (move.ruinedSpa !== abilityHolder) return;
			this.debug('Laser Pressure Spa drop');
			return this.chainModify(0.20);
		},
		flags: {},
		name: "Laser Pressure",
		rating: 5,
		num: -11,
	},
	chargingego: {
		shortDesc: "Boosts the Pokémon's Atk, Sp.Atk and Accuracy stats by two stages the first time it KOs an opponent.",
		onSourceAfterFaint(length, target, source, effect) {
			if (effect && effect.effectType === 'Move') {
				this.boost({atk: length}, source);
			}
			if (effect && effect.effectType === 'Move') {
				this.boost({spa: length}, source);
			}
			if (effect && effect.effectType === 'Move') {
				this.boost({accuracy: length}, source);
			}
		},
		flags: {},
		name: "Charging Ego",
		rating: 4,
		num: -12,
	},
	solidarity: {
        onStart(pokemon) {
            let FairyBoost = 0;
                this.add('-activate', pokemon, 'ability: Solidarity');
                { 
                    for(let i = 0; i < pokemon.side.pokemon.length; i++){
                        if (pokemon.side.pokemon[i].hasType('Fairy')) {
                            FairyBoost += 1;    
                        }
                    }
                }
                this.add('-start', pokemon, `FAIRYBOOST (${FairyBoost})`, '[silent]');
                this.effectState.Fairy = FairyBoost;
        },
        onEnd(pokemon) {
            this.add('-end', pokemon, `FAIRYBOOST (${this.effectState.FairyBoost})`, '[silent]');
        },
        onBasePowerPriority: 21,
        onBasePower(basePower, attacker, defender, move) {
            if (this.effectState.FairyBoost) {
                const powMod = [4096, 4300.8, 4505.6, 4710.4, 4915.2, 5120, 5324.8];
                this.debug(`Solidarity boost: ${powMod[this.effectState.FairyBoost]}/4096`);
                return this.chainModify([powMod[this.effectState.FairyBoost], 4096]);
            }
        },
        name: "Solidarity",
		shortDesc: "For each Fairy type Pokemon on the team, raise non-speed stats by 5%.",
        rating: 4,
        num: -13,
    },
	dragonfucker: {
        onStart(pokemon) {
            let DragonBoost = 0;
                this.add('-activate', pokemon, 'ability: Dragonfucker');
                { 
                    for(let i = 0; i < pokemon.side.pokemon.length; i++){
                        if (pokemon.side.pokemon[i].hasType('Dragon')) {
                            DragonBoost += 1;    
                        }
                    }
                }
                this.add('-start', pokemon, `DRAGONBOOST (${Solid})`, '[silent]');
                this.effectState.Dragon = DragonBoost;
        },
        onEnd(pokemon) {
            this.add('-end', pokemon, `DRAGONBOOST (${this.effectState.DragonBoost})`, '[silent]');
        },
        onBasePowerPriority: 21,
        onBasePower(basePower, attacker, defender, move) {
            if (this.effectState.Solid) {
                const powMod = [4096, 4300.8, 4505.6, 4710.4, 4915.2, 5120, 5324.8];
                this.debug(`Dragonfucker boost: ${powMod[this.effectState.DragonBoost]}/4096`);
                return this.chainModify([powMod[this.effectState.DragonBoost], 4096]);
            }
        },
        name: "Dragonfucker",
		shortDesc: "For each Dragon type Pokemon on the team, raise non-speed Stats by 5%.",
        rating: 4,
        num: -14,
    },
	todaysbrew: {
		// Multitype's type-changing itself is implemented in statuses.js
		flags: {failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1},
		name: "Today's Brew",
		shortDesc: "User's secondary typing/forme changes based on Coffee held.",
		rating: 4,
		num: -15,
	},
	multifaceted: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk, attacker, defender, move) {
			if (move.type === 'Fighting') {
				this.debug('Multi-Faceted boost');
				return this.chainModify(1.5);
			}
			if (move.type === 'Psychic') {
				this.debug('Multi-Faceted boost');
				return this.chainModify(1.5);
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, attacker, defender, move) {
			if (move.type === 'Fighting') {
				this.debug('Multi-Faceted boost');
				return this.chainModify(1.5);
			}
			if (move.type === 'Psychic') {
				this.debug('Multi-Faceted boost');
				return this.chainModify(1.5);
			}
		},
		flags: {},
		name: "Multi-Faceted",
		rating: 3.5,
		num: -16,
	},
	yetdarker: {
		onStart(pokemon) {
			if (pokemon.m.guardBroken === undefined) {
				pokemon.m.guardBroken = false;
			}
			this.field.addPseudoWeather('darkness');
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (!target.m.guardBroken) {
				return this.chainModify(0.75);
			}
		},
		onDamagingHit(damage, target, source, move) {
			const hitData = target.getMoveHitData(move);
			if (!target.m.guardBroken && hitData?.typeMod > 0) {
				target.m.guardBroken = true;
				this.add('-activate', target, 'ability: Yet Darker');
				this.add('-message', `${target.name} let its guard down!`);
			}
		},
		flags: {},
		name: "Yet Darker",
		shortDesc: "Sets Darkness upon switch in, 3/4 damage from attacks until Super Effective hit.",
		rating: 4,
		num: -17,
	},
	wecantaffordnottotry: {
        onPrepareHit(source, target, move) {
            if (this.randomChance(21, 100)) {
            move.multihit = 2;
            }
        },
        onSourceModifyAccuracyPriority: -1,
            onSourceModifyAccuracy(accuracy, target, source, move) {
                if (typeof accuracy === 'number') {
                    return this.chainModify([79, 100]);
                }
        },
        flags: {},
        name: "We Cant Afford Not To Try",
        rating: 4.5,
        num: -18,
    },
	ladysironwill: {
		onSwitchOut(pokemon) {
			pokemon.heal(pokemon.baseMaxhp / 3);
		},
		onCheckShow(pokemon) {
				// This is complicated
				// For the most part, in-game, it's obvious whether or not Natural Cure activated,
				// since you can see how many of your opponent's pokemon are statused.
				// The only ambiguous situation happens in Doubles/Triples, where multiple pokemon
				// that could have Natural Cure switch out, but only some of them get cured.
				if (pokemon.side.active.length === 1) return;
				if (pokemon.showCure === true || pokemon.showCure === false) return;
	
				const cureList = [];
				let noCureCount = 0;
				for (const curPoke of pokemon.side.active) {
					// pokemon not statused
					if (!curPoke?.status) {
						// this.add('-message', "" + curPoke + " skipped: not statused or doesn't exist");
						continue;
					}
					if (curPoke.showCure) {
						// this.add('-message', "" + curPoke + " skipped: Natural Cure already known");
						continue;
					}
					const species = curPoke.species;
					// pokemon can't get Natural Cure
					if (!Object.values(species.abilities).includes("Lady's Iron Will")) {
						// this.add('-message', "" + curPoke + " skipped: no Natural Cure");
						continue;
					}
					// pokemon's ability is known to be Natural Cure
					if (!species.abilities['1'] && !species.abilities['H']) {
						// this.add('-message', "" + curPoke + " skipped: only one ability");
						continue;
					}
					// pokemon isn't switching this turn
					if (curPoke !== pokemon && !this.queue.willSwitch(curPoke)) {
						// this.add('-message', "" + curPoke + " skipped: not switching");
						continue;
					}
	
					if (curPoke.hasAbility('ladysironwill')) {
						// this.add('-message', "" + curPoke + " confirmed: could be Natural Cure (and is)");
						cureList.push(curPoke);
					} else {
						// this.add('-message', "" + curPoke + " confirmed: could be Natural Cure (but isn't)");
						noCureCount++;
					}
				}
	
				if (!cureList.length || !noCureCount) {
					// It's possible to know what pokemon were cured
					for (const pkmn of cureList) {
						pkmn.showCure = true;
					}
				} else {
					// It's not possible to know what pokemon were cured
	
					// Unlike a -hint, this is real information that battlers need, so we use a -message
					this.add('-message', "(" + cureList.length + " of " + pokemon.side.name + "'s pokemon " + (cureList.length === 1 ? "was" : "were") + " cured by Lady's Iron Will.)");
	
					for (const pkmn of cureList) {
						pkmn.showCure = false;
					}
				}
			},
			onSwitchOut(pokemon) {
				if (!pokemon.status) return;
	
				// if pokemon.showCure is undefined, it was skipped because its ability
				// is known
				if (pokemon.showCure === undefined) pokemon.showCure = true;
	
				if (pokemon.showCure) this.add('-curestatus', pokemon, pokemon.status, "[from] ability: Lady's Iron Will");
				pokemon.clearStatus();
	
				// only reset .showCure if it's false
				// (once you know a Pokemon has Natural Cure, its cures are always known)
				if (!pokemon.showCure) pokemon.showCure = undefined;
			},
		flags: {},
		name: "Lady's Iron Will",
		rating: 4.5,
		num: -19,
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
