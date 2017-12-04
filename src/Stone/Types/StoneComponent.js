import { make } from '../Support/MakeNode'

export const directive = 'component'
export const hasEndDirective = true

export function parse(node, args) {
	args = this._flattenArgs(args)

	if(args.length === 0) {
		this.raise(this.start, '`@component` must contain at least 1 argument')
	}

	node.view = args.shift()

	if(args.length > 1) {
		this.raise(this.start, '`@component` cannot contain more than 2 arguments')
	} else if(args.length === 1) {
		node.context = args.pop()
	}

	(this._currentComponent = (this._currentComponent || [ ])).push(node)

	const output = this.startNode()
	output.params = args
	output.body = this.parseUntilEndDirective('endcomponent')
	node.output = this.finishNode(output, 'StoneOutputBlock')

	return this.finishNode(node, 'StoneComponent')
}

/**
 * Ends the current component and returns output
 * @return {string} Output from the component
 */
export function parseEnd(node) {
	if(!this._currentComponent || this._currentComponent.length === 0) {
		this.raise(this.start, '`@endcomponent` outside of `@component`')
	}

	this._currentComponent.pop()

	return this.finishNode(node, 'Directive')
}

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
	// TODO
}

export function scope(node, scope) {
	node.scope = scope.branch([
		'__componentView',
		'__componentContext'
	])

	this._scope(node.output, node.scope)
}
