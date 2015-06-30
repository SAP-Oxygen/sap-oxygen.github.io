var x = parser.parse("a calls b : cool\nb replies a : nice");

function toX(doc) {
	var commands = [];
	var stack = [];

	function f(statement, stack) {
		function parent() {
			return (stack.length > 0) ? stack[stack.length - 1] : null;
		}

		if (statement.call) {
			if (parent() === null) {
				stack = stack.concat({op: '@found', before: null, where: statement.from, args: [statement.from], inner: []});
			}

			var newLevel = {op: '@message', before: statement.from, where: statement.call, args: [statement.message, statement.call], inner: []}
			parent().inner = parent().inner.concat(newLevel);
			stack = stack.concat(newLevel);
		} else if (statement.create) {
			if (parent() === null) {
				stack = stack.concat({op: '@found', before: null, where: statement.from, args: [statement.from], inner: []});
			}

			var newLevel = {op: '@create', before: statement.from, where: statement.create, args: [statement.message, statement.create], inner: []}
			parent().inner = parent().inner.concat(newLevel);
			stack = stack.concat(newLevel);
		} else if (statement.reply) {
			var done = false;
			for (var i = stack.length - 1; i >= 0 && !done; i++) {
				if (stack[i].where === statement.reply) {
					// we are replying from here
					stack[i].inner = stack[i].inner.concat({op: '@reply', before: stack[i].where, where: stack[i].before, args: [statement.message]});
					stack = stack.slice(0, i - 1);
					done = true;
				}
			}
			if (!done) {
				throw "bad reply!"
			}
		} else if (statement.alt) {
			
			parent().inner = parent().inner.concat({op: '@alt', before: parent().where, where: parent().where, args: altArgs});
		}
	}
}

function toJumly(doc) {
	function toList(doc, i) {
		if (i < doc.length) {
			return {car: doc[i], cdr: toList(doc, i+1)};
		} else {
			return null;
		}
	}

	var consList = toList(doc, 0);

	function getJumly(list, from) {
		if (list) {
			if (list.car.call) {
				return "@found " + JSON.stringify(list.car.from) + ", -> ( @message " + JSON.stringify(list.car.message) + ", " + JSON.stringify(list.car.call) + ", -> (" + getJumly(list.cdr, list.car.from) + ") )"
			} else if (list.car.reply) {
				if (list.car.reply === from) {
					return "@reply " + JSON.stringify(list.car.message)
				} else {
					throw "reply recipient mismatch: expected " + JSON.stringify(from) + " but found " + JSON.stringify(list.car.reply);
				}
			}
		} else {
			return "";
		}
	}

	return getJumly(consList, null);
}

console.log(toJumly(x));
