import './StoneDirectiveType'

export class StoneEach extends StoneDirectiveType {

	static directive = 'each'

	/**
	 * Compiles each directive to call the runtime and output
	 * the result.
	 *
	 * @param  {object} node   Blank node
	 * @param  {mixed}  params Arguments to pass through to runtime
	 * @return {object}        Finished node
	 */
	static parse(parser, node, params) {
		node.params = parser._flattenArgs(params)
		this.assertArgs(parser, node.params, 3, 5)

		parser.next()
		return parser.finishNode(node, 'StoneEach')
	}

	static generate(generator, node, state) {
		node.params.unshift({
			type: 'Identifier',
			name: '_'
		}, {
			type: 'Identifier',
			name: '_templatePathname'
		})

		state.write('output += _.$stone.each')
		generator.SequenceExpression({ expressions: node.params }, state)
		state.write(';')
	}

	static walk() {
		// Do nothing
	}

}
