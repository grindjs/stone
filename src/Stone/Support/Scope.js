export class Scope {

	parent = null
	storage = null

	constructor(parent = null, variables = [ ]) {
		this.parent = parent
		this.storage = new Set(variables)
	}

	add(variable) {
		this.storage.add(variable)
	}

	has(variable) {
		if(this.storage.has(variable)) {
			return true
		} else if(this.parent.isNil) {
			return false
		}

		return this.parent.has(variable)
	}

	branch(variables = [ ]) {
		return new Scope(this, variables)
	}

}
