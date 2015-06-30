/* description: Parses end executes mathematical expressions. */

/* lexical grammar */
%lex
%%

"\""("\\".|[^"])*"\""	return 'QUOTED'
"participant"		return 'PARTICIPANT'
"as"				return 'AS'
"calls"				return 'CALLS'
"replies"			return 'REPLIES'
"creates"			return 'CREATES'
"alt"				return 'ALT'
"case"				return 'CASE'
"loop"				return 'LOOP'
"ref"				return 'REF'
"box"				return 'BOX'
"note"				return 'NOTE'
":"[^{\r\n]*		return 'MESSAGE'
"{"					return 'LBRACE'
"}"					return 'RBRACE'
\s+					/* skip whitespace */
\w+					return 'UNQUOTED'
<<EOF>>				return 'EOF'
.					return 'INVALID'

/lex

/* operator associations and precedence */

%start start

%% /* language grammar */

start
	: document EOF
		{ return $1 }
	;

document
	: /* empty */
		{ $$ = [] }
	| document statement
		{ $$ = $1.concat([$2]) }
	;

statement
	: participant_decl
	| call
	| reply
	| create
	| alt
	| loop
	| ref
	| box
	| note
	;

participant_decl
	: PARTICIPANT participant opt_alias
		{ $$ = {participant: $2, alias: $3} }
	;

opt_alias
	: /* empty */
	| AS participant
		{ $$ = $2 }
	;

call
	: participant CALLS participant opt_message
		{ $$ = {from: $1, call: $3, message: $4} }
	;

opt_message
	: /* empty */
	| message
	;

message
	: MESSAGE
		{ $$ = yytext.replace(/^:\s+/, '') }
	;

reply
	: participant REPLIES participant opt_message
		{ $$ = {from: $1, reply: $3, message: $4} }
	;

create
	: participant CREATES participant opt_message
		{ $$ = {from: $1, create: $3, message: $4} }
	;

alt
	: ALT LBRACE alt_body RBRACE
		{ $$ = {alt: $3} }
	;

alt_body
	: /* empty */
		{ $$ = [] }
	| alt_body case
		{ $$ = $1.concat([$2]) }
	;

case
	: CASE label LBRACE document RBRACE
		{ $$ = {altCase: $4, message: $2} }
	;

loop
	: LOOP label LBRACE document RBRACE
		{ $$ = {loop: $4, message: $2} }
	;

ref
	: participant REF message
		{ $$ = {from: $1, ref: $3} }
	;

box
	: BOX label LBRACE document RBRACE
		{ $$ = {box: $4, message: $2} }
	;

note
	: partcipant NOTE message
		{ $$ = {from: $1, note: $3} }
	;

participant
	: label
	;

label
	: QUOTED
		{ $$ = JSON.parse(yytext) }
	| UNQUOTED
		{ $$ = yytext }
	;
