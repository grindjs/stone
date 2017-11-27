export function generate(node, state) {
	state.write('__extendsLayout = ')
	this[node.view.type](node.view, state)
	state.write(';')

	if(node.context.isNil) {
		return
	}

	state.write(state.lineEnd)
	state.write(state.indent)
	state.write('__extendsContext = ')
	this[node.context.type](node.context, state)
	state.write(';')
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
