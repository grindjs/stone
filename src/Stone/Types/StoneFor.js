import './StoneDirectiveBlockType'

export class StoneFor extends StoneDirectiveBlockType {

	static directive = 'for'

	static parseArgs(parser, node) {
		parser.pos--
		parser.parseForStatement(node)

		return null
	}

	static parse(parser, node) {
		switch(node.type) {
			case 'ForOfStatement':
				node.kind = 'of'
				break
			case 'ForInStatement':
				node.kind = 'in'
				break
			case 'ForStatement':
				node.kind = 'simple'
				break
			default:
				parser.raise(parser.start, 'Unexpected `@for` type')
		}

		node.body = this.parseUntilEndDirective(parser, node)
		return parser.finishNode(node, this.name)
	}

	static generate(generator, node, state) {
		if(node.kind === 'simple') {
			return generator.ForStatement(node, state)
		}

		// TODO: Future optimizations should check if
		// the `loop` var is used before injecting
		// support for it.
		state.__loops = (state.__loops || 0) + 1
		const loopVariable = `__loop${state.__loops}`
		node.scope.add(loopVariable)
		node.body.scope.add('loop')

		state.write(`const ${loopVariable} = new _.StoneLoop(`)

		if(node.kind === 'in') {
			state.write('Object.keys(')
		}

		generator[node.right.type](node.right, state)

		if(node.kind === 'in') {
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
			start: node.body.start,
			end: node.body.end
		}

		node.body.body.unshift({
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
			...node,
			type: 'ForOfStatement',
			right: {
				...node.right,
				type: 'Identifier',
				name: loopVariable
			}
		}, state)
	}

	static walk(walker, node, st, c) {
		if(node.kind === 'simple') {
			return walker.ForStatement(node, st, c)
		}

		c(node, st, 'Expression')
	}

	static scope(scoper, node, scope) {
		switch(node.kind) {
			case 'of':
				return scoper.ForOfStatement(node, scope)
			case 'in':
				return scoper.ForInStatement(node, scope)
			case 'simple':
				return scoper.ForStatement(node, scope)
		}
	}

}
