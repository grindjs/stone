export function generate(node, state) {
	state.write('output += _.$stone.include(_, _sections, _templatePathname, ')
	this[node.view.type](node.view, state)

	if(!node.context.isNil) {
		state.write(', ')
		this[node.context.type](node.context, state)
	}

	state.write(');')
}

export function walk(node, st, c) {
	c(node.view, st, 'Pattern')

	if(node.context.isNil) {
		return
	}

	c(node.context, st, 'Expression')
}

export function scope(node, scope) {
	if(node.context.isNil) {
		return
	}

	this._scope(node.context, scope)
}
