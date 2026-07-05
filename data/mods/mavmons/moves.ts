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
		pp: 15,
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
		shortDesc: "Switch out, 50% chance to Burn, drop Sp. Def by 1 stage, or Confuse opponent.",
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
		pp: 15,
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
		shortDesc: "The foes Attack and Special Attack are lowered by 1, and taunts foe for 3 turns.",
		name: "Disarm",
		pp: 5,
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
		shortDesc: "When you knock out a target using this move, you recover 1/4th of your max HP",
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
	starsthatpiercetheheavens: {
		num: -8,
		accuracy: true,
		basePower: 200,
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
			if (!target.volatiles['substitute'] || move.infiltrates) success = !!this.boost({evasion: -1});
			const removeTarget = [
				'reflect', 'lightscreen', 'auroraveil', 'safeguard', 'mist', 'spikes', 'toxicspikes', 'stealthrock', 'stickyweb', 'gmaxsteelsurge', 'electricfence',
			];
			const removeAll = [
				'spikes', 'toxicspikes', 'stealthrock', 'stickyweb', 'gmaxsteelsurge', 'electricfence',
			];
			for (const targetCondition of removeTarget) {
				if (target.side.removeSideCondition(targetCondition)) {
					if (!removeAll.includes(targetCondition)) continue;
					this.add('-sideend', target.side, this.dex.conditions.get(targetCondition).name, '[from] move: Defog', '[of] ' + source);
					success = true;
				}
			}
			for (const sideCondition of removeAll) {
				if (source.side.removeSideCondition(sideCondition)) {
					this.add('-sideend', source.side, this.dex.conditions.get(sideCondition).name, '[from] move: Defog', '[of] ' + source);
					success = true;
				}
			}
			this.field.clearTerrain();
			return success;
		},
		volatileStatus: 'healblock',
		condition: {
			duration: 5,
			durationCallback(target, source, effect) {
				if (effect?.name === "Psychic Noise") {
					return 2;
				}
				if (source?.hasAbility('persistent')) {
					this.add('-activate', source, 'ability: Persistent', '[move] Heal Block');
					return 7;
				}
				return 5;
			},
			onStart(pokemon, source) {
				this.add('-start', pokemon, 'move: Heal Block');
				source.moveThisTurnResult = true;
			},
			onDisableMove(pokemon) {
				for (const moveSlot of pokemon.moveSlots) {
					if (this.dex.moves.get(moveSlot.id).flags['heal']) {
						pokemon.disableMove(moveSlot.id);
					}
				}
			},
			onBeforeMovePriority: 6,
			onBeforeMove(pokemon, target, move) {
				if (move.flags['heal'] && !move.isZ && !move.isMax) {
					this.add('cant', pokemon, 'move: Heal Block', move);
					return false;
				}
			},
			onModifyMove(move, pokemon, target) {
				if (move.flags['heal'] && !move.isZ && !move.isMax) {
					this.add('cant', pokemon, 'move: Heal Block', move);
					return false;
				}
			},
			onResidualOrder: 20,
			onEnd(pokemon) {
				this.add('-end', pokemon, 'move: Heal Block');
			},
			onTryHeal(damage, target, source, effect) {
				if ((effect?.id === 'zpower') || this.effectState.isZ) return damage;
				return false;
			},
			onRestart(target, source) {
				this.add('-fail', target, 'move: Heal Block'); // Succeeds to supress downstream messages
				if (!source.moveThisTurnResult) {
					source.moveThisTurnResult = false;
				}
			},
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
		shortDesc: "Removes hazards from your side and sets a layer of Steel Spikes.",
		pp: 30,
		priority: -1,
		flags: {},
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
		flags: {bullet: 1, protect: 1, mirror: 1},
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
		flags: {contact: 1, slicing: 1, heal: 1, protect: 1, mirror: 1},
		onPrepareHit(target, source, pokemon) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Tail Glow", target);
			this.add('-anim', source, "Protect", target);
			return !!this.queue.willAct() && this.runEvent('StallMove', pokemon);
		},
		stallingMove: true,
		volatileStatus: 'shockbubble',
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
					this.field.setTerrain('electricterrain');
				}
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
		shortDesc: "Super Effective on Fighting types. High Crit Ratio. Ignores all defensive bonuses",
		name: "Trizooka",
		pp: 5,
		priority: 0,
		flags: {contact: 1, protect: 1, mirror: 1, metronome: 1},
		onEffectiveness(typeMod, target, type) {
			if (type === 'Fighting') return 1;
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
		shortDesc: "10% chance to increase the users Special Attack and Speed by 1.5x",
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
		target: "allySide",
		type: "Normal",
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
		flags: {mirror: 1, metronome: 1, sound: 1, bypasssub: 1},
		condition: {
			duration: 3,
			onStart(pokemon, source) {
				this.add('-start', pokemon, 'move: Killer Wail 5.1', '[of] ' + source);
			},
			onResidualOrder: 14,
			onResidual(pokemon) {
				const source = this.effectState.source;
				if (source && (!source.isActive || source.hp <= 0 || !source.activeTurns)) {
					delete pokemon.volatiles['Killer Wail 5.1'];
					this.add('-end', pokemon, 'Killer Wail 5.1', '[silent]');
					return;
				}
				this.boost({def: -1, spd: -1}, pokemon, source, this.dex.getActiveMove('Killer Wail 5.1'));
			},
			onEnd(target) {
				this.add('-end', target, 'move: Killer Wail 5.1');
			},
		},
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
		shortDesc: "Resroes 50% of user's max HP, summons Safeguard.",
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
		name: "Elemental Bomb",
		pp: 5,
		multihit: 2,
		priority: 0,
		flags: {protect: 1, mirror: 1, metronome: 1, bullet: 1},
 		onPrepareHit(target, source, move) {
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
	lightningkick: {
		num: -20,
		accuracy: 90,
		basePower: 90,
		category: "Special",
		overrideDefensiveStat: 'def',
		shortDesc: "Damages target based on defense. High critical hit ratio.",
		name: "Lightning Kick",
		pp: 10,
		priority: 0,
		flags: {},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Thunderous Kick", target);
		},
		
		critRatio: 2,
		target: "normal",
		type: "Electric",
		contestType: "Beautiful",
	},
	fullchargeshot: {
		num: -21,
		accuracy: 80,
		basePower: 180,
		category: "Special",
		name: "Full-Charge Shot",
		shortDesc: "Ignores effects of abilities and moves, has a high critical hit ratio, the move can't be used twice in a row. ",
		pp: 10,
		priority: 0,
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Sparkling Aria", target);
			this.add('-anim', source, "Hyper Beam", target);
		},
		flags: {protect: 1, mirror: 1, metronome: 1, cantusetwice: 1},
		critRatio: 2,
		ignoreAbility: true,
		target: "normal",
		type: "???",
		contestType: "Cute",
	},
	quicksuperjump: {
		num: -22,
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Quick Super Jump",
		shortDesc: "Switches the user out and passes all of the user's stat changes to the next Pokemon. Fully heals the user's HP and restores any status conditions.",
		pp: 1,
		noPPBoosts: true,
		priority: 4,
		flags: {snatch: 1, heal: 1, metronome: 1},
		onHit(target) {
			this.heal(target.maxhp);
			if (!this.canSwitch(target.side) || target.volatiles['commanded']) {
				this.attrLastMove('[still]');
				this.add('-fail', target);
				return this.NOT_FAIL;
			}
		},
		self: {
			onHit(source) {
				source.skipBeforeSwitchOutEventFlag = true;
			},
		},
		heal: [1, 1],
		selfSwitch: 'copyvolatile',
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
		shortDesc: "Deals damage equal to 35% of the opponent's max HP and lowers its Def and Sp.Def by one stage, but fails if the opponent isn't about to use an attacking move.",
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
		shortDesc: " restore 25% hp and cure status. If targeting self, additionally increases spd and acc by 1 stage.",
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
		onModifyMove(move, pokemon) {
			if (pokemon.getStat('atk', false, true) > pokemon.getStat('spa', false, true)) move.category = 'Physical';
		},
		secondary: null,
		target: "normal",
		type: "Steel",
		zMove: {basePower: 140},
		maxMove: {basePower: 130},
		contestType: "Tough",
	},
	recuerdame: {
		num: -26,
		accuracy: true,
		basePower: 0,
		category: "Status",
		shortDesc: "Defog, Healing Wish, next Pokemon's speed raised by 2 stages and accuracy raised by 6 stages.",
		name: "Recuerdame",
		pp: 10,
		priority: 0,
		flags: {},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Clangorous Soul", target);
			this.add('-anim', source, "Doom Desire", target);
		},
		onTryHit(source) {
			if (!this.canSwitch(source.side)) {
				this.attrLastMove('[still]');
				this.add('-fail', source);
				return this.NOT_FAIL;
			}
		},
		onHit(target, source, move) {
			let success = false;
			if (!target.volatiles['substitute'] || move.infiltrates) success = !!this.boost({evasion: -1});
			const removeTarget = [
				'reflect', 'lightscreen', 'auroraveil', 'safeguard', 'mist', 'spikes', 'toxicspikes', 'stealthrock', 'stickyweb', 'gmaxsteelsurge', 'electricfence',
			];
			const removeAll = [
				'spikes', 'toxicspikes', 'stealthrock', 'stickyweb', 'gmaxsteelsurge', 'electricfence',
			];
			for (const targetCondition of removeTarget) {
				if (target.side.removeSideCondition(targetCondition)) {
					if (!removeAll.includes(targetCondition)) continue;
					this.add('-sideend', target.side, this.dex.conditions.get(targetCondition).name, '[from] move: Defog', '[of] ' + source);
					success = true;
				}
			}
			for (const sideCondition of removeAll) {
				if (source.side.removeSideCondition(sideCondition)) {
					this.add('-sideend', source.side, this.dex.conditions.get(sideCondition).name, '[from] move: Defog', '[of] ' + source);
					success = true;
				}
			}
			this.field.clearTerrain();
			return success;
		},
		selfdestruct: "ifHit",
		slotCondition: 'healingwish',
		condition: {
			onSwap(target) {
				if (!target.fainted && (target.hp < target.maxhp || target.status)) {
					target.heal(target.maxhp);
					target.clearStatus();


					this.add('-heal', target, target.getHealth, '[from] move: Healing Wish');
					this.boost({spe: 4}, target);
					this.boost({evasion: 12}, target);
					target.side.removeSlotCondition(target, 'healingwish');
					
				}
			},
		},
		secondary: null,
		target: "self",
		type: "Ghost",
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
		flags: {},
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
		type: "Steel",
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
		pp: 1,
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
		pp: 16,
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
		basePowerCallback(pokemon, target, move) {
			return 18 * move.hit;
		},
		category: "Physical",
		name: "Sword Tunnel",
		shortDesc: "Hits 5 times.",
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
		shortDesc: "if opponent is attempting to switch out, this attack does 100 and hits before switching.",
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
		category: "Special",
		name: "Crystal Nova",
		shortDesc: "Uses Atk stat. Resets Darkness for a total of 8 turns.",
		pp: 1,
		priority: 0,
		flags: {},
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
					duration: 5,
				});
			}
		},
		overrideOffensiveStat: 'atk',
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
		shortDesc: "No Secondary Effect.",
		pp: 5,
		priority: 0,
		flags: {protect: 1, mirror: 1, metronome: 1},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Fusion Bolt", source);
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
			flags: {noassist: 1, failcopycat: 1},
			stallingMove: true,
			volatileStatus: 'eternalpatience',
			onPrepareHit(pokemon) {
				this.attrLastMove('[still]');
				this.add('-anim', source, "Protect", source);
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
				onHit(target, source, move) {
					this.damage(source.baseMaxhp / 10, source, target);
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
						return this.clampIntRange(Math.floor(target.getUndynamaxedHP() / 5), 2);
					},
			category: "Special",
			name: "Musou no Hitotachi",
			pp: 1,
			priority: 0,
			flags: {},
			onPrepareHit(target, source, move) {
				this.attrLastMove('[still]');
				this.add('-anim', source, "Poltergeist", source);
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
		basePower: 200,
		category: "Physical",
		name: "Senketsu Kisaragi",
		shortDesc: "Can only be used by Ryuko-Syncronized, reverts back to Ryuko Matoi.",
		pp: 5,
		priority: 0,
		flags: {contact: 1, protect: 1, mirror: 1, failcopycat: 1, failmimic: 1, slicing: 1},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Extreme Evoboost", source);
			this.add('-anim', source, "Behemoth Blade", target);
		},
		secondary: null,
		self: {
			onHit(pokemon) {
				if (pokemon.species.id !== 'ryukosyncronized') return;

				pokemon.formeChange('Ryuko Matoi', this.effect, true);
				this.add('-formechange', pokemon, 'Ryuko Syncronized', '[from] move: Senketsu Kisaragi');
				this.add('-message', 'Ryuko burnt up all her life fibers and reverted back to her base form!');


			},
		},
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
		pp: 10,
		priority: 0,
		flags: {protect: 1, mirror: 1, metronome: 1},
		ignoreEvasion: true,
		ignoreDefensive: true,
		ignoreAbility: true,
		secondary: {
					chance: 20,
					self: {
						boosts: {
							atk: 1,
						},
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
			pp: 5,
			priority: 0,
			flags: {contact: 1, protect: 1, mirror: 1, metronome: 1},
			onAfterMoveSecondarySelf(pokemon, target, move) {
				if (!target || target.fainted || target.hp <= 0) this.boost({atk: 1, def: 1, spa: 1, spd: 1, spe: 1}, pokemon, pokemon, move);
			},
			secondary: null,
			target: "normal",
			type: "Fire",
			contestType: "Cool",
		},
	rudebuster: {
		num: -45,
		accuracy: 100,
		basePower: 80,
		category: "Special",
		name: "Rude Buster",
		shortDesc: "Uses Atk in calculation, deals Rude damage.",
		pp: 10,
		priority: 0,
		flags: {protect: 1, mirror: 1, metronome: 1},
		overrideOffensiveStat: 'def',
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Spatial Rend", source);
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
		contestType: "Clever",
	},
	scythemare: {
			num: -46,
			accuracy: 100,
			basePower: 70,
			basePowerCallback(pokemon, target, move) {
				if (target.status === 'slp') {
					this.debug('BP doubled on paralyzed target');
					return move.basePower * 2;
				}
				return move.basePower;
			},
			category: "Physical",
			name: "Scythemare",
			pp: 10,
			priority: 0,
			flags: {contact: 1, protect: 1, mirror: 1, metronome: 1},
			onHit(target) {
				if (target.status === 'slp') target.cureStatus();
			},
	killingclaw: {
		num: -47,
		accuracy: 100,
		basePower: 90,
		category: "Physical",
		name: "Killing Claw",
		shortDesc: "100% chance to lower the target's Attack by 1.",
		pp: 10,
		priority: 0,
		flags: {contact: 1, protect: 1, mirror: 1, metronome: 1, slicing: 1},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Bide", source);
			this.add('-anim', source, "Metal Claw", target);
		},
		secondary: {
			chance: 100,
			boosts: {
				atk: -1,
			},
		},
		target: "normal",
		type: "Steel",
		contestType: "Cool",
	},
	brilliantdiamond: {
		num: -48,
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Brilliant Diamond",
		shortDesc: "Hits two turns after being used; prevents foe(s) from switching next turn.",
		pp: 10,
		priority: 0,
		flags: {mirror: 1, bypasssub: 1, allyanim: 1, metronome: 1, futuremove: 1},
		ignoreImmunity: true,
		onTry(source, target) {
			if (!target.side.addSlotCondition(target, 'futuremove')) return false;
			this.add('-anim', source, "Power Gem", target);
			Object.assign(target.side.slotConditions[target.position]['futuremove'], {
				duration: 3,
				move: 'brilliantdiamond',
				source: source,
				moveData: {
					id: 'brilliantdiamond',
					name: "Brilliant Diamond",
					accuracy: true,
					basePower: 0,
					category: "Status",
					priority: 0,
					flags: {mirror: 1, bypasssub: 1, allyanim: 1, metronome: 1, futuremove: 1},
					sideCondition: 'brilliantdiamond',
					condition: {
						duration: 2,
						onSideStart(targetSide) {
							this.add('-sidestart', targetSide, 'move: Brilliant Diamond');
						},
						onTrapPokemon(pokemon) {
							pokemon.tryTrap();
							this.add('-anim', pokemon, "Rock Polish", pokemon);
						},
					},
					ignoreImmunity: false,
					effectType: 'Move',
					type: 'Rock',
				},
			});
			this.add('-start', source, 'move: Brilliant Diamond');
			return this.NOT_FAIL;
		},
		secondary: null,
		target: "foeSide",
		type: "Rock",
		zMove: {boost: {def: 2}},
		contestType: "Clever",
	},
	starriders: {
		num: -49,
		accuracy: true,
		basePower: 200,
		category: "Special",
		name: "Star Riders",
		shortDesc: "No additional effects.",
		pp: 1,
		priority: 0,
		flags: {},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Cosmic Power", source);
			this.add('-anim', source, "Moongeist Beam", target);
		},
		isZ: "geniumz",
		secondary: null,
		target: "normal",
		type: "Fairy",
		contestType: "Beautiful",
	},
	eject: {
		num: -50,
		accuracy: 90,
		basePower: 90,
		category: "Special",
		name: "Eject",
		shortDesc: "Forces the target to switch to a random ally.",
		pp: 10,
		priority: -6,
		flags: {protect: 1, mirror: 1, metronome: 1, noassist: 1, failcopycat: 1},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Nasty Plot", source);
			this.add('-anim', source, "Hyper Voice", target);
			this.add('-anim', target, "Teleport", target);
		},
		forceSwitch: true,
		target: "normal",
		type: "Normal",
		contestType: "Clever",
	},
	backstab: {
		num: -51,
		accuracy: 100,
		basePower: 80,
		basePowerCallback(pokemon, target, move) {
			if (target.newlySwitched || this.queue.willMove(target)) {
				this.debug('Backstab damage boost');
				return move.basePower * 1.5;
			}
			this.debug('Backstab NOT boosted');
			return move.basePower;
		},
		category: "Physical",
		name: "Backstab",
		shortDesc: "Power 1.5x if user moves before the target.",
		pp: 10,
		priority: 0,
		flags: {contact: 1, protect: 1, mirror: 1, metronome: 1, slicing: 1},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Bide", source);
			this.add('-anim', source, "Shadow Sneak", target);
		},
		secondary: null,
		target: "normal",
		type: "Dark",
		contestType: "Clever",
	},
	electrosapper: {
		num: -52,
		accuracy: 90,
		basePower: 0,
		category: "Status",
		name: "Electro-Sapper",
		shortDesc: "Lowers the target's Speed by 1; Traps and damages the target for 4-5 turns.",
		pp: 10,
		priority: 0,
		flags: {protect: 1, reflectable: 1, mirror: 1, metronome: 1},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Bide", source);
			this.add('-anim', source, "Thunder Cage", target);
		},
		volatileStatus: 'partiallytrapped',
		boosts: {
			spe: -1,
		},
		secondary: null,
		target: "normal",
		type: "Electric",
		zMove: {boost: {spd: 1, spe: 1}},
		contestType: "Clever",
	},
	rightbehindyou: {
		num: -53,
		accuracy: true,
		basePower: 140,
		category: "Physical",
		name: "Right Behind You",
		shortDesc: "Raises user's speed by 1; restores 50% of damage dealt.",
		pp: 1,
		priority: 0,
		flags: {contact: 1, heal: 1},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Bide", source);
			this.add('-anim', source, "First Impression", target);
		},
		self: {
			boosts: {
				spe: 1,
			},
		},
		drain: [1, 2],
		isZ: "spyniumz",
		secondary: null,
		target: "normal",
		type: "Dark",
		contestType: "Tough",
	},
	
	// Skipping ahead bc future moves in the spreadsheet got added to an older mon
	bombblast: {
		num: -77,
		accuracy: 100,
		basePower: 100,
		category: "Special",
		name: "Bomb Blast",
		shortDesc: "Hits one turn after being used.",
		pp: 10,
		priority: 0,
		flags: {allyanim: 1, metronome: 1, futuremove: 1, bullet: 1},
		ignoreImmunity: true,
		onTry(source, target) {
			if (!target.side.addSlotCondition(target, 'futuremove')) return false;
			this.add('-anim', source, "Fling", target);
			Object.assign(target.side.slotConditions[target.position]['futuremove'], {
				duration: 2,
				move: 'bombblast',
				source: source,
				moveData: {
					id: 'bombblast',
					name: "Bomb Blast",
					accuracy: 100,
					basePower: 100,
					category: "Special",
					priority: 0,
					flags: {allyanim: 1, metronome: 1, futuremove: 1, bullet: 1},
					onPrepareHit(target, source, move) {
						this.attrLastMove('[still]');
						this.add('-anim', target, "Explosion", source);
					},
					ignoreImmunity: false,
					effectType: 'Move',
					type: 'Normal',
				},
			});
			this.add('-start', source, 'move: Bomb Blast');
			return this.NOT_FAIL;
		},
		secondary: null,
		target: "normal",
		type: "Normal",
		contestType: "Clever",
	},
	bombthrow: {
		num: -78,
		accuracy: 100,
		basePower: 100,
		category: "Physical",
		name: "Bomb Throw",
		shortDesc: "Hits one turn after being used.",
		pp: 10,
		priority: 0,
		flags: {allyanim: 1, metronome: 1, futuremove: 1},
		ignoreImmunity: true,
		onTry(source, target) {
			if (!target.side.addSlotCondition(target, 'futuremove')) return false;
			this.add('-anim', source, "Fling", target);
			Object.assign(target.side.slotConditions[target.position]['futuremove'], {
				duration: 2,
				move: 'bombthrow',
				source: source,
				moveData: {
					id: 'bombthrow',
					name: "Bomb Throw",
					accuracy: 100,
					basePower: 100,
					category: "Physical",
					priority: 0,
					flags: {allyanim: 1, metronome: 1, futuremove: 1},
					onPrepareHit(target, source, move) {
						this.attrLastMove('[still]');
						this.add('-anim', target, "Explosion", source);
					},
					ignoreImmunity: false,
					effectType: 'Move',
					type: 'Fire',
				},
			});
			this.add('-start', source, 'move: Bomb Throw');
			return this.NOT_FAIL;
		},
		secondary: null,
		target: "normal",
		type: "Fire",
		contestType: "Cool",
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

