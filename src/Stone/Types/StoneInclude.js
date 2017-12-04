import './StoneDirectiveType'

export class StoneInclude extends StoneDirectiveType {

	static directive = 'include'

	/**
	 * Renders content from a subview
	 *
	 * @param  {object} node Blank node
	 * @param  {mixed}  args View name and optional context
	 * @return {object}      Finished node
	 */
	static parse(parser, node, args) {
		args = parser._flattenArgs(args)
		this.assertArgs(parser, args, 1, 2)

		node.view = args.shift()

		if(args.length > 0) {
			node.context = args.shift()
		}

		parser.next()
		return parser.finishNode(node, 'StoneInclude')
	}

	static generate(generator, node, state) {
		state.write('output += _.$stone.include(_, _sections, _templatePathname, ')
		generator[node.view.type](node.view, state)

		if(!node.context.isNil) {
			state.write(', ')
			generator[node.context.type](node.context, state)
		}

		state.write(');')
	}

	static walk(walker, node, st, c) {
		c(node.view, st, 'Pattern')

		if(node.context.isNil) {
			return
		}

		c(node.context, st, 'Expression')
	}

	static scope(scoper, node, scope) {
		if(node.context.isNil) {
			return
		}

		scoper._scope(node.context, scope)
	}

}
