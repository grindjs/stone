import './Stone/Generator'
import './Stone/Parser'
import './Stone/Scoper'
import './Stone/Walker'

const acorn = require('acorn5-object-spread/inject')(require('acorn'))
const astring = require('astring').generate

export class Stone {

	static _register() {
		if(acorn.plugins.stone) {
			return
		}

		acorn.plugins.stone = (parser, config) => {
			parser._stoneTemplate = config.template || null

			for(const name of Object.getOwnPropertyNames(Parser.prototype)) {
				if(name === 'constructor') {
					continue
				}

				if(typeof parser[name] === 'function') {
					parser.extend(name, next => {
						return function(...args) {
							return Parser.prototype[name].call(this, next, ...args)
						}
					})
				} else {
					parser[name] = Parser.prototype[name]
				}
			}
		}
	}

	static parse(code, pathname = null) {
		this._register()

		return acorn.parse(code, {
			ecmaVersion: 9,
			plugins: {
				objectSpread: true,
				stone: {
					template: pathname
				}
			}
		})
	}

	static stringify(tree) {
		Scoper.scope(tree)
		return astring(tree, { generator: Generator })
	}

	static walk(node, visitors) {
		(function c(node, st, override) {
			if(node.isNil) {
				// This happens during RestElement, unsure why.
				return
			}

			const type = override || node.type
			const found = visitors[type]

			if(found) {
				found(node, st)
			}

			Walker[type](node, st, c)
		})(node)
	}

	static walkVariables(node, callback) {
		if(node.type === 'ArrayPattern') {
			for(const element of node.elements) {
				this.walkVariables(element, callback)
			}
		} else if(node.type === 'ObjectPattern') {
			for(const property of node.properties) {
				if(property.type === 'RestElement') {
					callback(property.argument)
				} else {
					this.walkVariables(property.value, callback)
				}
			}
		} else if(node.type === 'AssignmentPattern') {
			this.walkVariables(node.left, callback)
		} else {
			callback(node)
		}
	}

}
