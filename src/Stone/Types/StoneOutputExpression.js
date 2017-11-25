export function generate({ safe = true, value }, state) {
	if(safe) {
		state.write('_.escape(')
	}

	this[value.type](value, state)

	if(safe) {
		state.write(')')
	}
}

export function walk({ value }, st, c) {
	c(value, st, 'Expression')
}
