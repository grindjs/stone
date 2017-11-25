export function generate({ value }, state) {
	state.write('output += `<pre>${_.escape(_.stringify(')
	this[value.type](value, state)
	state.write(', null, 2))}</pre>`;')
}

export function walk({ value }, st, c) {
	c(value, st, 'Expression')
}
