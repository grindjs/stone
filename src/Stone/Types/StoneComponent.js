import './StoneDirectiveBlockType'

export class StoneComponent extends StoneDirectiveBlockType {

	static directive = 'component'

	static parse(parser, node, args) {
		args = parser._flattenArgs(args)

		this.assertArgs(parser, args, 1, 2)

		node.view = args.shift()

		if(args.length > 0) {
			node.context = args.pop()
		}

		(parser._currentComponent = (parser._currentComponent || [ ])).push(node)

		const output = parser.startNode()
		output.params = args
		output.body = parser.parseUntilEndDirective('endcomponent')
		node.output = parser.finishNode(output, 'StoneOutputBlock')

		return parser.finishNode(node, 'StoneComponent')
	}

	/**
	 * Ends the current component and returns output
	 * @return {string} Output from the component
	 */
	static parseEnd(parser, node) {
		if(!parser._currentComponent || parser._currentComponent.length === 0) {
			parser.raise(parser.start, '`@endcomponent` outside of `@component`')
		}

		parser._currentComponent.pop()

		return parser.finishNode(node, 'Directive')
	}

	static generate(generator, node, state) {
		node.output.assignments = node.output.assignments || [ ]

		node.output.assignments.push({
			kind: 'const',
			left: this.make.identifier('__componentView'),
			right: node.view
		})

		node.output.assignments.push({
			kind: 'const',
			left: this.make.identifier('__componentContext'),
			right: !node.context.isNil ? node.context : this.make.object()
		})

		node.output.return = {
			type: 'CallExpression',
			callee: {
				type: 'MemberExpression',
				object: {
					type: 'MemberExpression',
					object: this.make.identifier('_'),
					property: this.make.identifier('$stone'),
				},
				property: this.make.identifier('include'),
			},
			arguments: [
				this.make.identifier('_'),
				this.make.null(),
				this.make.identifier('_templatePathname'),
				this.make.identifier('__componentView'),
				this.make.object([
					this.make.property('slot', this.make.new('HtmlString', 'output')),
					this.make.spread('__componentContext')
				])
			]
		}

		state.write('output += (')
		generator[node.output.type](node.output, state)
		state.write(')();')
	}

	static walk(walker, node, st, c) {
		// TODO
	}

	static scope(scoper, node, scope) {
		node.scope = scope.branch([
			'__componentView',
			'__componentContext'
		])

		scoper._scope(node.output, node.scope)
	}

}
