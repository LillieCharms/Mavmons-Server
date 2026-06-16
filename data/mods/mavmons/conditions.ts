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
};
