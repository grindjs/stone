import './StoneDirectiveType'

export class StoneExtends extends StoneDirectiveType {

	static directive = 'extends'

	static parse(parser, node, args) {
		if(parser._stoneTemplate.isNil) {
			parser.unexpected()
		}

		if(parser._stoneTemplate.isLayout === true) {
			parser.raise(parser.start, '`@extends` may only be called once per view.')
		} else {
			parser._stoneTemplate.isLayout = true
		}

		args = parser._flattenArgs(args)

		if(args.length === 0) {
			parser.raise(parser.start, '`@extends` must contain at least 1 argument')
		}

		node.view = args.shift()

		if(args.length > 1) {
			parser.raise(parser.start, '`@extends` cannot contain more than 2 arguments')
		} else if(args.length === 1) {
			node.context = args.shift()
			parser._stoneTemplate.hasLayoutContext = true
		}

		parser.next()
		return parser.finishNode(node, 'StoneExtends')
	}

	static generate(generator, node, state) {
		state.write('__extendsLayout = ')
		generator[node.view.type](node.view, state)
		state.write(';')

		if(node.context.isNil) {
			return
		}

		state.write(state.lineEnd)
		state.write(state.indent)
		state.write('__extendsContext = ')
		generator[node.context.type](node.context, state)
		state.write(';')
	}

	static walk(walker, node, st, c) {
		c(node.view, st, 'Pattern')

		if(node.context.isNil) {
			return
		}

		c(node.context, st, 'Expression')
	}

	static scope(scoper, node, scope) {
		if(node.context.isNil) {
			return
		}

		scoper._scope(node.context, scope)
	}

}
