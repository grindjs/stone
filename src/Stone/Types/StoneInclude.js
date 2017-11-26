export function generate(node, state) {
	state.write('output += _.$stone.include(_, _sections, _templatePathname, ')
	this[node.view.type](node.view, state)

	if(!node.context.isNil) {
		state.write(', ')
		this[node.context.type](node.context, state)
	}

	state.write(');')
}

export function walk() {
	// Do nothing
}
