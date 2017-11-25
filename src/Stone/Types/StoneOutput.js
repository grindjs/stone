export function generate({ output }, state) {
	state.write('output += ')
	this[output.type](output, state)
	state.write(';')
}

export function walk({ output }, st, c) {
	c(output, st, 'Expression')
}
