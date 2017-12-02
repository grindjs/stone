export function generate(node, state) {
	state.write('__componentContext[')
	this[node.id.type](node.id, state)
	state.write('] = ')

	if(node.inline) {
		this.StoneOutputExpression({ safe: true, value: node.output }, state)
	} else {
		state.write('(')
		this[node.output.type](node.output, state)
		state.write(')()')
	}

	state.write(';')
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
