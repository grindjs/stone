import '../../Stone'
import { make } from '../Support/MakeNode'

export const directive = 'set'

export function parseArgs() {
	this.skipSpace()

	let kind = null

	if(this.input.substring(this.pos, this.pos + 6).toLowerCase() === 'const ') {
		kind = 'const'
	} else if(this.input.substring(this.pos, this.pos + 4).toLowerCase() === 'let ') {
		kind = 'let'
	} else if(this.input.substring(this.pos, this.pos + 4).toLowerCase() === 'var ') {
		this.raise(this.start, '`@set` does not support `var`')
	} else {
		return this.parseDirectiveArgs()
	}

	this.pos += kind.length

	const node = this.parseDirectiveArgs()
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
export function parse(node, args) {
	const kind = args.kind || null
	args = this._flattenArgs(args)

	if(args.length === 0) {
		this.raise(this.start, '`@set` must contain at least 1 argument')
	} else if(args.length > 2) {
		this.raise(this.start, '`@set` cannot contain more than 2 arguments')
	}

	if(args.length === 1 && args[0].type === 'AssignmentExpression') {
		Object.assign(node, args[0])
	} else {
		node.operator = '='
		node.left = args[0]
		node.right = args[1]
	}

	node.kind = kind
	expressionToPattern(node.left)

	this.next()
	return this.finishNode(node, 'StoneSet')
}

export function generate({ kind, left, right }, state) {
	if(right.isNil) {
		this[left.type](left, state)
		return
	}

	// If var type has been explicitly defined, we’ll
	// pass through directly and scope locally
	if(!kind.isNil) {
		const declaration = make.declaration(left, right, kind)
		require('../Scoper').Scoper._scope(left, state.scope, true)
		return this[declaration.type](declaration, state)
	}

	// Otherwise, scoping is assumed to be on the context var
	if(left.type !== 'ArrayPattern' && left.type !== 'ObjectPattern') {
		// If we‘re not destructuring, we can assign it directly
		// and bail out early.
		const assignment = make.assignment(left, right)
		return this[assignment.type](assignment, state)
	}

	// If we are destructuring, we need to find the vars to extract
	// then wrap them in a function and assign them to the context var
	const extracted = [ ]
	Stone.walkVariables(left, node => extracted.push(node))

	const block = make.block([
		make.declaration(left, right, 'const'),
		make.return(make.object(extracted.map(value => make.property(value, value))))
	])

	block.scope = state.scope.branch(extracted.map(({ name }) => name))

	state.write('Object.assign(_, (function() ')
	this[block.type](block, state)
	state.write(')());')
}

export function walk({ left, right }, st, c) {
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
function expressionToPattern(node) {
	if(node.isNil) {
		return
	}

	if(node.type === 'ArrayExpression') {
		node.type = 'ArrayPattern'
		node.elements.forEach(expressionToPattern)
	} else if(node.type === 'ObjectExpression') {
		node.type = 'ObjectPattern'

		for(const property of node.properties) {
			expressionToPattern(property.value)
		}
	}
}
