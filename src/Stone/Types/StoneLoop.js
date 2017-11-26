export function generate({ loop }, state) {
	// TODO: Future optimizations should check if
	// the `loop` var is used before injecting
	// support for it.

	state.__loops = (state.__loops || 0) + 1
	const loopVariable = `__loop${state.__loops}`
	loop.scope.add(loopVariable)
	loop.body.scope.add(loopVariable)
	loop.body.scope.add('loop')

	state.write(`const ${loopVariable} = new _.StoneLoop(`)

	if(loop.type === 'ForInStatement') {
		state.write('Object.keys(')
	}

	this[loop.right.type](loop.right, state)

	if(loop.type === 'ForInStatement') {
		state.write(')')
	}

	state.write(');')
	state.write(state.lineEnd)
	state.write(state.indent)

	state.write(`${loopVariable}.depth = ${state.__loops};`)
	state.write(state.lineEnd)
	state.write(state.indent)

	if(state.__loops > 1) {
		state.write(`${loopVariable}.parent = __loop${state.__loops - 1};`)
		state.write(state.lineEnd)
		state.write(state.indent)
	}

	const positions = {
		start: loop.body.start,
		end: loop.body.end
	}

	loop.body.body.unshift({
		...positions,
		type: 'VariableDeclaration',
		declarations: [
			{
				...positions,
				type: 'VariableDeclarator',
				id: {
					...positions,
					type: 'Identifier',
					name: 'loop'
				},
				init: {
					...positions,
					type: 'Identifier',
					name: loopVariable
				}
			}
		],
		kind: 'const'
	})

	this.ForOfStatement({
		...loop,
		type: 'ForOfStatement',
		right: {
			...loop.right,
			type: 'Identifier',
			name: loopVariable
		}
	}, state)
}

export function walk({ loop }, st, c) {
	c(loop, st, 'Expression')
}

export function scope(node, scope) {
	return this._scope(node.loop, scope)
}
