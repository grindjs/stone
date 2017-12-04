export const directive = 'dump'

/**
 * Displays the contents of an object or value
 *
 * @param  {object} node  Blank node
 * @param  {mixed}  value Value to display
 * @return {object}       Finished node
 */
export function parse(node, value) {
	node.value = value
	this.next()
	return this.finishNode(node, 'StoneDump')
}

export function generate({ value }, state) {
	state.write('output += `<pre>${_.escape(_.stringify(')
	this[value.type](value, state)
	state.write(', null, 2))}</pre>`;')
}

export function walk({ value }, st, c) {
	c(value, st, 'Expression')
}
