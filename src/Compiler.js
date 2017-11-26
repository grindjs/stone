import './Stone'

const fs = require('fs')
const vm = require('vm')

export class Compiler {

	engine = null
	directives = { }
	tags = { }
	compiled = { }

	constructor(engine) {
		this.engine = engine
		this.disableCache = engine.app.config.get('view.disable_cache', false)
	}

	compile(template, force = null) {
		let compiled = force || this.disableCache ? null : this.compiled[template]

		if(typeof compiled === 'function') {
			return compiled
		}

		// eslint-disable-next-line no-sync
		compiled = this.compileString(fs.readFileSync(template).toString(), true, template)
		this.compiled[template] = compiled

		return compiled
	}

	compileString(contents, shouldEval = true, file = null) {
		if(!file.isNil) {
			this.engine.view.emit('compile:start', file)
		}

		let template = null

		try {
			template = Stone.stringify(Stone.parse(contents, file))
		} catch(err) {
			if(!err._hasTemplate) {
				err._hasTemplate = true
				err.file = file

				if(file) {
					err.message += ` in template ${file}.`
				}
			}

			throw err
		} finally {
			if(!file.isNil) {
				this.engine.view.emit('compile:end', file)
			}
		}

		if(!shouldEval) {
			return template
		}

		const script = new vm.Script(`(${template})`, { filename: file })
		return script.runInNewContext()
	}

}
