export const directive = 'yield'

/**
 * Compiles the yield directive to output a section
 *
 * @param  {object} context Context for the compilation
 * @param  {string} section Name of the section to yield
 * @return {string}         Code to render the section
 */
export function parse(node, args) {
	args = this._flattenArgs(args)

	if(args.length === 0) {
		this.raise(this.start, '`@yield` must contain at least 1 argument')
	}

	node.section = args.shift()

	if(args.length > 1) {
		this.raise(this.start, '`@yield` cannot contain more than 2 arguments')
	} else if(args.length === 1) {
		node.output = args.pop()
	}

	this.next()
	return this.finishNode(node, 'StoneYield')
}

export function generate(node, state) {
	state.write('output += _sections.render(')
	this[node.section.type](node.section, state)

	if(!node.output.isNil) {
		state.write(', ')
		this.StoneOutputExpression({ safe: true, value: node.output }, state)
	}

	state.write(');')
}

export function walk(node, st, c) {
	c(node.section, st, 'Pattern')

	if(node.output.isNil) {
		return
	}

	c(node.output, st, 'Expression')
}

export function scope(node, scope) {
	if(node.output.isNil) {
		return
	}

	this._scope(node.output, scope)
}
