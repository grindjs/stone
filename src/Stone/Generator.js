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

		return baseGenerator.Property.call(this, node, state)
	}

}

for(const key of Object.keys(Types)) {
	Generator[key] = Types[key].generate.bind(Generator)
}
