export function generate({ pathname, output }, state) {
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

	output.assignments = output.assignments || [ ]
	output.assignments.push({
		kind: 'const',
		left: {
			type: 'Identifier',
			name: '_templatePathname'
		},
		right: {
			type: 'Literal',
			value: pathname.isNil ? null : pathname,
			raw: pathname.isNil ? null : `'${pathname}'`
		}
	})

	this[output.type](output, state)
}

export function walk({ output }, st, c) {
	c(output, st, 'Expression')
}

export function scope({ output }, scope) {
	scope.add('_')
	scope.add('_sections')
	scope.add('_templatePathname')
	this._scope(output, scope)
}
