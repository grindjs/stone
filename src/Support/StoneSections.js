export class StoneSections {

	_sections = { }

	push(name, func) {
		(this._sections[name] = this._sections[name] || [ ]).push(func)
	}

	render(name, defaultValue) {
		if(!this.has(name)) {
			return defaultValue || ''
		}

		return (this._sections[name].shift())()
	}

	has(name) {
		return (this._sections[name] || [ ]).length > 0
	}

}
