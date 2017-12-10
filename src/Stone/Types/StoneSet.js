import './StoneDirectiveType'
import '../../Stone'

export class StoneSet extends StoneDirectiveType {

	static directive = 'set'

	static parseArgs(parser) {
		parser.skipSpace()

		let kind = null

		if(parser.input.substring(parser.pos, parser.pos + 6).toLowerCase() === 'const ') {
			kind = 'const'
		} else if(parser.input.substring(parser.pos, parser.pos + 4).toLowerCase() === 'let ') {
			kind = 'let'
		} else if(parser.input.substring(parser.pos, parser.pos + 4).toLowerCase() === 'var ') {
			parser.raise(parser.start, '`@set` does not support `var`')
		} else {
			return parser.parseDirectiveArgs()
		}

		parser.pos += kind.length

		const node = parser.parseDirectiveArgs()
		node.kind = kind
		return node
	}

	/**
	 * Sets a context variable
	 *
	 * @param  {object} context Context for the compilation
	 * @param  {string} args    Arguments to set
	 * @return {string} Code to set the context variable
	 */
	static parse(parser, node, args) {
		const kind = args.kind || null
		args = parser._flattenArgs(args)

		this.assertArgs(parser, args, 1, 2)

		if(args.length === 1 && args[0].type === 'AssignmentExpression') {
			Object.assign(node, args[0])
		} else {
			node.operator = '='
			node.left = args[0]
			node.right = args[1]
		}

		node.kind = kind
		this.expressionToPattern(node.left)

		parser.next()
		return parser.finishNode(node, 'StoneSet')
	}

	static generate(generator, { kind, left, right }, state) {
		if(right.isNil) {
			generator[left.type](left, state)
			return
		}

		// If var type has been explicitly defined, we’ll
		// pass through directly and scope locally
		if(!kind.isNil) {
			const declaration = this.make.declaration(left, right, kind)
			require('../Scoper').Scoper._scope(left, state.scope, true)
			return generator[declaration.type](declaration, state)
		}

		// Otherwise, scoping is assumed to be on the context var
		if(left.type !== 'ArrayPattern' && left.type !== 'ObjectPattern') {
			// If we‘re not destructuring, we can assign it directly
			// and bail out early.
			const assignment = this.make.assignment(left, right)
			return generator[assignment.type](assignment, state)
		}

		// If we are destructuring, we need to find the vars to extract
		// then wrap them in a function and assign them to the context var
		const extracted = [ ]
		Stone.walkVariables(left, node => extracted.push(node))

		const block = this.make.block([
			this.make.declaration(left, right, 'const'),
			this.make.return(this.make.object(extracted.map(value => this.make.property(value, value))))
		])

		block.scope = state.scope.branch(extracted.map(({ name }) => name))

		state.write('Object.assign(_, (function() ')
		generator[block.type](block, state)
		state.write(')());')
	}

	static walk(walker, { left, right }, st, c) {
		if(right.isNil) {
			c(left, st, 'Expression')
			return
		}

		c(left, st, 'Pattern')
		c(right, st, 'Pattern')
	}

	/**
	 * `parseSetDirectiveArgs` gets parsed into SequenceExpression
	 * which parses destructuring into Array/Object expressions
	 * instead of patterns
	 */
	static expressionToPattern(node) {
		if(node.isNil) {
			return
		}

		if(node.type === 'ArrayExpression') {
			node.type = 'ArrayPattern'
			node.elements.forEach(this.expressionToPattern.bind(this))
		} else if(node.type === 'ObjectExpression') {
			node.type = 'ObjectPattern'

			for(const property of node.properties) {
				this.expressionToPattern(property.value)
			}
		}
	}

}
