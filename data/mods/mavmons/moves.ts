/*
List of flags and their descriptions:
authentic: Ignores a target's substitute.
bite: Power is multiplied by 1.5 when used by a Pokemon with the Strong Jaw Ability.
bullet: Has no effect on Pokemon with the Bulletproof Ability.
charge: The user is unable to make a move between turns.
contact: Makes contact.
dance: When used by a Pokemon, other Pokemon with the Dancer Ability can attempt to execute the same move.
defrost: Thaws the user if executed successfully while the user is frozen.
distance: Can target a Pokemon positioned anywhere in a Triple Battle.
gravity: Prevented from being executed or selected during Gravity's effect.
heal: Prevented from being executed or selected during Heal Block's effect.
mirror: Can be copied by Mirror Move.
mystery: Unknown effect.
nonsky: Prevented from being executed or selected in a Sky Battle.
powder: Has no effect on Grass-type Pokemon, Pokemon with the Overcoat Ability, and Pokemon holding Safety Goggles.
protect: Blocked by Detect, Protect, Spiky Shield, and if not a Status move, King's Shield.
pulse: Power is multiplied by 1.5 when used by a Pokemon with the Mega Launcher Ability.
punch: Power is multiplied by 1.2 when used by a Pokemon with the Iron Fist Ability.
recharge: If this move is successful, the user must recharge on the following turn and cannot make a move.
reflectable: Bounced back to the original user by Magic Coat or the Magic Bounce Ability.
snatch: Can be stolen from the original user and instead used by another Pokemon using Snatch.
sound: Has no effect on Pokemon with the Soundproof Ability.
*/

export const Moves: {[k: string]: ModdedMoveData} = {
	fallingstar: {
		num: -1,
		accuracy: 90,
		basePower: 100,
		category: "Special",
		shortDesc: "Deals x2 damage and grounds levitating/flying Pokemon.",
		name: "Falling Star",
		pp: 10,
		priority: 0,
		flags: {contact: 1, protect: 1, mirror: 1},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Draco Meteor", target);
			this.add('-anim', source, "Swift", target);
		},
		basePowerCallback(pokemon, target, move) {
			if (target.hasType("Flying") || target.hasAbility('levitate')) {
				this.debug('BP doubled from Floating');
				return move.basePower * 2;
			}
			return move.basePower;
		},
		volatileStatus: 'smackdown',
		condition: {
			noCopy: true,
			onStart(pokemon) {
				let applies = false;
				if (pokemon.hasType('Flying') || pokemon.hasAbility('levitate')) applies = true;
				if (pokemon.hasItem('ironball') || pokemon.volatiles['ingrain'] ||
					this.field.getPseudoWeather('gravity')) applies = false;
				if (pokemon.removeVolatile('fly') || pokemon.removeVolatile('bounce')) {
					applies = true;
					this.queue.cancelMove(pokemon);
					pokemon.removeVolatile('twoturnmove');
				}
				if (pokemon.volatiles['magnetrise']) {
					applies = true;
					delete pokemon.volatiles['magnetrise'];
				}
				if (pokemon.volatiles['telekinesis']) {
					applies = true;
					delete pokemon.volatiles['telekinesis'];
				}
				if (!applies) return false;
				this.add('-start', pokemon, 'Smack Down');
			},
			onRestart(pokemon) {
				if (pokemon.removeVolatile('fly') || pokemon.removeVolatile('bounce')) {
					this.queue.cancelMove(pokemon);
					pokemon.removeVolatile('twoturnmove');
					this.add('-start', pokemon, 'Smack Down');
				}
			},
			// groundedness implemented in battle.engine.js:BattlePokemon#isGrounded
		},
		secondary: null,
		target: "allAdjacentFoes",
		type: "Fairy",
		contestType: "Cute",
	},
	faeflood: {
		num: -2,
		accuracy: 95,
		basePower: 90,
		category: "Special",
		shortDesc: "Removes field Effects. Lowers foe speed by 1.",
		name: "Fae Flood",
		pp: 10,
		priority: 0,
		flags: {contact: 1, protect: 1, mirror: 1},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Lunar Blessing", target);
			this.add('-anim', source, "Surf", target);
		},
		onHit() {
			this.field.clearTerrain();
		},
		onAfterSubDamage() {
			this.field.clearTerrain();
		},
		secondary: {
			chance: 100,
			boosts: {
				spe: -1,
			},
		},
		weather: 'none',
		target: "allAdjacentFoes",
		type: "Water",
		contestType: "Cute",
	},
	rainbowroad: {
		num: -3,
		accuracy: 100,
		basePower: 75,
		category: "Special",
		shortDesc: "Switch out, 50% chance to Burn, drop SpDef by 1, or Confuse opponent.",
		name: "Rainbow Road",
		pp: 10,
		priority: 0,
		flags: {protect: 1, mirror: 1},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Moonlight", target);
			this.add('-anim', source, "U-Turn", target);
		},
		selfSwitch: true,
		secondary: {
			chance: 50,
			onHit(target, source) {
				const result = this.random(3);
				if (result === 0) {
					target.trySetStatus('brn', source);
				} else if (result === 1) {
					this.boost({spd: -1}, target, source);
				} else {
					target.addVolatile('confusion', source);
				}
			},
		},
		target: "normal",
		type: "Fire",
		contestType: "Clever",
	},
	marketingblast: {
		num: -4,
		accuracy: 100,
		basePower: 90,
		category: "Special",
		shortDesc: "Sets up a layer of spikes.",
		name: "Marketing Blast",
		pp: 10,
		priority: 0,
		flags: {contact: 1, protect: 1, mirror: 1, metronome: 1},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Moonblast", target);
		},
		onAfterHit(target, source, move) {
			if (!move.hasSheerForce && source.hp) {
				for (const side of source.side.foeSidesWithConditions()) {
					side.addSideCondition('spikes');
				}
			}
		},
		onAfterSubDamage(damage, target, source, move) {
			if (!move.hasSheerForce && source.hp) {
				for (const side of source.side.foeSidesWithConditions()) {
					side.addSideCondition('spikes');
				}
			}
		},
		secondary: {}, // Sheer Force-boosted
		target: "normal",
		type: "Fairy",
		contestType: "Beautiful",
	},
	sublimeheaven: {
		num: -5,
		accuracy: 100,
		basePower: 100,
		category: "Special",
		shortDesc: "Super effective on Dragon-type Pokemon.",
		name: "Sublime Heaven",
		pp: 5,
		priority: 0,
		flags: {protect: 1, mirror: 1},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Secret Sword", target);
		},
		onEffectiveness(typeMod, target, type) {
			if (type === 'Dragon') return 1;
		},
		onBasePower(basePower, source, target, move) {
			if (target.runEffectiveness(move) > 0) {
				// Placeholder
				this.debug(`sublime heaven super effective buff`);
				return this.chainModify([5461, 4096]);
			}
		},
		secondary: null,
		target: "normal",
		type: "Fighting",
		contestType: "Clever",
	},
	disarm: {
		num: -6,
		accuracy: 100,
		basePower: 0,
		category: "Status",
		shortDesc: "The foes Attack and Special Attack are lowered by 1, taunts foe for 3 turns.",
		name: "Disarm",
		pp: 15,
		priority: 1,
		flags: {protect: 1, mirror: 1},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Charm", target);
		},
		onHit(target, source, move) {
			const success = this.boost({atk: -1, spa: -1}, target, source);
		},
		volatileStatus: 'taunt',
		condition: {
			duration: 3,
			onStart(target) {
				if (target.activeTurns && !this.queue.willMove(target)) {
					this.effectState.duration++;
				}
				this.add('-start', target, 'move: Taunt');
			},
			onResidualOrder: 15,
			onEnd(target) {
				this.add('-end', target, 'move: Taunt');
			},
			onDisableMove(pokemon) {
				for (const moveSlot of pokemon.moveSlots) {
					const move = this.dex.moves.get(moveSlot.id);
					if (move.category === 'Status' && move.id !== 'mefirst') {
						pokemon.disableMove(moveSlot.id);
					}
				}
			},
			onBeforeMovePriority: 5,
			onBeforeMove(attacker, defender, move) {
				if (!move.isZ && !move.isMax && move.category === 'Status' && move.id !== 'mefirst') {
					this.add('cant', attacker, 'move: Taunt', move);
					return false;
				}
			},
		},
		secondary: null,
		target: "normal",
		type: "Fairy",
		contestType: "Cute",
	},
	ragingdemon: {
		num: -7,
		accuracy: 100,
		basePower: 100,
		category: "Physical",
		shortDesc: "When KOing a target using this move, recover 1/4th of user's max HP",
		name: "Raging Demon",
		pp: 10,
		priority: 0,
		flags: {contact: 1, protect: 1, mirror: 1},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Wicked Blow", target);
		},
		onAfterMoveSecondarySelf(pokemon, target, move) {
			if (!target || target.fainted || target.hp <= 0) this.heal(pokemon.baseMaxhp / 4);
		},
		secondary: null,
		target: "normal",
		type: "Dark",
		contestType: "Cool",
	},
	starsthatpiercethesky: {
		num: -8,
		accuracy: true,
		basePower: 180,
		category: "Special",
		name: "Stars That Pierce The Sky",
		shortDesc: "Blocks healing and removes all hazards.",
		pp: 1,
		priority: 0,
		flags: {},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Meteor Beam", target);
			this.add('-anim', source, "Light That Burns the Sky", target);
		},
		onHit(target, source, move) {
			let success = false;

			const removeTarget = [
				'reflect',
				'lightscreen',
				'auroraveil',
				'safeguard',
				'mist',
				'spikes',
				'toxicspikes',
				'stealthrock',
				'stickyweb',
				'gmaxsteelsurge',
				'electricfence',
			];

			const removeAll = [
				'spikes',
				'toxicspikes',
				'stealthrock',
				'stickyweb',
				'gmaxsteelsurge',
				'electricfence',
			];

			for (const targetCondition of removeTarget) {
				if (!target.side.removeSideCondition(targetCondition)) continue;

				if (removeAll.includes(targetCondition)) {
					const condition = this.dex.conditions.get(targetCondition);

					this.add(
						'-sideend',
						target.side,
						condition?.name || targetCondition,
						'[from] move: Stars That Pierce The Sky',
						'[of] ' + source
					);
				}

				success = true;
			}

			for (const sideCondition of removeAll) {
				if (source.side.removeSideCondition(sideCondition)) {
					const condition = this.dex.conditions.get(sideCondition);

					this.add(
						'-sideend',
						source.side,
						condition?.name || sideCondition,
						'[from] move: Stars That Pierce The Sky',
						'[of] ' + source
					);

					success = true;
				}
			}

			this.field.clearTerrain();

			return success;
		},
		isZ: "starniumz",
		secondary: null,
		target: "normal",
		type: "Fairy",
		contestType: "Beautiful",
	},
	threehitstring: {
		num: -9,
		accuracy: true,
		basePower: 90,
		category: "Physical",
		shortDesc: "High critical hit ratio. Ignore Abilities. Does not check accuracy.",
		name: "Three Hit String",
		pp: 10,
		priority: 0,
		flags: {contact: 1, protect: 1, mirror: 1},
		critRatio: 2,
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Smart Strike", target);
		},
		ignoreAbility: true,
		target: "normal",
		type: "Steel",
		contestType: "Cool",
	},
	coins: {
		num: -10,
		accuracy: 100,
		basePower: 30,
		category: "Physical",
		name: "Coins!!!",
		shortDesc: "Removes hazards from user's side and sets a layer of Steel Spikes.",
		pp: 10,
		priority: -1,
		flags: {protect: 1, mirror: 1},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Make it Rain", target);
			this.add('-anim', source, "Rapid Spin", target);
		},
		self: {
			onHit(source) {
				for (const side of source.side.foeSidesWithConditions()) {
					side.addSideCondition('gmaxsteelsurge');
				}
			},
		},
		condition: {
			onSideStart(side) {
				this.add('-sidestart', side, 'move: G-Max Steelsurge');
			},
			onEntryHazard(pokemon) {
				if (pokemon.hasItem('heavydutyboots')) return;
				// Ice Face and Disguise correctly get typed damage from Stealth Rock
				// because Stealth Rock bypasses Substitute.
				// They don't get typed damage from Steelsurge because Steelsurge doesn't,
				// so we're going to test the damage of a Steel-type Stealth Rock instead.
				const steelHazard = this.dex.getActiveMove('Stealth Rock');
				steelHazard.type = 'Steel';
				const typeMod = this.clampIntRange(pokemon.runEffectiveness(steelHazard), -6, 6);
				this.damage(pokemon.maxhp * Math.pow(2, typeMod) / 8);
			},
		},
		onAfterHit(target, pokemon, move) {
			if (!move.hasSheerForce) {
				if (pokemon.hp && pokemon.removeVolatile('leechseed')) {
					this.add('-end', pokemon, 'Leech Seed', '[from] move: Rapid Spin', '[of] ' + pokemon);
				}
				const sideConditions = ['spikes', 'toxicspikes', 'stealthrock', 'stickyweb', 'gmaxsteelsurge'];
				for (const condition of sideConditions) {
					if (pokemon.hp && pokemon.side.removeSideCondition(condition)) {
						this.add('-sideend', pokemon.side, this.dex.conditions.get(condition).name, '[from] move: Rapid Spin', '[of] ' + pokemon);
					}
				}
				if (pokemon.hp && pokemon.volatiles['partiallytrapped']) {
					pokemon.removeVolatile('partiallytrapped');
				}
			}
		},
		onAfterSubDamage(damage, target, pokemon, move) {
			if (!move.hasSheerForce) {
				if (pokemon.hp && pokemon.removeVolatile('leechseed')) {
					this.add('-end', pokemon, 'Leech Seed', '[from] move: Rapid Spin', '[of] ' + pokemon);
				}
				const sideConditions = ['spikes', 'toxicspikes', 'stealthrock', 'stickyweb', 'gmaxsteelsurge'];
				for (const condition of sideConditions) {
					if (pokemon.hp && pokemon.side.removeSideCondition(condition)) {
						this.add('-sideend', pokemon.side, this.dex.conditions.get(condition).name, '[from] move: Rapid Spin', '[of] ' + pokemon);
					}
				}
				if (pokemon.hp && pokemon.volatiles['partiallytrapped']) {
					pokemon.removeVolatile('partiallytrapped');
				}
			}
		},
		secondary: null,
		target: "normal",
		type: "Steel",
		contestType: "Beautiful",
	},
	callanuber: {
		num: -11,
		accuracy: 100,
		basePower: 70,
		category: "Physical",
		shortDesc: "User switches out.",
		name: "Call an Uber",
		pp: 20,
		priority: 0,
		flags: {protect: 1, mirror: 1},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Shift Gear", target);
			this.add('-anim', source, "U-Turn", target);
		},
		selfSwitch: true,
		target: "normal",
		type: "Dark",
		contestType: "Cool",
	},
	shockbubble: {
		num: -12,
		accuracy: true,
		basePower: 0,
		category: "Status",
		shortDesc: "Protects user, if a move is blocked sets up Electric Terrain.",
		name: "Shock Bubble",
		pp: 15,
		priority: 4,
		flags: {protect: 1},
		onPrepareHit(target, source, pokemon) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Tail Glow", target);
			this.add('-anim', source, "Protect", target);
			return !!this.queue.willAct() && this.runEvent('StallMove', pokemon);
		},
		stallingMove: true,
		volatileStatus: 'shockbubble',
		condition: {
			duration: 1,
			onStart(target) {
				this.add('-singleturn', target, 'move: Protect');
			},
			onTryHitPriority: 3,
			onTryHit(target, source, move) {
				if (move.category === 'Status') return;

				if (!move.flags['protect']) {
					if (['gmaxoneblow', 'gmaxrapidflow'].includes(move.id)) return;
					if (move.isZ || move.isMax) target.getMoveHitData(move).zBrokeProtect = true;
					return;
				}
				if (move.smartTarget) {
					move.smartTarget = false;
				} else {
					this.add('-activate', target, 'move: Protect');
				}
				const lockedmove = source.getVolatile('lockedmove');
				if (lockedmove) {
					// Outrage counter is reset
					if (source.volatiles['lockedmove'].duration === 2) {
						delete source.volatiles['lockedmove'];
					}
				}

				this.field.setTerrain('electricterrain');
				return this.NOT_FAIL;
			},
		},
		target: "self",
		type: "Electric",
		contestType: "Cool",
	},
	trizooka: {
		num: -13,
		accuracy: 90,
		basePower: 120,
		category: "Special",
		shortDesc: "Super Effective on Fighting types. High Crit Ratio. Ignores all stat changes.",
		name: "Trizooka",
		pp: 5,
		priority: 0,
		flags: {contact: 1, protect: 1, mirror: 1, metronome: 1},
		onEffectiveness(typeMod, target, type) {
			if (type === 'Fighting') return 1;
		},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Origin Pulse", target);
		},
		infiltrates: true,
		ignoreEvasion: true,
		ignoreDefensive: true,
		secondary: null,
		target: "normal",
		type: "Water",
		contestType: "Cool",
	},
	bullethell: {
		num: -14,
		accuracy: 100,
		basePower: 70,
		category: "Special",
		shortDesc: "10% chance to raise the user's Special Attack and Speed by 1.",
		name: "Bullet Hell",
		pp: 10,
		priority: 0,
		flags: {protect: 1, mirror: 1, metronome: 1},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Tri Attack", target);
			this.add('-anim', source, "Hyper Beam", target);
		},
		secondary: {
			chance: 10,
			self: {
				boosts: {
					spa: 1,
					spe: 1,
				},
			},
		},
		target: "normal",
		type: "Psychic",
		contestType: "Smart",
	},
	deepbreath: {
		num: -15,
		accuracy: true,
		basePower: 0,
		category: "Status",
		shortDesc: "Heals 50% of HP, user is immune to status for the 2 turns.",
		name: "Deep Breath",
		pp: 5,
		priority: 0,
		flags: {heal: 1, snatch: 1, metronome: 1},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Bulk Up", target);
		},
		heal: [3, 10],
		sideCondition: 'safeguard',
		condition: {
			duration: 5,
			durationCallback(target, source, effect) {
				if (source?.hasAbility('persistent')) {
					this.add('-activate', source, 'ability: Persistent', '[move] Safeguard');
					return 2;
				}
				return 2;
			},
			onSetStatus(status, target, source, effect) {
				if (!effect || !source) return;
				if (effect.id === 'yawn') return;
				if (effect.effectType === 'Move' && effect.infiltrates && !target.isAlly(source)) return;
				if (target !== source) {
					this.debug('interrupting setStatus');
					if (effect.name === 'Synchronize' || (effect.effectType === 'Move' && !effect.secondaries)) {
						this.add('-activate', target, 'move: Safeguard');
					}
					return null;
				}
			},
			onTryAddVolatile(status, target, source, effect) {
				if (!effect || !source) return;
				if (effect.effectType === 'Move' && effect.infiltrates && !target.isAlly(source)) return;
				if ((status.id === 'confusion' || status.id === 'yawn') && target !== source) {
					if (effect.effectType === 'Move' && !effect.secondaries) this.add('-activate', target, 'move: Safeguard');
					return null;
				}
			},
			onSideStart(side, source) {
				if (source?.hasAbility('persistent')) {
					this.add('-sidestart', side, 'Safeguard', '[persistent]');
				} else {
					this.add('-sidestart', side, 'Safeguard');
				}
			},
			onSideResidualOrder: 26,
			onSideResidualSubOrder: 3,
			onSideEnd(side) {
				this.add('-sideend', side, 'Safeguard');
			},
		},
		secondary: null,
		target: "allySide",
		type: "Psychic",
		zMove: {boost: {spe: 1}},
		contestType: "Beautiful",
	},
	killerwail51: {
		num: -16,
		accuracy: 100,
		basePower: 65,
		category: "Special",
		shortDesc: "At the end of the next 3 turns, lowers the foes Defense/Special Defense by 1 stage.",
		name: "Killer Wail 5.1",
		pp: 10,
		priority: 0,
		flags: {mirror: 1, metronome: 1, sound: 1, bypasssub: 1, protect: 1},
		secondary: {
			chance: 100,
			volatileStatus: 'killerwail51',
		},
		target: "normal",
		type: "Normal",
	},
	anxietypills: {
		num: -17,
		accuracy: true,
		basePower: 0,
		category: "Status",
		shortDesc: "Restores 50% of user's max HP, summons Safeguard.",
		name: "Anxiety Pills",
		pp: 5,
		priority: 0,
		flags: {snatch: 1, heal: 1, metronome: 1},
		heal: [1, 2],
		sideCondition: 'safeguard',
		condition: {
			duration: 5,
			durationCallback(target, source, effect) {
				if (source?.hasAbility('persistent')) {
					this.add('-activate', source, 'ability: Persistent', '[move] Safeguard');
					return 2;
				}
				return 2;
			},
			onSetStatus(status, target, source, effect) {
				if (!effect || !source) return;
				if (effect.id === 'yawn') return;
				if (effect.effectType === 'Move' && effect.infiltrates && !target.isAlly(source)) return;
				if (target !== source) {
					this.debug('interrupting setStatus');
					if (effect.name === 'Synchronize' || (effect.effectType === 'Move' && !effect.secondaries)) {
						this.add('-activate', target, 'move: Safeguard');
					}
					return null;
				}
			},
			onTryAddVolatile(status, target, source, effect) {
				if (!effect || !source) return;
				if (effect.effectType === 'Move' && effect.infiltrates && !target.isAlly(source)) return;
				if ((status.id === 'confusion' || status.id === 'yawn') && target !== source) {
					if (effect.effectType === 'Move' && !effect.secondaries) this.add('-activate', target, 'move: Safeguard');
					return null;
				}
			},
			onSideStart(side, source) {
				if (source?.hasAbility('persistent')) {
					this.add('-sidestart', side, 'Safeguard', '[persistent]');
				} else {
					this.add('-sidestart', side, 'Safeguard');
				}
			},
			onSideResidualOrder: 26,
			onSideResidualSubOrder: 3,
			onSideEnd(side) {
				this.add('-sideend', side, 'Safeguard');
			},
		},
		secondary: null,
		target: "self",
		type: "Normal",
		zMove: {effect: 'clearnegativeboost'},
		contestType: "Clever",
	},
	elementalbomb: {
		num: -18,
		accuracy: 100,
		basePower: 45,
		category: "Special",
		shortDesc: "Hits 2 times, each hit has a 20% chance to burn.",
		name: "Elemental Bomb Bottle",
		pp: 5,
		multihit: 2,
		priority: 0,
		flags: {protect: 1, mirror: 1, metronome: 1, bullet: 1},
 		onHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Weather Ball", target);
		},
		secondary: {
			chance: 20,
			status: 'brn',
		},
		target: "normal",
		type: "Normal",
		contestType: "Clever",
	},
	starshatter: {
		num: -19,
		accuracy: 95,
		basePower: 30,
		category: "Special",
		shortDesc: "Hits 2-5 times.",
		name: "Starshatter",
		pp: 15,
		priority: 0,
		flags: {protect: 1, mirror: 1},
		onPrepareHit(target, source, move) {
		  this.attrLastMove('[still]');
		  this.add('-anim', source, "Rock Blast", target);
		},
		secondary: null,
		multihit: [2, 5],
		target: "normal",
		type: "Rock",
		contestType: "Cute",
	},
	pitchingchange: {
		num: -20,
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Pitching Change",
		shortDesc: "Switches the user out. The incoming Pokemon restores 1/16 of its max HP.",
		pp: 10,
		priority: 0,
		flags: {},
		target: "self",
		type: "Normal",

		selfSwitch: true,

		onHit(source) {
			source.addVolatile('pitchingchange');
		},
	},
	fullchargedshot: {
		num: -21,
		accuracy: 80,
		basePower: 180,
		category: "Special",
		name: "Full Charged Shot",
		shortDesc: "Ignores effects of abilities and moves, can't be used twice in a row. ",
		pp: 5,
		priority: 0,
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Sparkling Aria", target);
			this.add('-anim', source, "Hyper Beam", target);
		},
		flags: {protect: 1, mirror: 1, metronome: 1, cantusetwice: 1},
		ignoreAbility: true,
		target: "normal",
		type: "???",
		contestType: "Cute",
	},
	wavebreaker: {
		num: -22,
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Wavebreaker",
		shortDesc: "-2 evasion. Sets hazard, 25% damage to non-levitating Pokemon. Lasts 4 turns.",
		pp: 10,
		priority: 4,
		flags: {snatch: 1, heal: 1, metronome: 1},
		sideCondition: 'wavebreaker',
		boosts: {
			evasion: -2,
		},
		secondary: null,
		target: "self",
		type: "Water",
		contestType: "Cool",
	},
	inkmine: {
		num: -23,
		accuracy: true,
		basePower: 0,
		category: "Special",
		shortDesc: "Deals damage equal to 35% max HP, -1 Def/SpDef. Fails if target is not attacking.",
		name: "Ink Mine",
		pp: 10,
		priority: 1,
		flags: {protect: 1, mirror: 1, metronome: 1},
		onTry(source, target) {
			const action = this.queue.willMove(target);
			const move = action?.choice === 'move' ? action.move : null;
			if (!move || (move.category === 'Status' && move.id !== 'mefirst') || target.volatiles['mustrecharge']) {
				return false;
			}
		},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Surf", target);
			this.add('-anim', source, "Muddy Water", target);
			this.add('-anim', source, "Giga Drain", target);
		},
		damageCallback(pokemon, target) {
			return this.clampIntRange(target.getUndynamaxedHP() / 7, 20);
		},
		secondary: {
			chance: 100,
			boosts: {
				spd: -1,
				def: -1,
			},
		},
		target: "normal",
		type: "Steel",
		contestType: "Clever",
	},
	nextonesonme: {
		num: -24,
		accuracy: true,
		basePower: 0,
		category: "Status",
		shortDesc: " restore 25% hp and cure status. If targeting self, Spe/Acc +1.",
		name: "Next One's On Me",
		pp: 10,
		priority: 0,
		flags: {heal: 1, bypasssub: 1, allyanim: 1},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Milk Drink", target);
			this.add('-anim', source, "Ultra Burst", target);
		},
		onHit(pokemon) {
			const success = !!this.heal(this.modify(pokemon.maxhp, 0.25));
			return pokemon.cureStatus() || success;
		},
		boosts: {
			spe: 1,
			accuracy: 1,
		},
		secondary: null,
		target: "allies",
		type: "Ground",
	},
	ashesanddust: {
		num: -25,
		accuracy: 100,
		basePower: 20,
		category: "Special",
		shortDesc: "Physical if user's Atk > Sp. Atk. Hits 5 times.",
		name: "Ashes and Dust",
		pp: 10,
		priority: 0,
		flags: {protect: 1, mirror: 1, metronome: 1},
		multihit: 5,
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Hyperspace Fury", target);
			this.add('-anim', source, "Spacial Rend", target);
		},
		onTryMove(source, target, move) {
			const atk = source.getStat('atk', false, true);
			const spa = source.getStat('spa', false, true);

			const def = target.getStat('def', false, true);
			const spd = target.getStat('spd', false, true);

			if (atk > spa && spd < def) {
				move.category = "Special";
			} else if (spa >= atk && def < spd) {
				move.category = "Physical";
			}
		},
		onModifyType(move, pokemon) {
			const plate = pokemon.getItem().onPlate;
			if (plate) move.type = plate;
			else move.type = "Steel";
		},
		secondary: null,
		target: "normal",
		type: "Steel",
		zMove: {basePower: 140},
		maxMove: {basePower: 130},
		contestType: "Tough",
	},
	dragonspear: {
		num: -26,
		accuracy: 100,
		basePower: 90,
		category: "Special",
		shortDesc: "Lowers the PP of the target's last move by 3. Ignores Sub.",
		name: "Dragon Spear",
		pp: 10,
		priority: 0,
		flags: {protect: 1, bypasssub: 1},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Clangorous Soul", target);
			this.add('-anim', source, "Doom Desire", target);
		},
		onHit(target) {
			let move: Move | ActiveMove | null = target.lastMove;
			if (!move || move.isZ) return false;
			if (move.isMax && move.baseMove) move = this.dex.moves.get(move.baseMove);

			const ppDeducted = target.deductPP(move.id, 3);
			if (!ppDeducted) return false;
			this.add("-activate", target, 'move: Dragon Spear', move.name, ppDeducted);
		},
		secondary: null,
		target: "normal",
		type: "Dragon",
		contestType: "Beautiful",
	},
		electricfence: {
		num: -27,
		accuracy: true,
		basePower: 0,
		category: "Status",
		shortDesc: "Sets up an Electric-type damaging hazard.",
		name: "Electric Fence",
		pp: 10,
		priority: 0,
		flags: {reflectable: 1},
		self: {
			onHit(source) {
				for (const side of source.side.foeSidesWithConditions()) {
					side.addSideCondition('electricfence');
				}
			},
		},
		condition: {
			onSideStart(side) {
				this.add('-sidestart', side, 'move: Electric Fence');
			},
			onEntryHazard(pokemon) {
				if (pokemon.hasItem('heavydutyboots') || pokemon.hasItem('earthlooplet') || pokemon.hasAbility('autobuild')) return;
				// Ice Face and Disguise correctly get typed damage from Stealth Rock
				// because Stealth Rock bypasses Substitute.
				// They don't get typed damage from Steelsurge because Steelsurge doesn't,
				// so we're going to test the damage of a Steel-type Stealth Rock instead.
				const electricHazard = this.dex.getActiveMove('Stealth Rock');
				electricHazard.type = 'Electric';
				const typeMod = this.clampIntRange(pokemon.runEffectiveness(electricHazard), -6, 6);
				this.damage(pokemon.maxhp * Math.pow(2, typeMod) / 8);
			},
		},
		secondary: null,
		target: "adjacentFoe",
		type: "Electric",
		contestType: "Cool",
	},
	canopyhunter: {
			num: -28,
			accuracy: 100,
			basePower: 80,
			category: "Special",
			shortDesc: "Super Effective against Fire types.",
			name: "Canopy Hunter",
			pp: 20,
			priority: 0,
			flags: {protect: 1, mirror: 1, metronome: 1},
			onEffectiveness(typeMod, target, type) {
				if (type === 'Fire') return 1;
			},
			onPrepareHit(target, source, pokemon) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Drum Beating", target);
		},
			target: "normal",
			type: "Grass",
			contestType: "Beautiful",
		},
	thirdeye: {
		num: -29,
		accuracy: true,
		basePower: 0,
		category: "Status",
		shortDesc: "Protects user, if a move is blocked reduces Spa by 1.",
		name: "Third Eye",
		pp: 15,
		priority: 4,
		flags: {contact: 1, slicing: 1, heal: 1, protect: 1, mirror: 1},
		onPrepareHit(target, source, pokemon) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Tail Glow", target);
			this.add('-anim', source, "Protect", target);
			return !!this.queue.willAct() && this.runEvent('StallMove', pokemon);
		},
		stallingMove: true,
		volatileStatus: 'thirdeye',
		onHit(pokemon) {
			pokemon.addVolatile('stall');
		},
		condition: {
			duration: 1,
			onStart(target) {
				this.add('-singleturn', target, 'move: Protect');
			},
			onTryHitPriority: 3,
			onTryHit(target, source, move) {
				if (!move.flags['protect']) {
					if (['gmaxoneblow', 'gmaxrapidflow'].includes(move.id)) return;
					if (move.isZ || move.isMax) target.getMoveHitData(move).zBrokeProtect = true;
					return;
				}
				if (move.smartTarget) {
					move.smartTarget = false;
				} else {
					this.add('-activate', target, 'move: Protect');
				}
				const lockedmove = source.getVolatile('lockedmove');
				if (lockedmove) {
					// Outrage counter is reset
					if (source.volatiles['lockedmove'].duration === 2) {
						delete source.volatiles['lockedmove'];
					}
				}
				if (this.checkMoveMakesContact(move, source, target)) {
					this.field.setTerrain('electricterrain');
				}
				return this.NOT_FAIL;
			},
			onHit(target, source, move) {
							if (move.isZOrMaxPowered && this.checkMoveMakesContact(move, source, target)) {
								this.boost({spa: -1}, source, target, this.dex.getActiveMove("Third Eye"));
							}
						},
		},
		target: "self",
		type: "Psychic",
		contestType: "Cool",
	},
	flameofideals: {
		num: -30,
		accuracy: 100,
		basePower: 130,
		category: "Special",
		name: "Flame of Ideals",
		shortDesc: "No additional effect.",
		pp: 5,
		priority: 0,
		flags: {contact: 1, protect: 1, mirror: 1, metronome: 1},
		secondary: null,
		target: "normal",
		type: "Fire",
		contestType: "Tough",
	},
 	shotgunspreadycross42: {
		num: -31,
		accuracy: 99,
		basePower: 28,
		category: "Physical",
		name: "Shotgun Spread Y Cross 42",
		shortDesc: "Hits 4 times.",
		pp: 10,
		priority: 0,
		flags: {contact: 1, protect: 1, mirror: 1, slicing: 1},
		multihit: 4,
		multiaccuracy: true,
		secondary: null,
		target: "normal",
		type: "Fighting",
	},
	burstbomb: {
		num: -32,
		accuracy: 100,
		basePower: 55,
		category: "Special",
		name: "Burst Bomb",
		shortDesc: "Usually hits first.",
		pp: 10,
		priority: 1,
		flags: {protect: 1, mirror: 1, bullet: 1, metronome: 1},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Snipe Shot", target);
		},
		target: "normal",
		type: "Water",
		contestType: "Cool",
	},
	cargothrow: {
		num: -33,
		accuracy: 100,
		basePower: 60,
		category: "Physical",
		name: "Cargo Throw",
		shortDesc: "Switches the opponent out. If the opponent is under half HP, always crits. Hits Ghost-types.",
		pp: 15,
		priority: -6,
		flags: {contact: 1, protect: 1, mirror: 1, metronome: 1, noassist: 1, failcopycat: 1},
		onModifyMovePriority: -5,
		onModifyMove(move) {
			move.ignoreEvasion = true;
			if (!move.ignoreImmunity) move.ignoreImmunity = {};
			if (move.ignoreImmunity !== true) {
				move.ignoreImmunity['Fighting'] = true;
			}
		},
		onModifyCritRatio(critRatio, source, target) {
			if (target.hp * 2 <= target.maxhp) return 5;
		},
		forceSwitch: true,
		target: "normal",
		type: "Fighting",
		contestType: "Cool",
	},
	swordtunnel: {
		num: -34,
		accuracy: 100,
		basePower: 18,
		category: "Physical",
		name: "Sword Tunnel",
		shortDesc: "Hits 5 times.",
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', target, "Swords Dance", target);
		},
		pp: 10,
		priority: 0,
		flags: {contact: 1, protect: 1, mirror: 1, bullet: 1, metronome: 1},
		multihit: 5,
		secondary: null,
		target: "normal",
		type: "Dark",
	},
	swoon: {
		num: -35,
		accuracy: 100,
		basePower: 50,
		basePowerCallback(pokemon, target, move) {
			// You can't get here unless the pursuit succeeds
			if (target.beingCalledBack || target.switchFlag) {
				this.debug('swoon damage boost');
				return move.basePower * 2;
			}
			return move.basePower;
		},
		category: "Physical",
		name: "Swoon",
		shortDesc: "if opponent is attempting to switch out, power doubles, hits before switching.",
		pp: 10,
		priority: 0,
		flags: {contact: 1, protect: 1, mirror: 1, metronome: 1},
		beforeTurnCallback(pokemon) {
			for (const side of this.sides) {
				if (side.hasAlly(pokemon)) continue;
				side.addSideCondition('swoon', pokemon);
				const data = side.getSideConditionData('swoon');
				if (!data.sources) {
					data.sources = [];
				}
				data.sources.push(pokemon);
			}
		},
		onModifyMove(move, source, target) {
			if (target?.beingCalledBack || target?.switchFlag) move.accuracy = true;
		},
		onTryHit(target, pokemon) {
			target.side.removeSideCondition('swoon');
		},
		condition: {
			duration: 1,
			onBeforeSwitchOut(pokemon) {
				this.debug('Swoon start');
				let alreadyAdded = false;
				pokemon.removeVolatile('destinybond');
				for (const source of this.effectState.sources) {
					if (!source.isAdjacent(pokemon) || !this.queue.cancelMove(source) || !source.hp) continue;
					if (!alreadyAdded) {
						this.add('-activate', pokemon, 'move: Swoon');
						alreadyAdded = true;
					}
					// Run through each action in queue to check if the Pursuit user is supposed to Mega Evolve this turn.
					// If it is, then Mega Evolve before moving.
					if (source.canMegaEvo || source.canUltraBurst) {
						for (const [actionIndex, action] of this.queue.entries()) {
							if (action.pokemon === source && action.choice === 'megaEvo') {
								this.actions.runMegaEvo(source);
								this.queue.list.splice(actionIndex, 1);
								break;
							}
						}
					}
					this.actions.runMove('swoon', source, source.getLocOf(pokemon));
				}
			},
		},
		secondary: null,
		target: "normal",
		type: "Dark",
		contestType: "Clever",
	},
	godoflightstyrfing: {
        num: -36,
        accuracy: 100,
        basePower: 40,
        category: "Physical",
        name: "God of Lights Tyrfing",
		shortDesc: "+3 Atk/Def/SpDef until end of the turn. 15% Recoil.",
        pp: 5,
        priority: 0,
        flags: { protect: 1},
        priorityChargeCallback(pokemon) {
            pokemon.addVolatile('godoflightstyrfing');
            },
        condition: {
            duration: 1,
            onStart(pokemon) {
                this.add('-singleturn', pokemon, 'move: God of Lights Tyrfing');
                            this.add('-prepare', pokemon);
                this.boost({ atk: 3, def: 3, spd: 3}, pokemon);
            },
            onAfterMove(pokemon, target, move) {
                    this.damage(Math.round(pokemon.maxhp / 8), pokemon, pokemon, this.dex.conditions.get('Steel Beam'), true);
            },
            onEnd(pokemon) {
            this.boost({ atk: -3, def: -3, spd: -3}, pokemon);
            }
        },
        secondary: null,
        target: "normal",
        type: "Steel",
        contestType: "Tough",
    },
	crystalnova: {
		num: -37,
		accuracy: true,
		basePower: 180,
		category: "Physical",
		name: "Crystal Nova",
		shortDesc: "Adds 3 turns to Darkness.",
		pp: 1,
		priority: 0,
		flags: {protect: 1, mirror: 1, metronome: 1},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Night Shade", target);
			this.add('-anim', source, "Black Hole Eclipse", target);
			this.add('-anim', source, "Behemoth Blade", target);
		},
		onHit(target, source) {
			const id = 'darkness';
			const pw = this.field.pseudoWeather[id];
			if (pw) {
				const remaining = pw.duration || 0;
				this.field.removePseudoWeather(id);
				this.field.addPseudoWeather(id, source, null, {
					duration: remaining + 3,
				});
				this.add('-message', "The Roaring extends the Darkness!");
			} else {
				this.field.addPseudoWeather(id, source, null, {
					duration: 3,
				});
			}
		},
		isZ: "shelteriumz",
		secondary: null,
		target: "normal",
		type: "Dark",
		contestType: "Cool",
	},
	musouisshin: {
		num: -38,
		accuracy: 100,
		basePower: 100,
		category: "Physical",
		name: "Musou Isshin",
		shortDesc: "No additional effect.",
		pp: 5,
		priority: 0,
		flags: {protect: 1, mirror: 1, metronome: 1},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Fusion Bolt", target);
		},
		secondary: null,
		target: "normal",
		type: "Electric",
		contestType: "Cool",
	},
	eternalpatience: {
		num: -39,
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Eternal Patience",
		shortDesc: "Protects from attacks. If attacked, deals 1/10th Max HP damage to opponent.",
		pp: 10,
		priority: 4,
		flags: {failinstruct: 1},
		stallingMove: true,
		volatileStatus: 'eternalpatience',
		onPrepareHit(pokemon) {
			this.attrLastMove('[still]');
			this.add('-anim', pokemon, "Protect", pokemon);
			return !!this.queue.willAct() && this.runEvent('StallMove', pokemon);
		},
		onHit(pokemon) {
			pokemon.addVolatile('stall');
		},
		condition: {
			duration: 1,
			onStart(target) {
				this.add('-singleturn', target, 'move: Protect');
			},
			onTryHitPriority: 3,
			onTryHit(target, source, move) {
				if (!move.flags['protect'] || move.category === 'Status') {
					if (['gmaxoneblow', 'gmaxrapidflow'].includes(move.id)) return;
					if (move.isZ || move.isMax) target.getMoveHitData(move).zBrokeProtect = true;
					return;
				}
				if (move.smartTarget) {
					move.smartTarget = false;
				} else {
					this.add('-activate', target, 'move: Protect');
				}
				const lockedmove = source.getVolatile('lockedmove');
				if (lockedmove) {
					// Outrage counter is reset
					if (source.volatiles['lockedmove'].duration === 2) {
						delete source.volatiles['lockedmove'];
					}
				}
				this.damage(source.baseMaxhp / 10, source, target);
				return this.NOT_FAIL;
			},
		},
		secondary: null,
		target: "self",
		type: "Ghost",
		zMove: {boost: {def: 1}},
		contestType: "Tough",
	},
	musounohitotachi: {
		num: -40,
		accuracy: true,
		basePower: 0,
		damageCallback(pokemon, target) {
			return Math.max(0, target.hp - Math.floor(target.maxhp * 0.4));
		},
		category: "Special",
		name: "Musou no Hitotachi",
		shortDesc: "Sets target's HP to 40%. Flinches.",
		pp: 1,
		priority: 0,
		flags: {},
		onPrepareHit(target, source, move) {
		this.attrLastMove('[still]');
		this.add('-anim', source, "Poltergeist", target);
		},
		isZ: "lesbiumz",
		breaksProtect: true,
		secondary: {
					chance: 100,
					volatileStatus: 'flinch',
				},
		target: "normal",
		type: "Electric",
		contestType: "Tough",
	},
	senketsukisaragi: {
		num: -41,
		accuracy: 100,
		basePower: 150,
		category: "Physical",
		name: "Senketsu Kisaragi",
		shortDesc: "Can only be used by Ryuko-Syncronized, reverts back to Ryuko Matoi.",
		pp: 1,
		priority: 0,
		flags: {contact: 1, protect: 1, mirror: 1, failcopycat: 1, failmimic: 1, slicing: 1},
		onTry(source) {
			if (source.species.id !== 'ryukosyncronized') {
				this.add('-fail', source, 'move: Senketsu Kisaragi');
				return false;
			}
		},
		onPrepareHit(source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Extreme Evoboost", source);
			this.add('-anim', source, "Behemoth Blade", source);
		},
		secondary: null,
		self: {
			onHit(pokemon) {
				if (pokemon.species.id !== 'ryukosyncronized') return;
				if (!pokemon.formeChange('Ryuko', this.effect, true)) return;
				this.add('-message', 'Ryuko burnt up all her Life Fibers and reverted back to her base form!');
			},
		},
		noPPBoosts: true,
		target: "normal",
		type: "Fire",
		contestType: "Cool",
	},
	scissorblade: {
		num: -42,
		accuracy: 100,
		basePower: 90,
		category: "Physical",
		name: "Scissor Blade",
		shortDesc: "Ignore stat changes & abilities. 20% chance to boost atk by 1.",
		pp: 10,
		priority: 0,
		flags: {protect: 1, mirror: 1, metronome: 1},
		ignoreEvasion: true,
		ignoreDefensive: true,
		ignoreAbility: true,
		secondary: {
					chance: 20,
						boosts: {
							def: 1,
						},
				},
		target: "normal",
		type: "Fire",
		contestType: "Cool",
	},
	decapitationmode: {
		num: -43,
		accuracy: 100,
		basePower: 70,
		category: "Physical",
		name: "Decapitation Mode",
		shortDesc: "Power doubles if the target's HP is 50% or less.",
		pp: 10,
		priority: 0,
		flags: {protect: 1, mirror: 1, metronome: 1},
		onBasePower(basePower, pokemon, target) {
			if (target.hp * 2 <= target.maxhp) {
				return this.chainModify(2);
			}
		},
		secondary: null,
		target: "normal",
		type: "Fire",
		contestType: "Tough",
	},
	senisoshitsu: {
		num: -44,
		accuracy: true,
		basePower: 20,
		category: "Physical",
		name: "SEN-I-SOSHITSU",
		shortDesc: "Raises the user's Atk by 3 if this KO's the target. Bypass Accuracy",
		pp: 5,
		priority: 0,
		flags: {contact: 1, protect: 1, mirror: 1, metronome: 1},
		onAfterMoveSecondarySelf(pokemon, target, move) {
			if (!target || target.fainted || target.hp <= 0) this.boost({atk: 3}, pokemon, pokemon, move);
		},
		secondary: null,
		target: "normal",
		type: "Fire",
		contestType: "Cool",
	},
	rudebuster: {
		num: -45,
		accuracy: 100,
		basePower: 100,
		category: "Special",
		name: "Rude Buster",
		shortDesc: "Uses Atk in calculation, deals Rude damage.",
		pp: 10,
		priority: 0,
		flags: {protect: 1, mirror: 1, metronome: 1},
		overrideOffensiveStat: 'atk',
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Spatial Rend", target);
			this.add('-anim', source, "Psywave", target);
		},
		onModifyMove(move, pokemon) {
			if (pokemon.species.id === 'susie') {
				move.forceSTAB = true;
			}
		},
		secondary: null,
		target: "normal",
		type: "???",
		contestType: "Cool",
	},
	saction: {
			num: -46,
			accuracy: 100,
			basePower: 90,
			category: "Physical",
			name: "S-Action",
			shortDesc: "Performs a random S-Action.",
			pp: 10,
			priority: 0,
			flags: {contact: 1, protect: 1, mirror: 1, metronome: 1},
			onAfterHit(target, source, move) {
				// Kill quote
				if (target.hp <= 0) {
					this.add('c', 'Susie', `"Heh... you're never gonna win, you hear me?!"`);
					return;
				}
				// Super effective quote
				if (target.getMoveHitData(move).typeMod > 0) {
					this.add('c', 'Susie', `"Your weakness? Oh yeah, Flowery told me."`);
					return;
				}
				// Low HP quote
				if (source.hp <= source.maxhp / 4) {
					this.add('c', 'Susie', `"Didn't... think I'd still be standing, did you?"`);
					return;
				}
				// Misc quotes
				const quotes = [
					`"(lancer drove in and blew up the opponent!)"`,
					`"Watch THIS! (Susie throws her axe wildly!)"`,
					`"Talk your way out of THIS!"`,
					`"Think fast!"`,
				];
				this.add('c', 'Susie', quotes[this.random(quotes.length)]);
			},
			target: "normal",
			type: "Dark",
			contestType: "Cool",
	},
	giantpunch: {
    num: -47,
    accuracy: 100,
    basePower: 50,
		basePowerCallback(pokemon) {
			if (pokemon.volatiles.smashrage) {
				return 350;
			}

			const stacks =
				pokemon.volatiles.giantpunchstacks?.stacks || 0;

			return Math.min(350, 50 + (stacks * 30));
		},

		onAfterMove(pokemon) {
			const volatile = pokemon.volatiles.giantpunchstacks;
			if (!volatile) return;

			const stacks = volatile.stacks || 0;

			if (stacks > 0) {
				this.add(
					'-message',
					`${pokemon.name} used all Giant Punch's charge!`
				);
			}

			if (!pokemon.volatiles.smashrage) {
				if (stacks >= 10) {
					this.boost({
						atk: 2,
						def: 2,
						spe: 2,
					}, pokemon);
				} else if (stacks >= 5) {
					this.boost({
						atk: 1,
						def: 1,
						spe: 1,
					}, pokemon);
				}
			}

			volatile.stacks = 0;

			this.add(
				'-message',
				`${pokemon.name}'s Giant Punch charge reset to 0!`
			);
		},

		target: "normal",
		category: "Physical",
		name: "Giant Punch",
		shortDesc: "+30 Power when attacked, Max 10 hits. Additional effects at 5-10 hits.",
		type: "Fighting",
		pp: 10,
		contact: true,
	},
	pretzeldog: {
		num: -48,
		name: "Pretzel Dog",
		shortDesc: "Heals the user for 25% max HP and cures status conditions. Heals more based on user's current HP.",
		accuracy: true,
		basePower: 0,
		onHit(pokemon) {
		if (pokemon.hp === pokemon.maxhp && !pokemon.status) {
			this.add('-fail', pokemon);
			return false;
		}
		let healAmount;
			if (pokemon.volatiles.chezesports) {
				const hpPercent =
					pokemon.hp / pokemon.maxhp;
				if (hpPercent <= 0.20) {
					healAmount = 0.85;
				} else if (hpPercent <= 0.30) {
					healAmount = 0.70;
				} else if (hpPercent <= 0.40) {
					healAmount = 0.60;
				} else if (hpPercent <= 0.50) {
					healAmount = 0.50;
				} else {
					healAmount = 0.40;
				}
			} else {
				healAmount = 0.25;
				const hpPercent =
					pokemon.hp / pokemon.maxhp;
				if (hpPercent < 0.5) {
					const increments =
						Math.floor((0.5 - hpPercent) * 10);
					healAmount += increments * 0.10;
				}
			}
			this.heal(
				Math.floor(pokemon.maxhp * healAmount),
				pokemon
			);

			pokemon.cureStatus();
		},
		category: "Status",
		type: "Normal",
		pp: 5,
		target: "self",
		contestType: "Beautiful",
	},
	crystalbarrage: {
		num: -49,
		accuracy: 100,
		basePower: 10,
		category: "Physical",
		name: "Crystal Barrage",
		shortDesc: "No additional effects.",
		pp: 10,
		priority: 0,
		flags: {},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Swift", source);
		},
		basePowerCallback(pokemon, target, move) {
			return 20 * move.hit;
		},
		multihit: 4,
		multiaccuracy: true,
		isZ: "geniumz",
		secondary: null,
		target: "normal",
		type: "Dark",
		contestType: "Beautiful",
	},
	cutsceneswoon: {
		num: -50,
		accuracy: 100,
		basePower: 50,
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Pursuit", source);
		},
		basePowerCallback(pokemon, target, move) {
			// You can't get here unless the pursuit succeeds
			if (target.beingCalledBack || target.switchFlag) {
				this.debug('cutscene swoon damage boost');
				return move.basePower * 3;
			}
			return move.basePower;
		},
		category: "Physical",
		name: "Cutscene Swoon",
		shortDesc: "if opponent is attempting to switch out, power doubles, hits before switching.",
		pp: 10,
		priority: 0,
		flags: {contact: 1, protect: 1, mirror: 1, metronome: 1},
		beforeTurnCallback(pokemon) {
			for (const side of this.sides) {
				if (side.hasAlly(pokemon)) continue;
				side.addSideCondition('cutsceneswoon', pokemon);
				const data = side.getSideConditionData('cutsceneswoon');
				if (!data.sources) {
					data.sources = [];
				}
				data.sources.push(pokemon);
			}
		},
		onModifyMove(move, source, target) {
			if (target?.beingCalledBack || target?.switchFlag) move.accuracy = true;
		},
		onTryHit(target, pokemon) {
			target.side.removeSideCondition('cutsceneswoon');
		},
		condition: {
			duration: 1,
			onBeforeSwitchOut(pokemon) {
				this.debug('Cutscene Swoon start');
				let alreadyAdded = false;
				pokemon.removeVolatile('destinybond');
				for (const source of this.effectState.sources) {
					if (!source.isAdjacent(pokemon) || !this.queue.cancelMove(source) || !source.hp) continue;
					if (!alreadyAdded) {
						this.add('-activate', pokemon, 'move: Cutscene Swoon');
						alreadyAdded = true;
					}
					// Run through each action in queue to check if the Pursuit user is supposed to Mega Evolve this turn.
					// If it is, then Mega Evolve before moving.
					if (source.canMegaEvo || source.canUltraBurst) {
						for (const [actionIndex, action] of this.queue.entries()) {
							if (action.pokemon === source && action.choice === 'megaEvo') {
								this.actions.runMegaEvo(source);
								this.queue.list.splice(actionIndex, 1);
								break;
							}
						}
					}
					this.actions.runMove('cutsceneswoon', source, source.getLocOf(pokemon));
				}
			},
		},
		secondary: null,
		target: "normal",
		type: "Dark",
		contestType: "Clever",
	},
	okheal: {
		num: -51,
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "OKHeal",
		shortDesc: "You are going to lose Points.",
		pp: 1,
		priority: 0,
		flags: {snatch: 1, heal: 1, metronome: 1},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Recover", source);
		},
		heal: [3, 20],
		secondary: null,
		target: "self",
		type: "Normal",
		zMove: {effect: 'clearnegativeboost'},
		contestType: "Clever",
	},
	betterheal: {
		num: -52,
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "BetterHeal",
		shortDesc: "Recover 50% of max HP.",
		pp: 8,
		priority: 0,
		flags: {snatch: 1, heal: 1, metronome: 1},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Moonlight", source);
		},
		heal: [1, 2],
		secondary: null,
		target: "self",
		type: "Fairy",
		zMove: {effect: 'clearnegativeboost'},
		contestType: "Clever",
	},
	rewarp: {
		num: -53,
		accuracy: true,
		category: "Status",
		name: "Rewarp",
		shortDesc: "Disappear for turn 1. At the end of the next turn, user switches out.",
		pp: 1,
		priority: 4,
		flags: {},
		noPPBoosts: true,
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Baton Pass", source);
		},
		volatileStatus: 'rewarp',
		condition: {
			duration: 2,
			onStart(pokemon) {
				this.add('-prepare', pokemon, 'Rewarp');
			},
			onInvulnerability(target, source, move) {
				if (source === target) return;
				return false;
			},
			onResidualOrder: 1,
			onResidual(pokemon) {
				if (this.effectState.duration === 1) {
					this.add('-activate', pokemon, 'move: Rewarp');
					if (pokemon.hp && pokemon.switchFlag !== false) {
						pokemon.switchFlag = true;
					}
				}
			},
			onEnd(pokemon) {
				this.add('-end', pokemon, 'Rewarp');
			},
		},
		secondary: null,
		target: "self",
		type: "Normal",
		contestType: "Smart",
	},
	
	assigndecoy: {
	num: -54,
    accuracy: true,
    basePower: 0,
    category: "Status",
    name: "Assign Decoy",
    pp: 10,
	flags: {snatch: 1, nonsky: 1, metronome: 1},
	onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Substitute", source);
		},
    condition: {
			onStart(target, source, effect) {
				if (effect?.id === 'shedtail') {
					this.add('-start', target, 'Substitute', '[from] move: Shed Tail');
				} else {
					this.add('-start', target, 'Substitute');
				}
				this.effectState.hp = Math.floor(target.maxhp / 4);
				if (target.volatiles['partiallytrapped']) {
					this.add('-end', target, target.volatiles['partiallytrapped'].sourceEffect, '[partiallytrapped]', '[silent]');
					delete target.volatiles['partiallytrapped'];
				}
			},
			onTryPrimaryHitPriority: -1,
			onTryPrimaryHit(target, source, move) {
				if (target === source || move.flags['bypasssub'] || move.infiltrates) {
					return;
				}
				let damage = this.actions.getDamage(source, target, move);
				if (!damage && damage !== 0) {
					this.add('-fail', source);
					this.attrLastMove('[still]');
					return null;
				}
				damage = this.runEvent('SubDamage', target, source, move, damage);
				if (!damage) {
					return damage;
				}
				if (damage > target.volatiles['substitute'].hp) {
					damage = target.volatiles['substitute'].hp as number;
				}
				target.volatiles['substitute'].hp -= damage;
				source.lastDamage = damage;
				if (target.volatiles['substitute'].hp <= 0) {
					if (move.ohko) this.add('-ohko');
					target.removeVolatile('substitute');
				} else {
					this.add('-activate', target, 'move: Substitute', '[damage]');
				}
				if (move.recoil || move.id === 'chloroblast') {
					this.damage(this.actions.calcRecoilDamage(damage, move, source), source, target, 'recoil');
				}
				if (move.drain) {
					this.heal(Math.ceil(damage * move.drain[0] / move.drain[1]), source, target, 'drain');
				}
				this.singleEvent('AfterSubDamage', move, null, target, source, move, damage);
				this.runEvent('AfterSubDamage', target, source, move, damage);
				return this.HIT_SUBSTITUTE;
			},
			onEnd(target) {
				this.add('-end', target, 'Substitute');
			},
		},
		onTry(source) {
			if (source.volatiles['substitute']) {
				this.add('-fail', source);
				return null;
			}

			source.volatiles['substitute'] = {
				hp: Math.floor(source.maxhp / 4),
			};
			this.add('-start', source, 'Substitute');
		},
	priority: -1,
	target: "self",
    type: "Normal",
	contestType: "Smart",
	},

	rexcalibur: {
		num: -55,
		accuracy: true,
		basePower: 120,
		category: "Special",
		name: "Rexcalibur",
		shortDesc: "Never misses.",
		pp: 5,
		priority: 0,
		flags: {protect: 1, mirror: 1, metronome: 1, wind: 1},
		secondary: null,
		target: "normal",
		type: "Flying",
		contestType: "Cool",
	},

	minusenergypowerball: {
		num: -56,
		accuracy: 100,
		basePower: 30,
		category: "Special",
		name: "Minus Energy Power Ball",
		shortDesc: "Hits 7 times.",
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', target, "Light That Burns the Sky", target);
		},
		pp: 10,
		priority: 0,
		flags: { protect: 1, mirror: 1, bullet: 1, metronome: 1},
		multihit: 7,
		secondary: null,
		target: "normal",
		type: "Dark",
	},
	dragonflashbullet: {
		num: -57,
		accuracy: 100,
		basePower: 100,
		category: "Special",
		name: "Dragon Flash Bullet",
		shortDesc: "Hits until user or opponent faint.",
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', target, "Hyper Beam", target);
		},
		onAfterMove(source, target, move) {
			if (!source.hp || !target.hp) return;
			this.damage(source.baseMaxhp * 0.15, source, source);
			if (!source.hp) return;
			this.actions.useMove(move.id, source, target);
		},
		pp: 10,
		priority: 0,
		flags: {protect: 1, mirror: 1, bullet: 1, metronome: 1},
		secondary: null,
		target: "normal",
		type: "Dragon",
	},
	dragonthunder: {
		num: -58,
		accuracy: 100,
		basePower: 120,
		category: "Special",
		name: "Dragon Thunder",
		shortDesc: "Paralyzes Target. Boost Def and Sp. Def by 1.",
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', target, "Thunder Punch", target);
		},
		self: {
			boosts: {
				def: 1,
				spd: 1,
			},
		},
		pp: 15,
		priority: 0,
		flags: { protect: 1, mirror: 1, bullet: 1, metronome: 1},
		secondary: {
			chance: 100,
			status: 'par',
		},
		target: "normal",
		type: "Electric",
	},

	
	
	// Below are vanilla moves altered by custom interractions
	bounce: {
		num: 340,
		accuracy: 85,
		basePower: 85,
		category: "Physical",
		name: "Bounce",
		pp: 5,
		priority: 0,
		flags: {contact: 1, charge: 1, protect: 1, mirror: 1, gravity: 1, distance: 1},
		onTryMove(attacker, defender, move) {
			if (attacker.removeVolatile(move.id)) {
				return;
			}
			this.add('-prepare', attacker, move.name);
			if (!this.runEvent('ChargeMove', attacker, defender, move)) {
				return;
			}
			attacker.addVolatile('twoturnmove', defender);
			return null;
		},
		condition: {
			duration: 2,
			onInvulnerability(target, source, move) {
				if (['gust', 'twister', 'skyuppercut', 'thunder', 'hurricane', 'smackdown', 'thousandarrows', 'dracoburning'].includes(move.id)) {
					return;
				}
				return false;
			},
			onSourceBasePower(basePower, target, source, move) {
				if (move.id === 'gust' || move.id === 'twister') {
					return this.chainModify(2);
				}
			},
		},
		secondary: {
			chance: 30,
			status: 'par',
		},
		target: "any",
		type: "Flying",
		contestType: "Cute",
	},
	fly: {
		num: 19,
		accuracy: 95,
		basePower: 90,
		category: "Physical",
		name: "Fly",
		pp: 15,
		priority: 0,
		flags: {contact: 1, charge: 1, protect: 1, mirror: 1, gravity: 1, distance: 1},
		onTryMove(attacker, defender, move) {
			if (attacker.removeVolatile(move.id)) {
				return;
			}
			this.add('-prepare', attacker, move.name);
			if (!this.runEvent('ChargeMove', attacker, defender, move)) {
				return;
			}
			attacker.addVolatile('twoturnmove', defender);
			return null;
		},
		condition: {
			duration: 2,
			onInvulnerability(target, source, move) {
				if (['gust', 'twister', 'skyuppercut', 'thunder', 'hurricane', 'smackdown', 'thousandarrows', 'dracoburning'].includes(move.id)) {
					return;
				}
				return false;
			},
			onSourceModifyDamage(damage, source, target, move) {
				if (move.id === 'gust' || move.id === 'twister') {
					return this.chainModify(2);
				}
			},
		},
		secondary: null,
		target: "any",
		type: "Flying",
		contestType: "Clever",
	},
	skydrop: {
		num: 507,
		accuracy: 100,
		basePower: 60,
		category: "Physical",
		isNonstandard: "Past",
		name: "Sky Drop",
		pp: 10,
		priority: 0,
		flags: {contact: 1, charge: 1, protect: 1, mirror: 1, gravity: 1, distance: 1},
		onModifyMove(move, source) {
			if (!source.volatiles['skydrop']) {
				move.accuracy = true;
				move.flags.contact = 0;
			}
		},
		onMoveFail(target, source) {
			if (source.volatiles['twoturnmove'] && source.volatiles['twoturnmove'].duration === 1) {
				source.removeVolatile('skydrop');
				source.removeVolatile('twoturnmove');
				this.add('-end', target, 'Sky Drop', '[interrupt]');
			}
		},
		onTryHit(target, source, move) {
			if (target.fainted) return false;
			if (source.removeVolatile(move.id)) {
				if (target !== source.volatiles['twoturnmove'].source) return false;

				if (target.hasType('Flying')) {
					this.add('-immune', target);
					return null;
				}
			} else {
				if (target.volatiles['substitute'] || target.side === source.side) {
					return false;
				}
				if (target.getWeight() >= 2000) {
					this.add('-fail', target, 'move: Sky Drop', '[heavy]');
					return null;
				}

				this.add('-prepare', source, move.name, target);
				source.addVolatile('twoturnmove', target);
				return null;
			}
		},
		onHit(target, source) {
			if (target.hp) this.add('-end', target, 'Sky Drop');
		},
		condition: {
			duration: 2,
			onAnyDragOut(pokemon) {
				if (pokemon === this.effectState.target || pokemon === this.effectState.source) return false;
			},
			onFoeTrapPokemonPriority: -15,
			onFoeTrapPokemon(defender) {
				if (defender !== this.effectState.source) return;
				defender.trapped = true;
			},
			onFoeBeforeMovePriority: 12,
			onFoeBeforeMove(attacker, defender, move) {
				if (attacker === this.effectState.source) {
					attacker.activeMoveActions--;
					this.debug('Sky drop nullifying.');
					return null;
				}
			},
			onRedirectTargetPriority: 99,
			onRedirectTarget(target, source, source2) {
				if (source !== this.effectState.target) return;
				if (this.effectState.source.fainted) return;
				return this.effectState.source;
			},
			onAnyInvulnerability(target, source, move) {
				if (target !== this.effectState.target && target !== this.effectState.source) {
					return;
				}
				if (source === this.effectState.target && target === this.effectState.source) {
					return;
				}
				if (['gust', 'twister', 'skyuppercut', 'thunder', 'hurricane', 'smackdown', 'thousandarrows', 'dracoburning'].includes(move.id)) {
					return;
				}
				return false;
			},
			onAnyBasePower(basePower, target, source, move) {
				if (target !== this.effectState.target && target !== this.effectState.source) {
					return;
				}
				if (source === this.effectState.target && target === this.effectState.source) {
					return;
				}
				if (move.id === 'gust' || move.id === 'twister') {
					return this.chainModify(2);
				}
			},
			onFaint(target) {
				if (target.volatiles['skydrop'] && target.volatiles['twoturnmove'].source) {
					this.add('-end', target.volatiles['twoturnmove'].source, 'Sky Drop', '[interrupt]');
				}
			},
		},
		secondary: null,
		target: "any",
		type: "Flying",
		contestType: "Tough",
	},
	curse: {
		num: 174,
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Curse",
		pp: 10,
		priority: 0,
		flags: {authentic: 1},
		volatileStatus: 'curse',
		onModifyMove(move, source, target) {
			if (!source.hasType('Ghost') && !source.hasAbility('curseweaver')) {
				move.target = move.nonGhostTarget as MoveTarget;
			}
		},
		onTryHit(target, source, move) {
			if (!source.hasType('Ghost') && !source.hasAbility('curseweaver')) {
				delete move.volatileStatus;
				delete move.onHit;
				move.self = {boosts: {spe: -1, atk: 1, def: 1}};
			} else if (move.volatileStatus && target.volatiles['curse']) {
				return false;
			}
		},
		onHit(target, source) {
			this.directDamage(source.maxhp / 2, source, source);
		},
		condition: {
			onStart(pokemon, source) {
				this.add('-start', pokemon, 'Curse', '[of] ' + source);
			},
			onResidualOrder: 10,
			onResidual(pokemon) {
				this.damage(pokemon.baseMaxhp / 4);
			},
		},
		secondary: null,
		target: "randomNormal",
		nonGhostTarget: "self",
		type: "Ghost",
		zMove: {effect: 'curse'},
		contestType: "Tough",
	},
	bouncybubble: {
		inherit: true,
		isNonstandard: null,
	},
	protect: {
		num: 182,
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Protect",
		pp: 10,
		priority: 4,
		flags: {noassist: 1, failcopycat: 1},
		stallingMove: true,
		volatileStatus: 'protect',
		onPrepareHit(pokemon) {
			return !!this.queue.willAct() && this.runEvent('StallMove', pokemon);
		},
		onHit(pokemon) {
			pokemon.addVolatile('stall');
		},
		condition: {
			duration: 1,
			onStart(target) {
				this.add('-singleturn', target, 'Protect');
			},
			onTryHitPriority: 3,
			onTryHit(target, source, move) {
				if (!move.flags['protect']) {
					if (['gmaxoneblow', 'gmaxrapidflow'].includes(move.id)) return;
					if (move.isZ || move.isMax) target.getMoveHitData(move).zBrokeProtect = true;
					return;
				}
				if (move.smartTarget) {
					move.smartTarget = false;
				} else {
					this.add('-activate', target, 'move: Protect');
				}
				const lockedmove = source.getVolatile('lockedmove');
				if (lockedmove) {
					// Outrage counter is reset
					if (source.volatiles['lockedmove'].duration === 2) {
						delete source.volatiles['lockedmove'];
					}
				}
				if (target.hasAbility('smirk')) {
					target.addVolatile('laserfocus')
				}
				return this.NOT_FAIL;
			},
		},
		secondary: null,
		target: "self",
		type: "Normal",
		zMove: {effect: 'clearnegativeboost'},
		contestType: "Cute",
	},
	spikes: {
		num: 191,
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Spikes",
		pp: 20,
		priority: 0,
		flags: {reflectable: 1, nonsky: 1, metronome: 1, mustpressure: 1},
		sideCondition: 'spikes',
		condition: {
			// this is a side condition
			onSideStart(side) {
				this.add('-sidestart', side, 'Spikes');
				this.effectState.layers = 1;
			},
			onSideRestart(side) {
				if (this.effectState.layers >= 3) return false;
				this.add('-sidestart', side, 'Spikes');
				this.effectState.layers++;
			},
			onEntryHazard(pokemon) {
				if (!pokemon.isGrounded() || pokemon.hasItem('heavydutyboots') || pokemon.hasItem('earthlooplet') || pokemon.hasAbility('autobuild')) return;
				const damageAmounts = [0, 3, 4, 6]; // 1/8, 1/6, 1/4
				this.damage(damageAmounts[this.effectState.layers] * pokemon.maxhp / 24);
			},
		},
		secondary: null,
		target: "foeSide",
		type: "Ground",
		zMove: {boost: {def: 1}},
		contestType: "Clever",
	},
	wish: {
		num: 273,
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Wish",
		pp: 5,
		priority: 0,
		flags: {snatch: 1, heal: 1, metronome: 1},
		slotCondition: 'Wish',
		condition: {
			duration: 2,
			onStart(pokemon, source) {
				this.effectState.hp = source.maxhp / 2;
			},
			onResidualOrder: 4,
			onEnd(target) {
				if (target && !target.fainted) {
					const damage = this.heal(this.effectState.hp, target, target);
					if (damage) {
						this.add('-heal', target, target.getHealth, '[from] move: Wish', '[wisher] ' + this.effectState.source.name);
					}
				}
			},
		},
		secondary: null,
		target: "self",
		type: "Normal",
		zMove: {boost: {spd: 1}},
		contestType: "Cute",
	},
	stealthrock: {
		num: 446,
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Stealth Rock",
		pp: 20,
		priority: 0,
		flags: {reflectable: 1, metronome: 1, mustpressure: 1},
		sideCondition: 'stealthrock',
		condition: {
			// this is a side condition
			onSideStart(side) {
				this.add('-sidestart', side, 'move: Stealth Rock');
			},
			onEntryHazard(pokemon) {
				if (pokemon.hasItem('heavydutyboots') || pokemon.hasItem('earthlooplet') || pokemon.hasAbility('autobuild')) return;
				const typeMod = this.clampIntRange(pokemon.runEffectiveness(this.dex.getActiveMove('stealthrock')), -6, 6);
				this.damage(pokemon.maxhp * Math.pow(2, typeMod) / 8);
			},
		},
		secondary: null,
		target: "foeSide",
		type: "Rock",
		zMove: {boost: {def: 1}},
		contestType: "Cool",
	},
	stickyweb: {
		num: 564,
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Sticky Web",
		pp: 20,
		priority: 0,
		flags: {reflectable: 1, metronome: 1},
		sideCondition: 'stickyweb',
		condition: {
			onSideStart(side) {
				this.add('-sidestart', side, 'move: Sticky Web');
			},
			onEntryHazard(pokemon) {
				if (!pokemon.isGrounded() || pokemon.hasItem('heavydutyboots') || pokemon.hasItem('earthlooplet') || pokemon.hasAbility('autobuild')) return;
				this.add('-activate', pokemon, 'move: Sticky Web');
				this.boost({spe: -1}, pokemon, this.effectState.source, this.dex.getActiveMove('stickyweb'));
			},
		},
		secondary: null,
		target: "foeSide",
		type: "Bug",
		zMove: {boost: {spe: 1}},
		contestType: "Tough",
	},
	toxicspikes: {
		num: 390,
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Toxic Spikes",
		pp: 20,
		priority: 0,
		flags: {reflectable: 1, nonsky: 1, metronome: 1, mustpressure: 1},
		sideCondition: 'toxicspikes',
		condition: {
			// this is a side condition
			onSideStart(side) {
				this.add('-sidestart', side, 'move: Toxic Spikes');
				this.effectState.layers = 1;
			},
			onSideRestart(side) {
				if (this.effectState.layers >= 2) return false;
				this.add('-sidestart', side, 'move: Toxic Spikes');
				this.effectState.layers++;
			},
			onEntryHazard(pokemon) {
				if (!pokemon.isGrounded()) return;
				if (pokemon.hasType('Poison')) {
					this.add('-sideend', pokemon.side, 'move: Toxic Spikes', '[of] ' + pokemon);
					pokemon.side.removeSideCondition('toxicspikes');
				} else if (pokemon.hasType('Steel') || pokemon.hasItem('heavydutyboots') || pokemon.hasItem('earthlooplet') || pokemon.hasAbility('autobuild')) {
					return;
				} else if (this.effectState.layers >= 2) {
					pokemon.trySetStatus('tox', pokemon.side.foe.active[0]);
				} else {
					pokemon.trySetStatus('psn', pokemon.side.foe.active[0]);
				}
			},
		},
		secondary: null,
		target: "foeSide",
		type: "Poison",
		zMove: {boost: {def: 1}},
		contestType: "Clever",
	},
	gmaxsteelsurge: {
		num: 1000,
		accuracy: true,
		basePower: 10,
		category: "Physical",
		isNonstandard: "Gigantamax",
		name: "G-Max Steelsurge",
		pp: 5,
		priority: 0,
		flags: {},
		isMax: "Copperajah",
		self: {
			onHit(source) {
				for (const side of source.side.foeSidesWithConditions()) {
					side.addSideCondition('gmaxsteelsurge');
				}
			},
		},
		condition: {
			onSideStart(side) {
				this.add('-sidestart', side, 'move: G-Max Steelsurge');
			},
			onEntryHazard(pokemon) {
				if (pokemon.hasItem('heavydutyboots') || pokemon.hasItem('earthlooplet') || pokemon.hasAbility('autobuild')) return;
				// Ice Face and Disguise correctly get typed damage from Stealth Rock
				// because Stealth Rock bypasses Substitute.
				// They don't get typed damage from Steelsurge because Steelsurge doesn't,
				// so we're going to test the damage of a Steel-type Stealth Rock instead.
				const steelHazard = this.dex.getActiveMove('Stealth Rock');
				steelHazard.type = 'Steel';
				const typeMod = this.clampIntRange(pokemon.runEffectiveness(steelHazard), -6, 6);
				this.damage(pokemon.maxhp * Math.pow(2, typeMod) / 8);
			},
		},
		secondary: null,
		target: "adjacentFoe",
		type: "Steel",
		contestType: "Cool",
	},
	saltcure: {
		num: 864,
		accuracy: 100,
		basePower: 40,
		category: "Physical",
		name: "Salt Cure",
		pp: 15,
		priority: 0,
		flags: {protect: 1, mirror: 1},
		condition: {
			noCopy: true,
			onStart(pokemon) {
				this.add('-start', pokemon, 'Salt Cure');
			},
			onResidualOrder: 13,
			onResidual(pokemon) {
				this.damage(pokemon.baseMaxhp / (pokemon.hasType(['Water'+ 'Steel']) ? 1 : 2));
			},
			onEnd(pokemon) {
				this.add('-end', pokemon, 'Salt Cure');
			},
		},
		secondary: {
			chance: 100,
			volatileStatus: 'saltcure',
		},
		target: "normal",
		type: "Rock",
	},
	grassyterrain: {
		num: 580,
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Grassy Terrain",
		pp: 10,
		priority: 0,
		flags: {nonsky: 1, metronome: 1},
		terrain: 'grassyterrain',
		condition: {
			duration: 5,
			durationCallback(source, effect) {
				if (source?.hasItem('terrainextender')) {
					return 8;
				}
				return 5;
			},
			onBasePowerPriority: 6,
			onBasePower(basePower, attacker, defender, move) {
				const weakenedMoves = ['earthquake', 'bulldoze', 'magnitude'];
				if (weakenedMoves.includes(move.id) && defender.isGrounded() && !defender.isSemiInvulnerable() && !defender.hasAbility('autobuild')) {
					this.debug('move weakened by grassy terrain');
					return this.chainModify(0.5);
				}
				if (move.type === 'Grass' && attacker.isGrounded() && !attacker.hasAbility('autobuild')) {
					this.debug('grassy terrain boost');
					return this.chainModify([5325, 4096]);
				}
			},
			onFieldStart(field, source, effect) {
				if (effect?.effectType === 'Ability') {
					this.add('-fieldstart', 'move: Grassy Terrain', '[from] ability: ' + effect.name, '[of] ' + source);
				} else {
					this.add('-fieldstart', 'move: Grassy Terrain');
				}
			},
			onResidualOrder: 5,
			onResidualSubOrder: 2,
			onResidual(pokemon) {
				if (pokemon.isGrounded() && !pokemon.isSemiInvulnerable() && !pokemon.hasAbility('autobuild')) {
					this.heal(pokemon.baseMaxhp / 16, pokemon, pokemon);
				} else {
					this.debug(`Pokemon semi-invuln or not grounded; Grassy Terrain skipped`);
				}
			},
			onFieldResidualOrder: 27,
			onFieldResidualSubOrder: 7,
			onFieldEnd() {
				this.add('-fieldend', 'move: Grassy Terrain');
			},
		},
		secondary: null,
		target: "all",
		type: "Grass",
		zMove: {boost: {def: 1}},
		contestType: "Beautiful",
	},
	mistyterrain: {
		num: 581,
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Misty Terrain",
		pp: 10,
		priority: 0,
		flags: {nonsky: 1, metronome: 1},
		terrain: 'mistyterrain',
		condition: {
			duration: 5,
			durationCallback(source, effect) {
				if (source?.hasItem('terrainextender')) {
					return 8;
				}
				return 5;
			},
			onSetStatus(status, target, source, effect) {
				if (!target.isGrounded() || target.isSemiInvulnerable() || target.hasAbility('autobuild')) return;
				if (effect && ((effect as Move).status || effect.id === 'yawn')) {
					this.add('-activate', target, 'move: Misty Terrain');
				}
				return false;
			},
			onTryAddVolatile(status, target, source, effect) {
				if (!target.isGrounded() || target.isSemiInvulnerable() || target.hasAbility('autobuild')) return;
				if (status.id === 'confusion') {
					if (effect.effectType === 'Move' && !effect.secondaries) this.add('-activate', target, 'move: Misty Terrain');
					return null;
				}
			},
			onBasePowerPriority: 6,
			onBasePower(basePower, attacker, defender, move) {
				if (move.type === 'Dragon' && defender.isGrounded() && !defender.isSemiInvulnerable() && !defender.hasAbility('autobuild')) {
					this.debug('misty terrain weaken');
					return this.chainModify(0.5);
				}
			},
			onFieldStart(field, source, effect) {
				if (effect?.effectType === 'Ability') {
					this.add('-fieldstart', 'move: Misty Terrain', '[from] ability: ' + effect.name, '[of] ' + source);
				} else {
					this.add('-fieldstart', 'move: Misty Terrain');
				}
			},
			onFieldResidualOrder: 27,
			onFieldResidualSubOrder: 7,
			onFieldEnd() {
				this.add('-fieldend', 'Misty Terrain');
			},
		},
		secondary: null,
		target: "all",
		type: "Fairy",
		zMove: {boost: {spd: 1}},
		contestType: "Beautiful",
	},
	psychicterrain: {
		num: 678,
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Psychic Terrain",
		pp: 10,
		priority: 0,
		flags: {nonsky: 1, metronome: 1},
		terrain: 'psychicterrain',
		condition: {
			duration: 5,
			durationCallback(source, effect) {
				if (source?.hasItem('terrainextender')) {
					return 8;
				}
				return 5;
			},
			onTryHitPriority: 4,
			onTryHit(target, source, effect) {
				if (effect && (effect.priority <= 0.1 || effect.target === 'self')) {
					return;
				}
				if (target.isSemiInvulnerable() || target.isAlly(source)) return;
				if (!target.isGrounded() || target.hasAbility('autobuild')) {
					const baseMove = this.dex.moves.get(effect.id);
					if (baseMove.priority > 0) {
						if (target.hasAbility('autobuild')) {
							this.hint("Psychic Terrain doesn't affect Pokémon with Autobuild.");
						}
						else {
							this.hint("Psychic Terrain doesn't affect Pokémon immune to Ground.");
						}
					}
					return;
				}
				this.add('-activate', target, 'move: Psychic Terrain');
				return null;
			},
			onBasePowerPriority: 6,
			onBasePower(basePower, attacker, defender, move) {
				if (move.type === 'Psychic' && attacker.isGrounded() && !attacker.isSemiInvulnerable() && !attacker.hasAbility('autobuild')) {
					this.debug('psychic terrain boost');
					return this.chainModify([5325, 4096]);
				}
			},
			onFieldStart(field, source, effect) {
				if (effect?.effectType === 'Ability') {
					this.add('-fieldstart', 'move: Psychic Terrain', '[from] ability: ' + effect.name, '[of] ' + source);
				} else {
					this.add('-fieldstart', 'move: Psychic Terrain');
				}
			},
			onFieldResidualOrder: 27,
			onFieldResidualSubOrder: 7,
			onFieldEnd() {
				this.add('-fieldend', 'move: Psychic Terrain');
			},
		},
		secondary: null,
		target: "all",
		type: "Psychic",
		zMove: {boost: {spa: 1}},
		contestType: "Clever",
	},
	electricterrain: {
		num: 604,
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Electric Terrain",
		pp: 10,
		priority: 0,
		flags: {nonsky: 1, metronome: 1},
		terrain: 'electricterrain',
		condition: {
			duration: 5,
			durationCallback(source, effect) {
				if (source?.hasItem('terrainextender')) {
					return 8;
				}
				return 5;
			},
			onSetStatus(status, target, source, effect) {
				if (status.id === 'slp' && target.isGrounded() && !target.isSemiInvulnerable() && !target.hasAbility('autobuild')) {
					if (effect.id === 'yawn' || (effect.effectType === 'Move' && !effect.secondaries)) {
						this.add('-activate', target, 'move: Electric Terrain');
					}
					return false;
				}
			},
			onTryAddVolatile(status, target) {
				if (!target.isGrounded() || target.isSemiInvulnerable() || target.hasAbility('autobuild')) return;
				if (status.id === 'yawn') {
					this.add('-activate', target, 'move: Electric Terrain');
					return null;
				}
			},
			onBasePowerPriority: 6,
			onBasePower(basePower, attacker, defender, move) {
				if (move.type === 'Electric' && attacker.isGrounded() && !attacker.isSemiInvulnerable() && !attacker.hasAbility('autobuild')) {
					this.debug('electric terrain boost');
					return this.chainModify([5325, 4096]);
				}
			},
			onFieldStart(field, source, effect) {
				if (effect?.effectType === 'Ability') {
					this.add('-fieldstart', 'move: Electric Terrain', '[from] ability: ' + effect.name, '[of] ' + source);
				} else {
					this.add('-fieldstart', 'move: Electric Terrain');
				}
			},
			onFieldResidualOrder: 27,
			onFieldResidualSubOrder: 7,
			onFieldEnd() {
				this.add('-fieldend', 'move: Electric Terrain');
			},
		},
		secondary: null,
		target: "all",
		type: "Electric",
		zMove: {boost: {spe: 1}},
		contestType: "Clever",
	},
	rapidspin: {
		num: 229,
		accuracy: 100,
		basePower: 50,
		category: "Physical",
		name: "Rapid Spin",
		pp: 40,
		priority: 0,
		flags: {contact: 1, protect: 1, mirror: 1, metronome: 1},
		onAfterHit(target, pokemon, move) {
			if (!move.hasSheerForce) {
				if (pokemon.hp && pokemon.removeVolatile('leechseed')) {
					this.add('-end', pokemon, 'Leech Seed', '[from] move: Rapid Spin', '[of] ' + pokemon);
				}
				const sideConditions = ['spikes', 'toxicspikes', 'stealthrock', 'stickyweb', 'gmaxsteelsurge', 'electricfence'];
				for (const condition of sideConditions) {
					if (pokemon.hp && pokemon.side.removeSideCondition(condition)) {
						this.add('-sideend', pokemon.side, this.dex.conditions.get(condition).name, '[from] move: Rapid Spin', '[of] ' + pokemon);
					}
				}
				if (pokemon.hp && pokemon.volatiles['partiallytrapped']) {
					pokemon.removeVolatile('partiallytrapped');
				}
			}
		},
		onAfterSubDamage(damage, target, pokemon, move) {
			if (!move.hasSheerForce) {
				if (pokemon.hp && pokemon.removeVolatile('leechseed')) {
					this.add('-end', pokemon, 'Leech Seed', '[from] move: Rapid Spin', '[of] ' + pokemon);
				}
				const sideConditions = ['spikes', 'toxicspikes', 'stealthrock', 'stickyweb', 'gmaxsteelsurge', 'electricfence'];
				for (const condition of sideConditions) {
					if (pokemon.hp && pokemon.side.removeSideCondition(condition)) {
						this.add('-sideend', pokemon.side, this.dex.conditions.get(condition).name, '[from] move: Rapid Spin', '[of] ' + pokemon);
					}
				}
				if (pokemon.hp && pokemon.volatiles['partiallytrapped']) {
					pokemon.removeVolatile('partiallytrapped');
				}
			}
		},
		secondary: {
			chance: 100,
			self: {
				boosts: {
					spe: 1,
				},
			},
		},
		target: "normal",
		type: "Normal",
		contestType: "Cool",
	},
};

