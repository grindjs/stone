import './StoneDirectiveType'

export class StoneYield extends StoneDirectiveType {

	static directive = 'yield'

	/**
	 * Compiles the yield directive to output a section
	 *
	 * @param  {object} context Context for the compilation
	 * @param  {string} section Name of the section to yield
	 * @return {string}         Code to render the section
	 */
	static parse(parser, node, args) {
		args = parser._flattenArgs(args)

		if(args.length === 0) {
			parser.raise(parser.start, '`@yield` must contain at least 1 argument')
		}

		node.section = args.shift()

		if(args.length > 1) {
			parser.raise(parser.start, '`@yield` cannot contain more than 2 arguments')
		} else if(args.length === 1) {
			node.output = args.pop()
		}

		parser.next()
		return parser.finishNode(node, 'StoneYield')
	}

	static generate(generator, node, state) {
		state.write('output += _sections.render(')
		generator[node.section.type](node.section, state)

		if(!node.output.isNil) {
			state.write(', ')
			generator.StoneOutputExpression({ safe: true, value: node.output }, state)
		}

		state.write(');')
	}

	static walk(walker, node, st, c) {
		c(node.section, st, 'Pattern')

		if(node.output.isNil) {
			return
		}

		c(node.output, st, 'Expression')
	}

	static scope(scoper, node, scope) {
		if(node.output.isNil) {
			return
		}

		scoper._scope(node.output, scope)
	}

}
