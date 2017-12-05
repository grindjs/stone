import './StoneDirectiveType'

/**
 * Generate break node that optionally has a condition
 * associated with it.
 */
export class StoneBreak extends StoneDirectiveType {

	static directive = 'break'

	static parse(parser, node, condition) {
		if(
			(!Array.isArray(parser._whileStack) || parser._whileStack.length === 0)
			&& (!parser._currentFor || parser._currentFor.length === 0)
		) {
			parser.raise(parser.start, `\`@${this.directive}\` outside of \`@for\` or \`@while\``)
		}

		node.test = condition
		return parser.finishNode(node, this.name)
	}

	static generate(generator, node, state) {
		if(node.test.isNil) {
			return generator.BreakStatement(node, state)
		}

		return generator.IfStatement({
			...node,
			consequent: this.make.block([ this.make.break() ])
		}, state)
	}

	static walk(walker, { test }, st, c) {
		if(test.isNil) {
			return
		}

		c(test, st, 'Expression')
	}

}
