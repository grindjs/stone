import './StoneDirectiveType'

export class StoneDump extends StoneDirectiveType {

	static directive = 'dump'

	/**
	 * Displays the contents of an object or value
	 *
	 * @param  {object} node  Blank node
	 * @param  {mixed}  value Value to display
	 * @return {object}       Finished node
	 */
	static parse(parser, node, value) {
		node.value = value
		parser.next()
		return parser.finishNode(node, 'StoneDump')
	}

	static generate(generator, { value }, state) {
		state.write('output += `<pre>${_.escape(_.stringify(')
		generator[value.type](value, state)
		state.write(', null, 2))}</pre>`;')
	}

	static walk(walker, { value }, st, c) {
		c(value, st, 'Expression')
	}

}
