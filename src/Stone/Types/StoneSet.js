import '../../Stone'
import { make } from '../Support/MakeNode'

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
