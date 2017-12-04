import './StoneType'

export class StoneLoop extends StoneType {

	static generate(generator, { loop }, state) {
		// TODO: Future optimizations should check if
		// the `loop` var is used before injecting
		// support for it.

		state.__loops = (state.__loops || 0) + 1
		const loopVariable = `__loop${state.__loops}`
		loop.scope.add(loopVariable)
		loop.body.scope.add('loop')

		state.write(`const ${loopVariable} = new _.StoneLoop(`)

		if(loop.type === 'ForInStatement') {
			state.write('Object.keys(')
		}

		generator[loop.right.type](loop.right, state)

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

		generator.ForOfStatement({
			...loop,
			type: 'ForOfStatement',
			right: {
				...loop.right,
				type: 'Identifier',
				name: loopVariable
			}
		}, state)
	}

	static walk(walker, { loop }, st, c) {
		c(loop, st, 'Expression')
	}

	static scope(scoper, node, scope) {
		return scoper._scope(node.loop, scope)
	}

}
