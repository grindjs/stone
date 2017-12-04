import { endDirectives } from '../Parsers/Conditionals'

/**
 * Convenience directive to determine if a section has content
 */
export const directive = 'hassection'

export function parse(node, args) {
	args = this._flattenArgs(args)

	if(args.length !== 1) {
		this.raise(this.start, '`@hassection` must contain exactly 1 argument')
	}

	(this._currentIf = (this._currentIf || [ ])).push(node)

	node.section = args.pop()
	node.consequent = this.parseUntilEndDirective(endDirectives)
	return this.finishNode(node, 'StoneHasSection')
}

export function generate(node, state) {
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

	return this.IfStatement(node, state)
}

export function walk(node, st, c) {
	c(node.section, st, 'Pattern')
	c(node.consequence, st, 'Expression')

	if(node.alternate.isNil) {
		return
	}

	c(node.alternate, st, 'Expression')
}
