import './Types'
import './Support/Scope'

export class Scoper {

	static defaultScope = new Scope(null, [
		'Object',
		'Set',
		'Date',
		'Array',
		'String',
		'global',
		'process',
		'StoneSections'
	])

	static scope(node) {
		return this._scope(node, this.defaultScope)
	}

	static _scope(node, scope, force = false) {
		if(typeof this[node.type] !== 'function') {
			return
		}

		return this[node.type](node, scope, force)
	}

	// Handlers

	static _bodyStatement(node, declarations, scope) {
		node.scope = scope.branch()

		if(!declarations.isNil) {
			this._scope(declarations, node.scope)
		}

		return this._scope(node.body, node.scope)
	}

	static BlockStatement(node, scope) {
		node.scope = scope.branch()

		for(const statement of node.body) {
			this._scope(statement, node.scope)
		}
	}

	static Program = Scoper.BlockStatement

	static FunctionDeclaration(node, scope) {
		node.scope = scope.branch()

		if(Array.isArray(node.params)) {
			for(const param of node.params) {
				this._scope(param, node.scope, true)
			}
		}

		return this._scope(node.body, node.scope)
	}

	static FunctionExpression = Scoper.FunctionDeclaration
	static ArrowFunctionExpression = Scoper.FunctionDeclaration

	static CallExpression(node, scope) {
		if(!Array.isArray(node.arguments)) {
			return
		}

		for(const argument of node.arguments) {
			this._scope(argument, scope)
		}

		return this._scope(node.callee, scope)
	}

	static MemberExpression(node, scope) {
		return this._scope(node.object, scope)
	}

	static TemplateLiteral(node, scope) {
		if(!Array.isArray(node.expressions)) {
			return
		}

		for(const expression of node.expressions) {
			this._scope(expression, scope)
		}
	}

	static ForStatement(node, scope) {
		return this._bodyStatement(node, node.init, scope)
	}

	static ForOfStatement(node, scope) {
		return this._bodyStatement(node, node.left, scope)
	}

	static ForInStatement(node, scope) {
		return this._bodyStatement(node, node.left, scope)
	}

	static WhileStatement(node, scope) {
		return this._bodyStatement(node, null, scope)
	}

	static IfStatement(node, scope) {
		this._scope(node.consequent, scope)

		if(!node.alternate.isNil) {
			this._scope(node.alternate, scope)
		}
	}

	static AssignmentExpression(node, scope) {
		this._scope(node.left, scope)
	}

	static VariableDeclaration(node, scope) {
		for(const declaration of node.declarations) {
			this._scope(declaration, scope)
		}
	}

	static VariableDeclarator(node, scope) {
		this._scope(node.id, scope, true)
	}

	static AssignmentPattern(node, scope, force) {
		this._scope(node.left, scope, force)
	}

	static ArrayPattern(node, scope, force) {
		for(const element of node.elements) {
			this._scope(element, scope, force)
		}
	}

	static ObjectPattern(node, scope, force) {
		for(const property of node.properties) {
			this._scope(property, scope, force)
		}
	}

	static Property(node, scope, force) {
		this._scope(node.value, scope, force)
	}

	static SpreadElement(node, scope, force) {
		this._scope(node.argument, scope, force)
	}

	static RestElement(node, scope, force) {
		this.SpreadElement(node, scope, force)
	}

	static Identifier(node, scope, force) {
		if(!force) {
			return
		}

		scope.add(node.name)
	}

}

for(const key of Object.keys(Types)) {
	const scope = Types[key].scope

	if(typeof scope !== 'function') {
		continue
	}

	Scoper[key] = scope.bind(Scoper)
}
