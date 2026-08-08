export const Conditions: import('../sim/dex-conditions').ConditionDataTable = {
	darkness: {
		name: 'Darkness',
		duration: 5,
		onFieldStart(field, source) {
			this.add('-fieldstart', 'Darkness');
			this.add('-message', 'Darkness engulfs the field!');
		},
		onFieldResidualOrder: 27,
		onFieldResidualSubOrder: 8,
		onFieldEnd() {
			this.add('-fieldend', 'Darkness');
			this.add('-message', 'The darkness fades.');
		},
		onBasePower(basePower, attacker, defender, move) {
			if (move.type === 'Dark') {
				return this.chainModify(1.3);
			}
		},
	},
	roaring: {
		name: 'Roaring',
		duration: 5,
		onFieldStart(field, source) {
			this.add('-fieldstart', 'Roaring');
			this.add('-message', 'The Roaring engulfs the field!');
		},
		onFieldResidualOrder: 27,
		onFieldResidualSubOrder: 8,
		onFieldEnd() {
			this.add('-fieldend', 'Roaring');
			this.add('-message', 'The Roaring fades.');
		},
		onBasePower(basePower, attacker, defender, move) {
			if (move.type === 'Dark') {
				return this.chainModify(1.5);
			}
		},
	},
	balefulomen: {
        name: "Baleful Omen",
        duration: 5,
        onFieldStart(field, source) {
            this.effectState.source = source;
    		this.effectState.sourceSide = source.side;
            this.add('-fieldstart', 'Baleful Omen', '[from] ability: Shard of Euthymia');
			this.add('-message', 'Thunder crackles through intense winds!');
        },

        onResidualOrder: 27,
        onResidualSubOrder: 9,
        onResidual() {
			this.add('-message', 'Baleful Omen residual');
            const targetSide = this.effectState.sourceSide.foe;
            for (const pokemon of targetSide.active) {
                if (!pokemon || pokemon.fainted) continue;
			const modifier =
				!pokemon.runImmunity('Electric') ||
				pokemon.runEffectiveness('Electric') < 0
					? 24
					: 16;
			this.damage(pokemon.baseMaxhp / modifier, pokemon);
            }
        },
		onFieldEnd() {
    	    this.add('-fieldend', 'Baleful Omen');
        },
    },
	giantpunchstacks: {
		name: "Giant Punch Stacks",

		onStart(pokemon) {
			this.effectState.stacks = 0;

			this.add(
				"-message",
				`${pokemon.name} has no Giant Punch charge!`
			);
		},

		onDamagingHit(damage, target) {
			if (!damage) return;

			let gain = 1;

			// CheezEsports interaction
			if (target.volatiles.chezesports) {
				gain = 2;
			}

			this.effectState.stacks = Math.min(
				10,
				this.effectState.stacks + gain
			);

			this.add(
				"-message",
				`${target.name} has ${this.effectState.stacks} Giant Punch charge!`
			);
		},
	},
	smashrage: {
		name: "Smash Rage",
		onStart(pokemon) {
			this.add(
				"-start",
				pokemon,
				"Smash Rage"
			);
		},
		onBasePower(basePower, pokemon, target, move) {
			if (move.category !== "Physical") return;
			return this.chainModify(1.2);
		},
		onModifyMove(move, pokemon) {
			if (move.category !== "Physical") return;
			// Cargo Throw always crits
			if (move.id === "cargothrow") {
				move.willCrit = true;
			}
			// Giant Punch override
			if (move.id === "giantpunch") {
				move.basePower = 350;
			}
		},
		onAfterMove(pokemon, target, move) {
			if (move.category !== "Physical") return;
			// Consume Smash Rage after first physical attack
			pokemon.removeVolatile("smashrage");
		},
		onEnd(pokemon) {
			this.add(
				"-end",
				pokemon,
				"Smash Rage"
			);
		},
	},
	cheezesports: {
    	name: "Signed by CheezEsports",
		onStart(pokemon) {
			this.add(
				"-start",
				pokemon,
				"CheezEsports"
			);
		},
		onSwitchOut(pokemon) {
			pokemon.removeVolatile("cheezesports");
		},
		onEnd(pokemon) {
			this.add(
				"-end",
				pokemon,
				"CheezEsports"
			);
		},
	},
	cageddemon: {
		name: "Caged Demon",
		onTrapPokemon(pokemon) {
				pokemon.tryTrap();
			},
	},
	killerwail51: {
	name: "Killer Wail 5.1",
	duration: 3,
		onStart(pokemon, source) {
			this.add('-start', pokemon, 'move: Killer Wail 5.1', '[of] ' + source);
		},

		onResidualOrder: 14,

		onResidual(pokemon) {
			const source = this.effectState.source;
			if (!source || source.hp <= 0 || !source.isActive) {
				this.add('-end', pokemon, 'move: Killer Wail 5.1');
				return;
			}

			this.boost(
				{def: -1, spd: -1},
				pokemon,
				source,
				this.dex.getActiveMove('Killer Wail 5.1')
			);
		},

		onEnd(target) {
			this.add('-end', target, 'move: Killer Wail 5.1');
		},
	},
	pitchingchange: {
		duration: 2,
		onStart(side) {
			this.effectState.used = false;
		},
		onSwitchIn(pokemon) {
			if (this.effectState.used) return;
			this.heal(pokemon.baseMaxhp / 16, pokemon);
			this.add('-heal', pokemon, pokemon.getHealth(), '[from] move: Pitching Change');
			this.effectState.used = true;
		},
		onEnd(side) {
			this.add('-end', side, 'move: Pitching Change');
		},
	},
	solidarity: {
		name: "Solidarity",
		onStart(pokemon) {
			const fairyCount = pokemon.volatiles['solidarity'].fairyCount;
			this.add('-start', pokemon, 'Solidarity', `[${fairyCount}]`);
		},
	},
	wavebreaker: {
    duration: 4,
    onStart(side) {
        this.add('-sidestart', side, 'Wavebreaker');
    },
    onSwitchIn(pokemon) {
        if (!pokemon.isGrounded()) return;
        this.damage(pokemon.baseMaxhp / 4, pokemon);
        this.boost({
            evasion: -2,
        }, pokemon);
    },
    onEnd(side) {
        this.add('-sideend', side, 'Wavebreaker');
    },
	},
};