export function generate(node, state) {
	state.write('_[')
	this[node.id.type](node.id, state)
	state.write('] = ')
	return this[node.output.type](node.output, state)
}

export function walk(node, st, c) {
	c(node.id, st, 'Pattern')
	c(node.output, st, 'Expression')
}

export function scope({ output }, scope) {
	this._scope(output, scope)
}
