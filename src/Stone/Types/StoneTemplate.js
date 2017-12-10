import './StoneType'

export class StoneTemplate extends StoneType {

	static generate(generator, { pathname, output, isLayout, hasLayoutContext }, state) {
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
					type: 'NewExpression',
					callee: {
						type: 'Identifier',
						name: 'StoneSections'
					}
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

		if(isLayout) {
			output.assignments.push({
				kind: 'let',
				left: {
					type: 'Identifier',
					name: '__extendsLayout'
				}
			})

			const context =  {
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

			if(hasLayoutContext) {
				const extendsContext = {
					type: 'Identifier',
					name: '__extendsContext'
				}

				output.assignments.push({
					kind: 'let',
					left: extendsContext
				})

				context.properties.push({
					type: 'SpreadElement',
					argument: extendsContext
				})
			}

			output.return = {
				type: 'CallExpression',
				callee: {
					type: 'MemberExpression',
					object: {
						type: 'MemberExpression',
						object: {
							type: 'Identifier',
							name: '_'
						},
						property: {
							type: 'Identifier',
							name: '$stone'
						}
					},
					property: {
						type: 'Identifier',
						name: 'extends'
					}
				},
				arguments: [
					{
						type: 'Identifier',
						name: '_templatePathname'
					}, {
						type: 'Identifier',
						name: '__extendsLayout'
					},
					context,
					{
						type: 'Identifier',
						name: '_sections'
					}
				]
			}
		} else {
			output.returnRaw = true
		}

		generator[output.type](output, state)
	}

	static walk(walker, { output }, st, c) {
		c(output, st, 'Expression')
	}

	static scope(scoper, { output, isLayout, hasLayoutContext }, scope) {
		scope.add('_')
		scope.add('_sections')
		scope.add('_templatePathname')

		if(isLayout) {
			scope.add('__extendsLayout')

			if(hasLayoutContext) {
				scope.add('__extendsContext')
			}
		}

		scoper._scope(output, scope)
	}

}
