import './StoneDirectiveType'

export class StoneUnset extends StoneDirectiveType {

	static directive = 'unset'

	/**
	 * Unsets a context variable
	 *
	 * @param  {object} context Context for the compilation
	 * @param  {string} args    Arguments to unset
	 * @return {string} Code to set the context variable
	 */
	static parse(parser, node, args) {
		node.properties = parser._flattenArgs(args)
		this.assertArgs(parser, args, 1)

		parser.next()
		return parser.finishNode(node, 'StoneUnset')
	}

	static generate(generator, { properties }, state) {
		let first = true
		for(const property of properties) {
			if(first) {
				first = false
			} else {
				state.write(state.lineEnd)
				state.write(state.indent)
			}

			state.write('delete ')
			generator[property.type](property, state)
			state.write(';')
		}
	}

	static walk() {
		// Do nothing
	}

}
