import './StoneDirectiveType'

import { endDirectives } from '../Parsers/Conditionals'

/**
 * Convenience directive to determine if a section has content
 */
export class StoneHasSection extends StoneDirectiveType {

	static directive = 'hassection'

	static parse(parser, node, args) {
		args = parser._flattenArgs(args)

		if(args.length !== 1) {
			parser.raise(parser.start, '`@hassection` must contain exactly 1 argument')
		}

		(parser._currentIf = (parser._currentIf || [ ])).push(node)

		node.section = args.pop()
		node.consequent = parser.parseUntilEndDirective(endDirectives)
		return parser.finishNode(node, 'StoneHasSection')
	}

	static generate(generator, node, state) {
		node.test = {
			type: 'CallExpression',
			callee: {
				type: 'MemberExpression',
				object: {
					type: 'Identifier',
					name: '_sections'
				},
				property: {
					type: 'Identifier',
					name: 'has'
				}
			},
			arguments: [ node.section ]
		}

		return generator.IfStatement(node, state)
	}

	static walk(walker, node, st, c) {
		c(node.section, st, 'Pattern')
		c(node.consequence, st, 'Expression')

		if(node.alternate.isNil) {
			return
		}

		c(node.alternate, st, 'Expression')
	}

}
