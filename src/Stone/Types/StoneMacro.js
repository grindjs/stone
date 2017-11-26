export function generate(node, state) {
	state.pushScope(node.scope)
	state.write('_[')
	this[node.id.type](node.id, state)
	state.write('] = function')
	this.SequenceExpression({ expressions: node.params }, state)
	state.write(' ')

	node.body.body.unshift({
		// let output = '' (rescopes output)
		type: 'VariableDeclaration',
		declarations: [
			{
				type: 'VariableDeclarator',
				id: {
					type: 'Identifier',
					name: 'output'
				},
				init: {
					type: 'Literal',
					value: '\'\'',
					raw: '\'\'',
				}
			}
		],
		kind: 'let'
	}, {
		// _ = { ..._ } (rescopes context)
		type: 'ExpressionStatement',
		expression: {
			type: 'AssignmentExpression',
			operator: '=',
			left: {
				type: 'Identifier',
				name: '_'
			},
			right: {
				type: 'ObjectExpression',
				properties: [
					{
						type: 'SpreadElement',
						argument: {
							type: 'Identifier',
							name: '_'
						}
					}
				]
			}
		}
	})

	// return new HtmlString(output)
	node.body.body.push({
		type: 'ReturnStatement',
		argument: {
			type: 'NewExpression',
			callee: {
				type: 'Identifier',
				name: 'HtmlString'
			},
			arguments: [
				{
					type: 'Identifier',
					name: 'output'
				}
			]
		}
	})

	this[node.body.type](node.body, state)
	state.popScope()
}

export function walk(node, st, c) {
	c(node.id, st, 'Pattern')

	for(const param of node.params) {
		c(param, st, 'Pattern')
	}

	c(node.body, st, 'ScopeBody')
}

export function scope(node, scope) {
	node.scope = new Set(scope)

	for(const param of node.params) {
		this._scope(param, node.scope, true)
	}

	this._scope(node.body, node.scope)
}
