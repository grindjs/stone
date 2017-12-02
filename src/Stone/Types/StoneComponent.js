import { make } from '../Support/MakeNode'

export function generate(node, state) {
	node.output.assignments = node.output.assignments || [ ]

	node.output.assignments.push({
		kind: 'const',
		left: make.identifier('__componentView'),
		right: node.view
	})

	node.output.assignments.push({
		kind: 'const',
		left: make.identifier('__componentContext'),
		right: !node.context.isNil ? node.context : make.object()
	})

	node.output.return = {
		type: 'CallExpression',
		callee: {
			type: 'MemberExpression',
			object: {
				type: 'MemberExpression',
				object: make.identifier('_'),
				property: make.identifier('$stone'),
			},
			property: make.identifier('include'),
		},
		arguments: [
			make.identifier('_'),
			make.null(),
			make.identifier('_templatePathname'),
			make.identifier('__componentView'),
			make.object([
				make.property('slot', make.new('HtmlString', 'output')),
				make.spread('__componentContext')
			])
		]
	}

	state.write('output += (')
	this[node.output.type](node.output, state)
	state.write(')();')
}

export function walk(node, st, c) {

}

export function scope(node, scope) {
	node.scope = new Set(scope)
	node.scope.add('__componentView')
	node.scope.add('__componentContext')

	this._scope(node.output, node.scope)
}
