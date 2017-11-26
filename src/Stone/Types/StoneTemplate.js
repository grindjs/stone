export function generate({ output }, state) {
	output.returnRaw = true

	output.id = {
		type: 'Identifier',
		name: 'template'
	}

	output.params = [
		{
			type: 'Identifier',
			name: '_'
		}, {
			type: 'AssignmentPattern',
			left: {
				type: 'Identifier',
				name: '_sections'
			},
			right: {
				type: 'ObjectExpression',
				properties: [ ]
			}
		}
	]

	this[output.type](output, state)
}

export function walk({ output }, st, c) {
	c(output, st, 'Expression')
}

export function scope({ output }, scope) {
	scope.add('_')
	scope.add('_sections')
	this._scope(output, scope)
}
