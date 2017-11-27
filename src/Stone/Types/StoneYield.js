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
