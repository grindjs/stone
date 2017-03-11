import { FS } from 'grind-support'
import { encodeHTML } from 'entities'

const acorn = require('acorn')
acorn.walk = require('acorn/dist/walk').simple

const astring = require('astring')

export class Stone {

	context = {
		escape: value => {
			if(value.isNil) {
				return ''
			}

			return encodeHTML(value.toString())
		}

	}

	async compile(template) {
		let contents = (await FS.readFile(template)).toString().trim()

		const expressions = [ ]
		let match = null

		while((match = contents.match(/@([a-z0-9_]+)(\s*\()?/))) {
			if(match.index > 0) {
				expressions.push({
					type: 'string',
					contents: contents.substring(0, match.index)
				})

				contents = contents.substring(match.index)
			}

			let args = null

			if(match[2]) {
				let openCount = -1
				let index = 0
				let startIndex = 0
				let lastIndex = 0

				while(openCount !== 0 && (index = indexOfParenthesis(contents, index)) >= 0) {
					const parenthesis = contents.substring(index, index + 1)

					if(parenthesis === ')') {
						openCount--
					} else if(openCount === -1) {
						startIndex = index
						openCount = 1
					} else {
						openCount++
					}

					lastIndex = index
					index++
				}

				args = contents.substring(startIndex + 1, lastIndex)
				contents = contents.substring(lastIndex + 1)
			} else {
				contents = contents.substring(match[0].length)
			}

			const method = `compile${match[1][0].toUpperCase()}${match[1].substring(1)}`
			const result = this[method](args)

			if(!result.isNil) {
				expressions.push({
					type: 'code',
					contents: result
				})
			}
		}

		contents = contents.trim()

		if(contents.length > 0) {
			expressions.push({
				type: 'string',
				contents: contents
			})
		}

		let code = ''

		for(const { type, contents } of expressions) {
			if(type === 'code') {
				code += `${contents}\n`
			} else {
				code += `output += \`${sanetizeString(contents)}\`;\n`
			}
		}

		code = `template = function(_) {\nlet output = '';\n${this._contextualize(code)}\nreturn output;\n}`

		return eval(code)
	}

	render(template, context) {
		return this.compile(template).then(template => template({ ...this.context, ...context }))
	}

	_contextualize(code) {
		const tree = acorn.parse(code)
		const scopes = [
			{
				locals: new Set,
				end: Number.MAX_VALUE
			}
		]

		let scope = scopes[0]

		const checkScope = fromNode => {
			while(fromNode.start >= scope.end && scopes.length > 1) {
				scopes.pop()
				scope = scopes[scopes.length - 1]
			}
		}

		acorn.walk(tree, {
			Statement: node => {
				checkScope(node)
			},

			BlockStatement: node => {
				checkScope(node)

				scope = {
					locals: new Set(scope.locals),
					node: node,
					end: node.end
				}

				scopes.push(scope)
			},

			VariableDeclarator: node => {
				checkScope(node)
				scope.locals.add(node.id.name)
			},

			Identifier: node => {
				checkScope(node)

				if(scope.locals.has(node.name)) {
					return
				}

				node.name = `_.${node.name}`
			}
		})

		return astring(tree)
	}

	compileIf(args) {
		return `if(${args}){`
	}

	compileElseif(args) {
		return `} else if(${args}){`
	}

	compileEndif() {
		return '}'
	}

}

/**
 * [indexOfParenthesis description]
 * @param  {string} string    [description]
 * @param  {number} fromIndex [description]
 * @return {number}           [description]
 */
function indexOfParenthesis(string, fromIndex) {
	const open = string.indexOf('(', fromIndex)
	const close = string.indexOf(')', fromIndex)

	if(open === -1) {
		return close
	} else if(close === -1)  {
		return open
	}

	return Math.min(open, close)
}

function sanetizeString(string) {
	string = string.replace(/\{\{\s*(.+?)\s*\}\}/g, '${escape($1)}')
	string = string.replace(/\{!!\s*(.+?)\s*!!\}/g, '${$1}')
	string = string.replace(/[\n]/g, '\\n')
	string = string.replace(/[\r]/g, '\\r')
	string = string.replace(/[\t]/g, '\\t')

	return string
}
