export function generate(node, state) {
	state.pushScope(node.scope)
	state.write('function')

	if(!node.id.isNil) {
		state.write(' ')
		node.id.isScoped = true
		this[node.id.type](node.id, state)
	}

	this.SequenceExpression({ expressions: node.params || [ ] }, state)
	state.write(' ')

	if(node.rescopeContext) {
		// _ = { ..._ }
		node.body.body.unshift({
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
	}

	// let output = ''
	node.body.body.unshift({
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
	})

	if(node.returnRaw) {
		// return output
		node.body.body.push({
			type: 'ReturnStatement',
			argument: {
				type: 'Identifier',
				name: 'output'
			}
		})
	} else {
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
	}

	this[node.body.type](node.body, state)
	state.popScope()
}

export function walk(node, st, c) {
	for(const param of node.params) {
		c(param, st, 'Pattern')
	}

	c(node.body, st, 'ScopeBody')
}

export function scope(node, scope) {
	node.scope = new Set(scope)

	if(Array.isArray(node.params)) {
		for(const param of node.params) {
			this._scope(param, node.scope, true)
		}
	}

	this._scope(node.body, node.scope)
}
