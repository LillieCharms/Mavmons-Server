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
    	    this.add('-fieldend', 'Thunderstorm');
        },
    },

};