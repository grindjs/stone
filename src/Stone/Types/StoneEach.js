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
