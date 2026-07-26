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

	balefulomen: {
        name: "Baleful Omen",
        duration: 5,

        onFieldStart(field, source) {
            this.add('-fieldstart', 'Baleful Omen');
			this.add('-message', 'Thunder crackles through intense winds!');
            this.effectState.sourceSide = source.side;
        },

        onResidualOrder: 27,
        onResidualSubOrder: 9,
        onResidual() {
            const targetSide = this.effectState.sourceSide.foe;

            for (const pokemon of targetSide.active) {
                if (!pokemon || pokemon.fainted) continue;

                const immune = !this.dex.getImmunity('Electric', pokemon);
                const resisted = this.dex.getEffectiveness('Electric', pokemon) < 0;

                this.damage(
                    pokemon.baseMaxhp / (immune || resisted ? 24 : 16),
                    pokemon
                );
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
};