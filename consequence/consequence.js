var x = parser.parse("a calls b : cool\nb replies a : nice");

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
