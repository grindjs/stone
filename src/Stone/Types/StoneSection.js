export function generate(node, state) {
	state.write('_sections.push(')
	this[node.id.type](node.id, state)
	state.write(', ')

	if(node.inline) {
		state.write('() => ')
		this.StoneOutputExpression({ safe: true, value: node.output }, state)
	} else {
		this[node.output.type](node.output, state)
	}

	state.write(');')

	if(!node.yield) {
		return
	}

	state.write(state.lineEnd)
	state.write(state.indent)
	this.StoneYield({ section: node.id }, state)
}

export function walk(node, st, c) {
	c(node.id, st, 'Pattern')

	if(node.inline) {
		return
	}

	c(node.output, st, 'Expression')
}

export function scope(node, scope) {
	this._scope(node.output, scope)
}
