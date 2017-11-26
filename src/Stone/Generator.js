import './Types'

const { baseGenerator } = require('astring')

export const Generator = {

	...baseGenerator,

	Property(node, state) {
		if(node.type === 'SpreadElement') {
			state.write('...(')
			this[node.argument.type](node.argument, state)
			state.write(')')
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
	'Program',
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
		const oldScope = state.scope
		state.scope = node.scope
		const value = baseGenerator[key].call(this, node, state)
		state.scope = oldScope
		return value
	}
}

for(const key of Object.keys(Types)) {
	Generator[key] = Types[key].generate.bind(Generator)
}
