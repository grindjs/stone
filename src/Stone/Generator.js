import './Types'

const { baseGenerator } = require('astring')

export const Generator = {

	...baseGenerator,

	Program(node, state) {
		state._scopes = [ ]
		state.pushScope = function(scope) {
			this._scopes.push(this.scope)
			this.scope = scope
		}.bind(state)

		state.popScope = function() {
			this.scope = this._scopes.pop()
		}.bind(state)

		state.pushScope(node.scope)
		const value = baseGenerator.Program.call(this, node, state)
		state.popScope()
		return value
	},

	Property(node, state) {
		if(node.type === 'SpreadElement') {
			if(node.argument.type === 'Identifier') {
				state.write('...')
				this.Identifier(node.argument, state)
				state.write('')
			} else {
				state.write('...(')
				this[node.argument.type](node.argument, state)
				state.write(')')
			}

			return
		}

		if(!node.key.isNil && node.key.type === 'Identifier') {
			node.key = {
				...node.key,
				isScoped: true
			}

			node.shorthand = false
		}

		return baseGenerator.Property.call(this, node, state)
	},

	Identifier(node, state) {
		if(node.isScoped || (!state.scope.isNil && state.scope.has(node.name))) {
			state.write(node.name, node)
		} else {
			state.write(`_.${node.name}`, node)
		}
	},

	MemberExpression(node, state) {
		node.property.isScoped = true
		return baseGenerator.MemberExpression.call(this, node, state)
	}

}

for(const key of [
	'BlockStatement',
	'FunctionDeclaration',
	'ForStatement',
	'ForOfStatement',
	'ForInStatement',
	'WhileStatement',
	'FunctionExpression',
	'ArrowFunctionExpression'
]) {
	Generator[key] = function(node, state) {
		state.pushScope(node.scope)
		const value = baseGenerator[key].call(this, node, state)
		state.popScope()
		return value
	}
}

for(const type of Object.values(Types)) {
	type.registerGenerate(Generator)
}
