const { TokContext } = require('acorn')

export class DirectiveArgs extends TokContext {

	constructor() {
		super('@args')
	}

}
