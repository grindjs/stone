export const directive = 'each'

/**
 * Compiles each directive to call the runtime and output
 * the result.
 *
 * @param  {object} node   Blank node
 * @param  {mixed}  params Arguments to pass through to runtime
 * @return {object}        Finished node
 */
export function parse(node, params) {
	node.params = this._flattenArgs(params)

	if(node.params.length < 3) {
		this.raise(this.start, '`@each` must contain at least 3 arguments')
	} else if(node.params.length > 5) {
		this.raise(this.start, '`@each` cannot contain more than 5 arguments')
	}

	this.next()
	return this.finishNode(node, 'StoneEach')
}

export function generate(node, state) {
	node.params.unshift({
		type: 'Identifier',
		name: '_'
	}, {
		type: 'Identifier',
		name: '_templatePathname'
	})

	state.write('output += _.$stone.each')
	this.SequenceExpression({ expressions: node.params }, state)
	state.write(';')
}

export function walk() {
	// Do nothing
}
