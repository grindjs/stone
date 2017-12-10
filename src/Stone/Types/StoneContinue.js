import './StoneBreak'

/**
 * Generate continue node that optionally has a condition
 * associated with it.
 */
export class StoneContinue extends StoneBreak {

	static directive = 'continue'

	static generate(generator, node, state) {
		if(node.test.isNil) {
			return generator.ContinueStatement(node, state)
		}

		return generator.IfStatement({
			...node,
			consequent: this.make.block([ this.make.continue() ])
		}, state)
	}

}
