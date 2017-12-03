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

	node.assignments = node.assignments || [ ]

	if(node.rescopeContext) {
		// _ = { ..._ }
		node.assignments.push({
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
		})
	}

	// let output = ''
	node.assignments.push({
		kind: 'let',
		left: {
			type: 'Identifier',
			name: 'output'
		},
		right: {
			type: 'Literal',
			value: '',
			raw: '\'\'',
		}
	})

	node.body.body.unshift(...node.assignments.map(({ kind, ...assignment }) => {
		const hasKind = !kind.isNil
		return {
			type: hasKind ? 'VariableDeclaration' : 'ExpressionStatement',
			kind: kind,
			expression: hasKind ? void 0 : { ...assignment, type: 'AssignmentExpression' },
			declarations: !hasKind ? void 0 : [
				{
					type: 'VariableDeclarator',
					id: assignment.left,
					init: assignment.right
				}
			]
		}
	}))

	let _return = null

	if(!node.return.isNil) {
		_return = node.return
	} else if(node.returnRaw) {
		// return output
		_return = {
			type: 'Identifier',
			name: 'output'
		}
	} else {
		// return new HtmlString(output)
		_return = {
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
	}

	node.body.body.push({
		type: 'ReturnStatement',
		argument: _return
	})

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
	node.scope = scope.branch()
	node.scope.add('output')

	if(Array.isArray(node.params)) {
		for(const param of node.params) {
			this._scope(param, node.scope, true)
		}
	}

	this._scope(node.body, node.scope)
}
