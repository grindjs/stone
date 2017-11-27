export function generate(node, state) {
	node.test = {
		type: 'CallExpression',
		callee: {
			type: 'MemberExpression',
			object: {
				type: 'Identifier',
				name: '_sections'
			},
			property: {
				type: 'Identifier',
				name: 'has'
			}
		},
		arguments: [ node.section ]
	}

	return this.IfStatement(node, state)
}

export function walk(node, st, c) {
	c(node.section, st, 'Pattern')
	c(node.consequence, st, 'Expression')

	if(node.alternate.isNil) {
		return
	}

	c(node.alternate, st, 'Expression')
}
