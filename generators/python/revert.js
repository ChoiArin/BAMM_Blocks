var input, inputLen, nc;
var runtimeParamName = "__pythonRuntime";

function code2XML(inpt) {
  var AST = code2AST(String(inpt));
  var code = codeAnalyze(AST);

  return '<xml>' + code + '</xml>';
}

function isPythonCode(inpt) {
  return code2AST(inpt) !== null;
}

//#region AST analyze
function codeAnalyze(AST) {
  var code = {head: '', tail: []};
  var varList = {};

  code.tail.push('');
  AST.body.forEach(function(elem) {
    codeBlockAnalyze(varList, code, elem);
  });

  return code.head + code.tail[code.tail.length - 1];
}

function codeBlockAnalyze(varList, code, elem) {
  if(elem.valueName) {
    code.head += '<value name="';
    code.head += elem.valueName;
    code.head += '">';
  }

  switch (elem.type) {
    case 'AssignmentExpression':
      if(elem.right.type === 'NewExpression') { //List
        code.head += '<block type="data_clearlist">';
        codeBlockAnalyze(varList, code, elem.left);
        for(var i = 0; i < elem.right.arguments.length; i++) {
          code.head += '<block type="data_addtolist">';
          elem.arguments[i].valueName = 'ITEM';
          codeBlockAnalyze(varList, code, elem.right.arguments[i]);
          codeBlockAnalyze(varList, code, elem.left);
          code.head += '</block>';
        }
      } else { //Variable
        code.head += '<block type="data_setvariableto">'
        elem.right.valueName = 'VALUE';
        codeBlockAnalyze(varList, code, elem.left);
        codeBlockAnalyze(varList, code, elem.right);
      }
      code.head += '<next>';
      code.tail[code.tail.length - 1] = '</next></block>' + code.tail[code.tail.length - 1];
      break;

    case 'BinaryExpression':
      var type = false;
      code.head += '<block type="'
      if(elem.operator === '+') {
        code.head += 'operator_add';
      } else if(elem.operator === '-') {
        code.head += 'operator_subtract';
      } else if(elem.operator === '*') {
        code.head += 'operator_multiply';
      } else if(elem.operator === '/') {
        code.head += 'operator_divide';
      } else if(elem.operator === '%') {
        code.head += 'operator_mod';
      } else if(elem.operator === '==') {
        code.head += 'operator_equals';
        logical = true;
      } else if(elem.operator === '>') {
        code.head += 'operator_gt';
        logical = true;
      } else if(elem.operator === '<') {
        code.head += 'operator_lt';
        logical = true;
      }
      code.head += '">';
      if(logical) {
        elem.left.valueName = 'OPERAND1';
        elem.right.valueName = 'OPERAND2';
      } else {
        elem.left.valueName = 'NUM1';
        elem.right.valueName = 'NUM2';
      }
      codeBlockAnalyze(varList, code, elem.left);
      codeBlockAnalyze(varList, code, elem.right);
      code.head += '</block>';
      break;

    case 'BlockStatement':
      if(elem.body.length == 2 //while block check..
        && elem.body[0].type === 'VariableDeclaration'
        && elem.body[1].type === 'IfStatement'
        && elem.body[1].consequent.type === 'BlockStatement'
        && elem.body[1].consequent.body[0].type === 'ForStatement') {
        code.head += '<block type="control_repeat">';
        code.head += '<value name="TIMES"><shadow type="math_whole_number"><field name="NUM">';
        var repeatNum = 0;
        if(elem.body[0].declarations[0].init.arguments.length == 1)
          repeatNum = elem.body[0].declarations[0].init.arguments[0].value;
        else
          repeatNum = elem.body[0].declarations[0].init.arguments[1].value;
        code.head += repeatNum;
        code.head += '</field></shadow></value>';
        code.head += '<statement name="SUBSTACK">';
        elem.body[1].consequent.body[0].body.body.splice(0, 1);
        elem.body[1].consequent.body[0].body.body.splice(elem.body[1].consequent.body[0].body.body.length, 1);
        codeBlockAnalyze(varList, code, elem.body[1].consequent.body[0].body);
        code.head += '</statement>';
        code.head += '<next>';
        code.tail[code.tail.length - 1] = '</next></block>' + code.tail[code.tail.length - 1];
      }
      else {
        code.tail.push('');
        elem.body.forEach(function(e) {
          codeBlockAnalyze(varList, code, e);
        });
        code.head += code.tail[code.tail.length - 1];
        code.tail.pop();
      }
      break;

    case 'BreakStatement':
      code.head += '<block type="control_stop"><mutation hasnext="false"></mutation><field name="STOP_OPTION">this script</field></block>';
      break;

    case 'CallExpression':
      if(elem.callee.property.name === "_pySlice"
        || elem.callee.property.name === "find"
        || elem.callee.property.name === "rfind")
        revertFunc[elem.callee.property.name](varList, code, elem.callee.object, elem.arguments);
      else
        revertFunc[elem.callee.property.name](varList, code, elem.arguments);
      break;

    case 'EmptyStatement':
      //Do nothing ^오^
      break;

    case 'ExpressionStatement':
      codeBlockAnalyze(varList, code, elem.expression);
      break;

    case 'ForInStatement':
      break;
      
    case 'ForStatement':
      break;

    case 'FunctionDeclaration':
      varList[elem.id.name] = 'func';
      code.head += '<block type="func">';
      code.head += '<field name="func" variabletype="func">';
      codeBlockAnalyze(varList, code, elem.id);
      code.head += '</field>';
      code.head += '<statement name="SUBSTACK">';
      codeBlockAnalyze(varList, code, elem.body);
      code.head += '</statement></block>';
      //code.tail[code.tail.length - 1] = '</statement></block>' + code.tail[code.tail.length - 1];
      break;

    case 'Identifier':
      code.head += '<field name="';
      if(varList[elem.name] == 'var')
        code.head += 'VARIABLE';
      else if(varList[elem.name] == 'list')
        code.head += 'LIST';
      else if(varList[elem.name] == 'func')
        code.head += 'func';
      code.head += '">';
      code.head += elem.name;
      code.head += '</field>';
      break;

    case 'IfStatement':
      if(elem.alternate)
        code.head += '<block type="control_if_else">';
      else
        code.head += '<block type="control_if">';

      if(elem.test.type !== "Literal" || elem.test.value !== false) {
        code.head += '<value name="CONDITION">';
        codeBlockAnalyze(varList, code, elem.test);
        code.head += '</value>';
      }

      code.head += '<statement name="SUBSTACK">';
      codeBlockAnalyze(varList, code, elem.consequent);
      code.head += '</statement>';

      if(elem.alternate) {
        code.head += '<statement name="SUBSTACK2">';
        codeBlockAnalyze(varList, code, elem.alternate);
        code.head += '</statement>';
      }

      code.head += '<next>';
      code.tail[code.tail.length - 1] = '</next></block>' + code.tail[code.tail.length - 1];
      break;

    case 'Literal':
      code.head += '<shadow type="';
      code.head += elem.shadowType ? elem.shadowType : 'text';
      code.head += '"><field name="';
      code.head += elem.fieldName ? elem.fieldName : 'TEXT';
      code.head += '">';
      code.head += elem.value === null ? '' : elem.value;
      code.head += '</field></shadow>';
      break;

    case 'LogicalExpression':
      if(elem.operator === '&&') {
        code.head += '<block type="operator_and">';
        elem.left.valueName = 'OPERAND1';
        elem.right.valueName = 'OPERAND1';
        codeBlockAnalyze(varList, code, elem.left);
        codeBlockAnalyze(varList, code, elem.right);
      } else if(elem.operator === '||') {
        code.head += '<block type="operator_or">';
        elem.left.valueName = 'OPERAND1';
        elem.right.valueName = 'OPERAND1';
        codeBlockAnalyze(varList, code, elem.left);
        codeBlockAnalyze(varList, code, elem.right);
      } else if(elem.operator === '!') {
        code.head += '<block type="operator_not">';
        elem.argument.valueName = 'OPERAND';
        codeBlockAnalyze(varList, code, elem.argument);
      }
      code.head += '</block>';
      break;

    case 'MemberExpression':
      if(elem.object.type === "Literal") {
        if(elem.property.callee && elem.property.callee.object.type === "MemberExpression") {
          code.head += '<block type="texts_charAt">';
          elem.property.arguments[1].valueName = 'WHERE';
          elem.property.arguments[1].shadowType = 'math_number';
          elem.property.arguments[1].fieldName = 'NUM';
          codeBlockAnalyze(varList, code, elem.property.arguments[1]);
          elem.property.arguments[0].valueName = 'VALUE';
          elem.property.arguments[0].shadowType = 'text';
          elem.property.arguments[0].fieldName = 'TEXT';
          codeBlockAnalyze(varList, code, elem.property.arguments[0]);
          code.head += '</block>';
        }
      }
      break;

    case 'NewExpression':
      // list. no block assign
      break;

    case 'Program':
      codeBlockAnalyze(varList, code, elem.body);
      break;

    case 'UnaryExpression':
      if(elem.argument.type === "MemberExpression" && elem.argument.property.name === "length") {
        code.head += '<block type="texts_isEmpty">';
        elem.argument.object.valueName = 'VALUE';
        elem.argument.object.shadowType = 'text';
        elem.argument.object.fieldName = 'TEXT';
        codeBlockAnalyze(varList, code, elem.argument.object);
        code.head += '</block>';
      } else {
        code.head += '<block type="operator_not">';
        codeBlockAnalyze(varList, code, elem.argument);
        code.head += '</block>';
      }
      break;

    case 'UpdateExpression':
      // Yet
      break;

    case 'VariableDeclaration':
      codeBlockAnalyze(varList, code, elem.declarations[0]);
      break;

    case 'VariableDeclarator':
      if(elem.init.type === 'NewExpression') { //List
        varList[elem.id] = 'list';
        code.head += '<block type="data_clearlist">';
        codeBlockAnalyze(varList, code, elem.id);
      } else if(elem.init.type == 'Identifier') { //Variable
        varList[elem.id] = 'var';
        code.head += '<block type="data_setvariableto">';
        elem.init.valueName = 'VALUE';
        codeBlockAnalyze(varList, code, elem.id);
        codeBlockAnalyze(varList, code, elem.init);
      }
      code.head += '<next>';
      code.tail[code.tail.length - 1] = '</next></block>' + code.tail[code.tail.length - 1];
      break;

    case 'WhileStatement':
      code.head += '<block type="control_repeat_until">';
      if(elem.test.type !== "Literal" || elem.test.value !== false) {
        code.head += '<value name="CONDITION">';
        codeBlockAnalyze(varList, code, elem.test);
        code.head += '</value>';
      }

      code.head += '<statement name="SUBSTACK">';
      codeBlockAnalyze(varList, code, elem.body);
      code.head += '</statement>';

      code.head += '<next>';
      code.tail[code.tail.length - 1] = '</next></block>' + code.tail[code.tail.length - 1];
      break;
  }

  if(elem.valueName) {
    code.head += '</value>';
  }
}

revertFunc = {};

revertFunc['_pySlice'] = function(varList, code, object, args) {
  if(args.length === 3) {
    if(args[0].value === null && args[1].value === null && args[2].operator === "-" && args[2].argument.value === 1) {
      code.head += '<block type="texts_reverse">';
      object.valueName = 'TEXT';
      object.shadowType = 'text';
      object.fieldName = 'TEXT';
      codeBlockAnalyze(varList, code, object);
      code.head += '</block>';
    } else {
      code.head += '<block type="texts_getSubstring">';
      if(args[0].value < 0)
        code.head += '<field name="WHERE1">FROM_END</field>';
      else
        code.head += '<field name="WHERE1">FROM_START</field>';
      code.head += '<field name="WHERE2">FROM_START</field>';
      object.valueName = 'STRING';
      object.shadowType = 'text';
      object.fieldName = 'TEXT';
      codeBlockAnalyze(varList, code, object);
      if(args[0].value === null) {
        args[0].value = 0;
        args[0].raw = "0";
      }
      args[0].valueName = 'AT1';
      args[0].shadowType = 'math_number';
      args[0].fieldName = 'NUM';
      codeBlockAnalyze(varList, code, args[0]);
      if(args[1].value === null) {
        args[1].value = 0;
        args[1].raw = "0";
      }
      args[1].valueName = 'AT2';
      args[1].shadowType = 'math_number';
      args[1].fieldName = 'NUM';
      codeBlockAnalyze(varList, code, args[1]);
      code.head += '</block>';
    }
  }
};

revertFunc['find'] = function(varList, code, object, args) {
  code.head += '<block type="texts_indexOf">';
  code.head += '<field name="END">FIRST</field>';
  args[0].valueName = 'FIND';
  args[0].shadowType = 'text';
  args[0].fieldName = 'TEXT';
  codeBlockAnalyze(varList, code, args[0]);
  object.valueName = 'VALUE';
  object.shadowType = 'text';
  object.fieldName = 'TEXT';
  codeBlockAnalyze(varList, code, object);
  code.head += '</block>';
};

revertFunc['rfind'] = function(varList, code, object, args) {
  code.head += '<block type="texts_indexOf">';
  code.head += '<field name="END">LAST</field>';
  args[0].valueName = 'FIND';
  args[0].shadowType = 'text';
  args[0].fieldName = 'TEXT';
  codeBlockAnalyze(varList, code, args[0]);
  object.valueName = 'VALUE';
  object.shadowType = 'text';
  object.fieldName = 'TEXT';
  codeBlockAnalyze(varList, code, object);
  code.head += '</block>';
};

revertFunc['print'] = function(varList, code, args) {
  if(args.length > 2 && args[1].name === "endl" && args[2].value === "")
    code.head += '<block type="texts_print">';
  else
    code.head += '<block type="texts_println">';
  args[0].valueName = 'TEXT';
  codeBlockAnalyze(varList, code, args[0]);
  code.head += '<next>';
  code.tail[code.tail.length - 1] = '</next></block>' + code.tail[code.tail.length - 1];
};

revertFunc['str'] = function(varList, code, args) {
  code.head += '<block type="texts_text">';
  args[0].valueName = 'VAR';
  args[0].shadowType = 'math_number';
  args[0].fieldName = 'NUM';
  codeBlockAnalyze(varList, code, args[0]);
  code.head += '</block>';
};

revertFunc['add'] = function(varList, code, args) {
  code.head += '<block type="operator_add">';
  args[0].valueName = 'NUM1';
  codeBlockAnalyze(varList, code, args[0]);
  args[1].valueName = 'NUM2';
  codeBlockAnalyze(varList, code, args[1]);
  code.head += '</block>';
};

revertFunc['randint'] = function(varList, code, args) {
  code.head += '<block type="operator_random">';
  args[0].valueName = 'FROM';
  args[0].shadowType = 'math_number';
  args[0].fieldName = 'NUM';
  codeBlockAnalyze(varList, code, args[0]);
  args[1].valueName = 'TO';
  args[1].shadowType = 'math_number';
  args[1].fieldName = 'NUM';
  codeBlockAnalyze(varList, code, args[1]);
  code.head += '</block>';
};

revertFunc['round'] = function(varList, code, args) {
  code.head += '<block type="operator_round">';
  args[0].valueName = 'NUM';
  args[0].shadowType = 'math_number';
  args[0].fieldName = 'NUM';
  codeBlockAnalyze(varList, code, args[0]);
  code.head += '</block>';
};

function mathop(operator, varList, code, args) {
  code.head += '<block type="operator_mathop">';
  code.head += '<field name="OPERATOR">' + operator + '</field>';
  args[0].valueName = 'NUM';
  args[0].shadowType = 'math_number';
  args[0].fieldName = 'NUM';
  codeBlockAnalyze(varList, code, args[0]);
  code.head += '</block>';
}

revertFunc['fabs'] = function(varList, code, args) {
  mathop('abs', varList, code, args);
};

revertFunc['floor'] = function(varList, code, args) {
  mathop('floor', varList, code, args);
};

revertFunc['ceil'] = function(varList, code, args) {
  mathop('ceiling', varList, code, args);
};

revertFunc['sqrt'] = function(varList, code, args) {
  mathop('sqrt', varList, code, args);
};

revertFunc['sin'] = function(varList, code, args) {
  mathop('sin', varList, code, args);
};

revertFunc['cos'] = function(varList, code, args) {
  mathop('cos', varList, code, args);
};

revertFunc['tan'] = function(varList, code, args) {
  mathop('tan', varList, code, args);
};

revertFunc['asin'] = function(varList, code, args) {
  mathop('asin', varList, code, args);
};

revertFunc['acos'] = function(varList, code, args) {
  mathop('acos', varList, code, args);
};

revertFunc['atan'] = function(varList, code, args) {
  mathop('atan', varList, code, args);
};

revertFunc['log'] = function(varList, code, args) {
  mathop('ln', varList, code, args);
};

revertFunc['log10'] = function(varList, code, args) {
  mathop('log', varList, code, args);
};

revertFunc['exp'] = function(varList, code, args) {
  mathop('e ^', varList, code, args);
};

revertFunc['pow'] = function(varList, code, args) {
  code.head += '<block type="operator_pow">';
  args[0].valueName = 'NUM1';
  args[0].shadowType = 'math_number';
  args[0].fieldName = 'NUM';
  codeBlockAnalyze(varList, code, args[0]);
  args[1].valueName = 'NUM2';
  args[1].shadowType = 'math_number';
  args[1].fieldName = 'NUM';
  codeBlockAnalyze(varList, code, args[1]);
  code.head += '</block>';
};
//#endregion

//#region adapted filbert.js
function code2AST(inpt) {
  input = String(inpt); inputLen = input.length;
  initTokenState();
  nc = getNodeCreator(startNode, startNodeFrom, finishNode, unpackTuple);
  return parseTopLevel();
}

var tokPos;
var tokStart, tokEnd;
var tokType, tokVal;
var lastStart, lastEnd;

var tokRegexpAllowed;
var inFunction, strict, bracketNesting;

function raise(pos, message) {
  var err = new SyntaxError(message);
  err.pos = pos; err.loc = 0; err.raisedAt = tokPos;
  throw err;
}

var newAstIdCount = 0;

var indentHist = {
  indent: [],
  dedentCount: 0,

  init: function () { this.indent = []; this.dedentCount = 0; },
  count: function () { return this.indent.length; },
  len: function (i) { 
    if (typeof i === 'undefined' || i >= this.indent.length) i = this.indent.length - 1;
    return this.indent[i].length; 
  },
  isIndent: function(s) {
    return this.indent.length === 0 || s.length > this.len();
  },
  isDedent: function(s) {
    return this.indent.length > 0 && s.length < this.len();
  },
  addIndent: function (s) { this.indent.push(s); },
  addDedent: function (s) {
    this.dedentCount = 0;
    for (var i = this.indent.length - 1; i >= 0 && s.length < this.indent[i].length; --i)
      ++this.dedentCount;
  },
  updateDedent: function () { this.dedentCount = this.count(); },
  pop: function () {
    --this.dedentCount;
    this.indent.pop();
  },
  undoIndent: function () { this.pop(); }
};

var scope = {
  namespaces: [],
  init: function () { this.namespaces = [{ type: 'g', map: {} }]; },
  current: function(offset) { 
    offset = offset || 0;
    return this.namespaces[this.namespaces.length - offset - 1];
  },
  startClass: function (id) {
    this.current().map[id] = 'c';
    this.namespaces.push({ type: 'c', map: {}, className: id });
  },
  startFn: function (id) {
    this.current().map[id] = 'f';
    this.namespaces.push({ type: 'f', map: {}, fnName: id });
  },
  end: function () { this.namespaces.pop(); },
  addVar: function (id) { this.current().map[id] = 'v'; },
  exists: function (id) { return this.current().map.hasOwnProperty(id); },
  isClass: function () { return this.current().type === 'c'; },
  isUserFunction: function(name) {
    for (var i = this.namespaces.length - 1; i >= 0; i--)
      for (var key in this.namespaces[i].map)
        if (key === name && this.namespaces[i].map[key] === 'f')
          return true;
    return false;
  },
  isParentClass: function() { return this.current(1).type === 'c'; },
  isNewObj: function (id) {
    for (var i = this.namespaces.length - 1; i >= 0; i--)
      if (this.namespaces[i].map[id] === 'c') return true;
      else if (this.namespaces[i].map[id] === 'f') break;
    return false;
  },
  getParentClassName: function () { return this.current(1).className; },
  getThisReplace: function () { return this.current().thisReplace; },
  setThisReplace: function (s) { this.current().thisReplace = s; }
};

var _num = {type: "num"}, _regexp = {type: "regexp"}, _string = {type: "string"};
var _name = {type: "name"}, _eof = {type: "eof"};
var _newline = {type: "newline"}, _indent = {type: "indent"}, _dedent = {type: "dedent"};

var _dict = { keyword: "dict" };
var _as = { keyword: "as" }, _assert = { keyword: "assert" }, _break = { keyword: "break" };
var _class = { keyword: "class" }, _continue = { keyword: "continue" };
var _def = { keyword: "def" }, _del = { keyword: "del" };
var _elif = { keyword: "elif", beforeExpr: true }, _else = { keyword: "else", beforeExpr: true };
var _except = { keyword: "except", beforeExpr: true }, _finally = {keyword: "finally"};
var _for = { keyword: "for" }, _from = { keyword: "from" }, _global = { keyword: "global" };
var _if = { keyword: "if" }, _import = { keyword: "import" };
var _lambda = {keyword: "lambda"}, _nonlocal = {keyword: "nonlocal"};
var _pass = { keyword: "pass" }, _raise = {keyword: "raise"};
var _return = { keyword: "return", beforeExpr: true }, _try = { keyword: "try" };
var _while = {keyword: "while"}, _with = {keyword: "with"}, _yield = {keyword: "yield"};

var _none = {keyword: "None", atomValue: null}, _true = {keyword: "True", atomValue: true};
var _false = {keyword: "False", atomValue: false};

var _or = { keyword: "or", prec: 1, beforeExpr: true, rep: "||" };
var _and = { keyword: "and", prec: 2, beforeExpr: true, rep: "&&" };
var _not = { keyword: "not", prec: 3, prefix: true, beforeExpr: true, rep: "!" };
var _in = { keyword: "in", prec: 4, beforeExpr: true };
var _is = { keyword: "is", prec: 4, beforeExpr: true };

var keywordTypes = {
  "dict": _dict,
  "False": _false, "None": _none, "True": _true, "and": _and, "as": _as, 
  "break": _break, "class": _class, "continue": _continue, "def": _def, "del": _del,
  "elif": _elif, "else": _else, "except": _except, "finally": _finally, "for": _for,
  "from": _from, "global": _global, "if": _if, "import": _import, "in": _in, "is": _is, 
  "lambda": _lambda, "nonlocal": _nonlocal, "not": _not, "or": _or, 
  "pass": _pass, "raise": _raise, "return": _return, "try": _try, "while": _while, 
  "with": _with, "yield": _yield
};

var _bracketL = {type: "[", beforeExpr: true}, _bracketR = {type: "]"}, _braceL = {type: "{", beforeExpr: true};
var _braceR = {type: "}"}, _parenL = {type: "(", beforeExpr: true}, _parenR = {type: ")"};
var _comma = {type: ",", beforeExpr: true}, _semi = {type: ";", beforeExpr: true};
var _colon = { type: ":", beforeExpr: true }, _dot = { type: "." }, _question = { type: "?", beforeExpr: true };

var _slash = { prec: 10, beforeExpr: true }, _eq = { isAssign: true, beforeExpr: true };
var _assign = {isAssign: true, beforeExpr: true};
var _equality = { prec: 4, beforeExpr: true };
var _relational = {prec: 4, beforeExpr: true };
var _bitwiseOR = { prec: 5, beforeExpr: true };
var _bitwiseXOR = { prec: 6, beforeExpr: true };
var _bitwiseAND = { prec: 7, beforeExpr: true };
var _bitShift = { prec: 8, beforeExpr: true };
var _plusMin = { prec: 9, beforeExpr: true };
var _multiplyModulo = { prec: 10, beforeExpr: true };
var _floorDiv = { prec: 10, beforeExpr: true };
var _posNegNot = { prec: 11, prefix: true, beforeExpr: true };
var _bitwiseNOT = { prec: 11, prefix: true, beforeExpr: true };
var _exponentiation = { prec: 12, beforeExpr: true };

tokTypes = {bracketL: _bracketL, bracketR: _bracketR, braceL: _braceL, braceR: _braceR,
                    parenL: _parenL, parenR: _parenR, comma: _comma, semi: _semi, colon: _colon,
                    dot: _dot, question: _question, slash: _slash, eq: _eq, name: _name, eof: _eof,
                    num: _num, regexp: _regexp, string: _string,
                    newline: _newline, indent: _indent, dedent: _dedent,
                    exponentiation: _exponentiation, floorDiv: _floorDiv, plusMin: _plusMin,
                    posNegNot: _posNegNot, multiplyModulo: _multiplyModulo
};
for (var kw in keywordTypes) tokTypes["_" + kw] = keywordTypes[kw];

function makePredicate(words) {
  words = words.split(" ");
  var f = "", cats = [];
  out: for (var i = 0; i < words.length; ++i) {
    for (var j = 0; j < cats.length; ++j)
      if (cats[j][0].length == words[i].length) {
        cats[j].push(words[i]);
        continue out;
      }
    cats.push([words[i]]);
  }
  function compareTo(arr) {
    if (arr.length == 1) return f += "return str === " + JSON.stringify(arr[0]) + ";";
    f += "switch(str){";
    for (var i = 0; i < arr.length; ++i) f += "case " + JSON.stringify(arr[i]) + ":";
    f += "return true}return false;";
  }

  if (cats.length > 3) {
    cats.sort(function(a, b) {return b.length - a.length;});
    f += "switch(str.length){";
    for (var i = 0; i < cats.length; ++i) {
      var cat = cats[i];
      f += "case " + cat[0].length + ":";
      compareTo(cat);
    }
    f += "}";
  } else {
    compareTo(words);
  }
  return new Function("str", f);
}

var isStrictBadIdWord = makePredicate("eval arguments");

var isKeyword = makePredicate("dict False None True and as assert break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield");

var nonASCIIwhitespace = /[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/;
var nonASCIIidentifierStartChars = "\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc";
var nonASCIIidentifierChars = "\u0300-\u036f\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u0620-\u0649\u0672-\u06d3\u06e7-\u06e8\u06fb-\u06fc\u0730-\u074a\u0800-\u0814\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0840-\u0857\u08e4-\u08fe\u0900-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962-\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09d7\u09df-\u09e0\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5f-\u0b60\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2-\u0ce3\u0ce6-\u0cef\u0d02\u0d03\u0d46-\u0d48\u0d57\u0d62-\u0d63\u0d66-\u0d6f\u0d82\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e34-\u0e3a\u0e40-\u0e45\u0e50-\u0e59\u0eb4-\u0eb9\u0ec8-\u0ecd\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f41-\u0f47\u0f71-\u0f84\u0f86-\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1029\u1040-\u1049\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u170e-\u1710\u1720-\u1730\u1740-\u1750\u1772\u1773\u1780-\u17b2\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1920-\u192b\u1930-\u193b\u1951-\u196d\u19b0-\u19c0\u19c8-\u19c9\u19d0-\u19d9\u1a00-\u1a15\u1a20-\u1a53\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1b46-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1bb0-\u1bb9\u1be6-\u1bf3\u1c00-\u1c22\u1c40-\u1c49\u1c5b-\u1c7d\u1cd0-\u1cd2\u1d00-\u1dbe\u1e01-\u1f15\u200c\u200d\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2d81-\u2d96\u2de0-\u2dff\u3021-\u3028\u3099\u309a\ua640-\ua66d\ua674-\ua67d\ua69f\ua6f0-\ua6f1\ua7f8-\ua800\ua806\ua80b\ua823-\ua827\ua880-\ua881\ua8b4-\ua8c4\ua8d0-\ua8d9\ua8f3-\ua8f7\ua900-\ua909\ua926-\ua92d\ua930-\ua945\ua980-\ua983\ua9b3-\ua9c0\uaa00-\uaa27\uaa40-\uaa41\uaa4c-\uaa4d\uaa50-\uaa59\uaa7b\uaae0-\uaae9\uaaf2-\uaaf3\uabc0-\uabe1\uabec\uabed\uabf0-\uabf9\ufb20-\ufb28\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f";
var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");

var newline = /[\n\r\u2028\u2029]/;

var lineBreak = /\r\n|[\n\r\u2028\u2029]/g;

var isIdentifierStart = function(code) {
  if (code < 65) return code === 36;
  if (code < 91) return true;
  if (code < 97) return code === 95;
  if (code < 123)return true;
  return code >= 0xaa && nonASCIIidentifierStart.test(String.fromCharCode(code));
};

var isIdentifierChar = function(code) {
  if (code < 48) return code === 36;
  if (code < 58) return true;
  if (code < 65) return false;
  if (code < 91) return true;
  if (code < 97) return code === 95;
  if (code < 123)return true;
  return code >= 0xaa && nonASCIIidentifier.test(String.fromCharCode(code));
};

function initTokenState() {
  tokPos = 0;
  tokRegexpAllowed = true;
  indentHist.init();
  newAstIdCount = 0;
  scope.init();
}

function finishToken(type, val) {
  tokEnd = tokPos;
  tokType = type;
  if (type === _parenL || type === _braceL || type === _bracketL) ++bracketNesting;
  if (type === _parenR || type === _braceR || type === _bracketR) --bracketNesting;
  if (type !== _newline) skipSpace();
  tokVal = val;
  tokRegexpAllowed = type.beforeExpr;
}

function skipLine() {
  var ch = input.charCodeAt(++tokPos);
  while (tokPos < inputLen && !isNewline(ch)) {
    ++tokPos;
    ch = input.charCodeAt(tokPos);
  }
}

function skipLineComment() {
  var start = tokPos;
  skipLine();
}

function skipSpace() {
  while (tokPos < inputLen) {
    var ch = input.charCodeAt(tokPos);
    if (ch === 35) skipLineComment();
    else if (ch === 92) {
      ++tokPos;
      if (isNewline(input.charCodeAt(tokPos))) {
        if (input.charCodeAt(tokPos) === 13 && input.charCodeAt(tokPos+1) === 10) ++tokPos;
        ++tokPos;
      } else {
        raise(tokPos, "Unexpected character after line continuation character");
      }
    }
    else if (isSpace(ch)) ++tokPos;
    else if (bracketNesting > 0 && isNewline(ch)) {
      if (ch === 13 && input.charCodeAt(tokPos+1) === 10) ++tokPos;
      ++tokPos;
    }
    else break;
  }
}

function isSpace(ch) {
  if (ch === 32 || // ' '
    ch === 9 || ch === 11 || ch === 12 ||
    ch === 160 || // '\xa0'
    ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
    return true;
  }
  return false;
}

function isNewline(ch) {
  if (ch === 10 || ch === 13 ||
    ch === 8232 || ch === 8233) {
    return true;
  }
  return false;
}

function readToken_dot() {
  var next = input.charCodeAt(tokPos + 1);
  if (next >= 48 && next <= 57) return readNumber(true);
  ++tokPos;
  return finishToken(_dot);
}

function readToken_slash() { // '/'
  if (tokRegexpAllowed) { ++tokPos; return readRegexp(); }
  var next = input.charCodeAt(tokPos + 1);
  if (next === 47) return finishOp(_floorDiv, 2);
  if (next === 61) return finishOp(_assign, 2);
  return finishOp(_slash, 1);
}

function readToken_mult_modulo(code) { // '*%'
  var next = input.charCodeAt(tokPos + 1);
  if (next === 42 && next === code) return finishOp(_exponentiation, 2);
  if (next === 61) return finishOp(_assign, 2);
  return finishOp(_multiplyModulo, 1);
}

function readToken_pipe_amp(code) { // '|&'
  var next = input.charCodeAt(tokPos + 1);
  if (next === 61) return finishOp(_assign, 2);
  return finishOp(code === 124 ? _bitwiseOR : _bitwiseAND, 1);
}

function readToken_caret() { // '^'
  var next = input.charCodeAt(tokPos + 1);
  if (next === 61) return finishOp(_assign, 2);
  return finishOp(_bitwiseXOR, 1);
}

function readToken_plus_min(code) { // '+-'
  var next = input.charCodeAt(tokPos + 1);
  if (next === 61) return finishOp(_assign, 2);
  return finishOp(_plusMin, 1);
}

function readToken_lt_gt(code) { // '<>'
  var next = input.charCodeAt(tokPos + 1);
  var size = 1;
  if (next === code) {
    size = 2;
    if (input.charCodeAt(tokPos + size) === 61) return finishOp(_assign, size + 1);
    return finishOp(_bitShift, size);
  }
  if (next === 61) size = 2;
  return finishOp(_relational, size);
}

function readToken_eq_excl(code) { // '=!'
  var next = input.charCodeAt(tokPos + 1);
  if (next === 61) return finishOp(_equality, 2);
  return finishOp(_eq, 1);
}

function readToken_indent() {
  var indent = "";
  var indentPos = tokPos;
  var ch, next;
  while (indentPos < inputLen) {
    ch = input.charCodeAt(indentPos);
    if (isSpace(ch)) {
      indent += String.fromCharCode(ch);
      ++indentPos;
    } else if (isNewline(ch)) { // newline
      indent = "";
      if (ch === 13 && input.charCodeAt(indentPos + 1) === 10) ++indentPos;
      ++indentPos;
      tokPos = indentPos;
    } else if (ch === 35) { // '#'
      do {
        next = input.charCodeAt(++indentPos);
      } while (indentPos < inputLen && next !== 10);
    } else {
      break;
    }
  }

  var type;
  if (indent.length > 0) {
    if (indentHist.isIndent(indent)) {
      type = _indent;
      if (indentHist.count() >= 1) tokStart += indentHist.len(indentHist.count() - 1);
      indentHist.addIndent(indent);
    } else if (indentHist.isDedent(indent)) {
      type = _dedent;
      indentHist.addDedent(indent);
      var nextDedent = indentHist.count() - indentHist.dedentCount;
      if (nextDedent >= 2) {
        tokStart += indentHist.len(nextDedent) - indentHist.len(nextDedent - 1);
      }
    } else {
      tokPos += indent.length;
    }
  } else if (indentPos >= inputLen) {
    type = _eof;
  } else if (indentHist.count() > 0) {
    type = _dedent;
    indentHist.updateDedent();
  }

  switch (type) {
    case _indent: case _dedent: return finishOp(type, indentPos - ++tokPos);
    case _eof:
      tokPos = inputLen;
      return finishOp(type, 0);
    default:
      tokType = null;
      return readToken();
  }
}

function getTokenFromCode(code) {
  switch(code) {

  case 13: case 10: case 8232: case 8233:
    ++tokPos;
    if (code === 13 && input.charCodeAt(tokPos) === 10) ++tokPos;
    return finishToken(_newline);

  case 35: // '#'
    skipLineComment();
    return readToken();

  case 46: // '.'
    return readToken_dot();

  case 40: ++tokPos; return finishToken(_parenL);
  case 41: ++tokPos; return finishToken(_parenR);
  case 59: ++tokPos; return finishToken(_semi);
  case 44: ++tokPos; return finishToken(_comma);
  case 91: ++tokPos; return finishToken(_bracketL);
  case 93: ++tokPos; return finishToken(_bracketR);
  case 123: ++tokPos; return finishToken(_braceL);
  case 125: ++tokPos; return finishToken(_braceR);
  case 58: ++tokPos; return finishToken(_colon);
  case 63: ++tokPos; return finishToken(_question);

  case 48: // '0'
    var next = input.charCodeAt(tokPos + 1);
    if (next === 120 || next === 88) return readHexNumber();
    
  case 49: case 50: case 51: case 52: case 53: case 54: case 55: case 56: case 57: // 1-9
    return readNumber(false);

  case 34: case 39: // '"', "'"
    return readString(code);

  case 47: // '/'
    return readToken_slash(code);

  case 42: case 37: // '*%'
    return readToken_mult_modulo(code);

  case 124: case 38: // '|&'
    return readToken_pipe_amp(code);

  case 94: // '^'
    return readToken_caret();

  case 43: case 45: // '+-'
    return readToken_plus_min(code);

  case 60: case 62: // '<>'
    return readToken_lt_gt(code);

  case 61: case 33: // '=!'
    return readToken_eq_excl(code);

  case 126: // '~'
    return finishOp(_bitwiseNOT, 1);
  }

  return false;
}

function readToken(forceRegexp) {
  if (tokType === _dedent) {
    indentHist.pop();
    if (indentHist.dedentCount > 0) return;
  }

  if (!forceRegexp) tokStart = tokPos;
  else tokPos = tokStart + 1;
  if (forceRegexp) return readRegexp();
  if (tokPos >= inputLen) return finishToken(_eof);
  if (tokType === _newline) return readToken_indent();

  var code = input.charCodeAt(tokPos);
  if (isIdentifierStart(code) || code === 92 /* '\' */) return readWord();

  var tok = getTokenFromCode(code);

  if (tok === false) {
    var ch = String.fromCharCode(code);
    if (ch === "\\" || nonASCIIidentifierStart.test(ch)) return readWord();
    raise(tokPos, "Unexpected character '" + ch + "'");
  }
  return tok;
}

function finishOp(type, size) {
  var str = input.slice(tokPos, tokPos + size);
  tokPos += size;
  finishToken(type, str);
}

function readRegexp() {
  var content = "", escaped, inClass, start = tokPos, value;
  for (;;) {
    if (tokPos >= inputLen) raise(start, "Unterminated regular expression");
    var ch = input.charAt(tokPos);
    if (newline.test(ch)) raise(start, "Unterminated regular expression");
    if (!escaped) {
      if (ch === "[") inClass = true;
      else if (ch === "]" && inClass) inClass = false;
      else if (ch === "/" && !inClass) break;
      escaped = ch === "\\";
    } else escaped = false;
    ++tokPos;
  }
  content = input.slice(start, tokPos);
  ++tokPos;
  
  var mods = readWord1();
  if (mods && !/^[gmsiy]*$/.test(mods)) raise(start, "Invalid regular expression flag");
  try {
    value = new RegExp(content, mods);
  } catch (e) {
    if (e instanceof SyntaxError) raise(start, "Error parsing regular expression: " + e.message);
    raise(e);
  }
  return finishToken(_regexp, value);
}

function readInt(radix, len) {
  var start = tokPos, total = 0;
  for (var i = 0, e = len == null ? Infinity : len; i < e; ++i) {
    var code = input.charCodeAt(tokPos), val;
    if (code >= 97) val = code - 97 + 10; // a
    else if (code >= 65) val = code - 65 + 10; // A
    else if (code >= 48 && code <= 57) val = code - 48; // 0-9
    else val = Infinity;
    if (val >= radix) break;
    ++tokPos;
    total = total * radix + val;
  }
  if (tokPos === start || len != null && tokPos - start !== len) return null;

  return total;
}

function readHexNumber() {
  tokPos += 2; // 0x
  var val = readInt(16);
  if (val == null) raise(tokStart + 2, "Expected hexadecimal number");
  if (isIdentifierStart(input.charCodeAt(tokPos))) raise(tokPos, "Identifier directly after number");
  return finishToken(_num, val);
}

function readNumber(startsWithDot) {
  var start = tokPos, isFloat = false, octal = input.charCodeAt(tokPos) === 48;
  if (!startsWithDot && readInt(10) === null) raise(start, "Invalid number");
  if (input.charCodeAt(tokPos) === 46) {
    ++tokPos;
    readInt(10);
    isFloat = true;
  }
  var next = input.charCodeAt(tokPos);
  if (next === 69 || next === 101) { // 'eE'
    next = input.charCodeAt(++tokPos);
    if (next === 43 || next === 45) ++tokPos; // '+-'
    if (readInt(10) === null) raise(start, "Invalid number");
    isFloat = true;
  }
  if (isIdentifierStart(input.charCodeAt(tokPos))) raise(tokPos, "Identifier directly after number");

  var str = input.slice(start, tokPos), val;
  if (isFloat) val = parseFloat(str);
  else if (!octal || str.length === 1) val = parseInt(str, 10);
  else if (/[89]/.test(str) || strict) raise(start, "Invalid number");
  else val = parseInt(str, 8);
  return finishToken(_num, val);
}

function readString(quote) {
  tokPos++;
  var ch = input.charCodeAt(tokPos);
  var tripleQuoted = false;
  if (ch === quote && input.charCodeAt(tokPos+1) === quote) {
    tripleQuoted = true;
    tokPos += 2;
  }
  var out = "";
  for (;;) {
    if (tokPos >= inputLen) raise(tokStart, "Unterminated string constant");
    var ch = input.charCodeAt(tokPos);
    if (ch === quote) {
      if (tripleQuoted) {
        if (input.charCodeAt(tokPos+1) === quote &&
            input.charCodeAt(tokPos+2) === quote) {
          tokPos += 3;
          return finishToken(_string, out);
        }
      } else {
        ++tokPos;
        return finishToken(_string, out);
      }
    }
    if (ch === 92) { // '\'
      ch = input.charCodeAt(++tokPos);
      var octal = /^[0-7]+/.exec(input.slice(tokPos, tokPos + 3));
      if (octal) octal = octal[0];
      while (octal && parseInt(octal, 8) > 255) octal = octal.slice(0, -1);
      if (octal === "0") octal = null;
      ++tokPos;
      if (octal) {
        if (strict) raise(tokPos - 2, "Octal literal in strict mode");
        out += String.fromCharCode(parseInt(octal, 8));
        tokPos += octal.length - 1;
      } else {
        switch (ch) {
        case 110: out += "\n"; break; // 'n' -> '\n'
        case 114: out += "\r"; break; // 'r' -> '\r'
        case 120: out += String.fromCharCode(readHexChar(2)); break; // 'x'
        case 117: out += String.fromCharCode(readHexChar(4)); break; // 'u'
        case 85: // 'U'
          ch = readHexChar(8);
          if (ch < 0xFFFF && (ch < 0xD800 || 0xDBFF < ch)) out += String.fromCharCode(ch); // If it's UTF-16
          else { // If we need UCS-2
            ch -= 0x10000;
            out += String.fromCharCode((ch>>10)+0xd800)+String.fromCharCode((ch%0x400)+0xdc00);
          }
          break;
        case 116: out += "\t"; break; // 't' -> '\t'
        case 98: out += "\b"; break; // 'b' -> '\b'
        case 118: out += "\u000b"; break; // 'v' -> '\u000b'
        case 102: out += "\f"; break; // 'f' -> '\f'
        case 48: out += "\0"; break; // 0 -> '\0'
        case 13: if (input.charCodeAt(tokPos) === 10) ++tokPos; // '\r\n'
        case 10: // ' \n'
          break;
        default: out += '\\' + String.fromCharCode(ch); break;
        }
      }
    } else {
      if (isNewline(ch)) {
        if (tripleQuoted) {
          out += String.fromCharCode(ch);
          ++tokPos;
          if (ch === 13 && input.charCodeAt(tokPos) === 10) {
            ++tokPos;
            out += "\n";
          }
        } else raise(tokStart, "Unterminated string constant");
      } else {
        out += String.fromCharCode(ch); // '\'
        ++tokPos;
      }
    }
  }
}

function readHexChar(len) {
  var n = readInt(16, len);
  if (n === null) raise(tokStart, "Bad character escape sequence");
  return n;
}

var containsEsc;

function readWord1() {
  containsEsc = false;
  var word, first = true, start = tokPos;
  for (;;) {
    var ch = input.charCodeAt(tokPos);
    if (isIdentifierChar(ch)) {
      if (containsEsc) word += input.charAt(tokPos);
      ++tokPos;
    } else if (ch === 92) { // "\"
      if (!containsEsc) word = input.slice(start, tokPos);
      containsEsc = true;
      if (input.charCodeAt(++tokPos) != 117) // "u"
        raise(tokPos, "Expecting Unicode escape sequence \\uXXXX");
      ++tokPos;
      var esc = readHexChar(4);
      var escStr = String.fromCharCode(esc);
      if (!escStr) raise(tokPos - 1, "Invalid Unicode escape");
      if (!(first ? isIdentifierStart(esc) : isIdentifierChar(esc)))
        raise(tokPos - 4, "Invalid Unicode escape");
      word += escStr;
    } else {
      break;
    }
    first = false;
  }
  return containsEsc ? word : input.slice(start, tokPos);
}

function readWord() {
  var word = readWord1();
  var type = _name;
  if (!containsEsc && isKeyword(word))
    type = keywordTypes[word];
  return finishToken(type, word);
}

function next() {
  lastStart = tokStart;
  lastEnd = tokEnd;
  readToken();
}

function setStrict(strct) {
  strict = strct;
  tokPos = tokStart;
  skipSpace();
  readToken();
}

function Node() {
  this.type = null;
}

function startNode() {
  var node = new Node();
  return node;
}

function finishNode(node, type) {
  node.type = type;
  return node;
}

function startNodeFrom(other) {
  var node = new Node();

  return node;
}

var getNodeCreator = function(startNode, startNodeFrom, finishNode, unpackTuple) {

  return {
    finishNodeFrom: function (endNode, node, type) {
      node.type = type;
      return node;
    },

    createNodeFrom: function (startNode, type, props) {
      var node = startNodeFrom(startNode);
      for (var prop in props) node[prop] = props[prop];
      return finishNode(node, type);
    },

    createNodeSpan: function (startNode, endNode, type, props) {
      var node = startNodeFrom(startNode);
      for (var prop in props) node[prop] = props[prop];
      return this.finishNodeFrom(endNode, node, type);
    },

    createGeneratedNodeSpan: function (startNode, endNode, type, props) {
      var node = startNodeFrom(startNode);
      for (var prop in props) node[prop] = props[prop];
      node.userCode = false;
      return this.finishNodeFrom(endNode, node, type);
    },

    createNodeArgsWhileConsequent: function (argsId, s) {
      var __realArgCountId  = this.createGeneratedNodeSpan(argsId, argsId, "Identifier", { name:  '__realArgCount' + s });
      var __paramsFormals  = this.createGeneratedNodeSpan(argsId, argsId, "Identifier", { name:  'arguments' });
      var __formalsIndexId = this.createGeneratedNodeSpan(argsId, argsId, "Identifier", { name: '__formalsIndex' + s });
      return this.createGeneratedNodeSpan(argsId, argsId, "WhileStatement", {
        test: this.createGeneratedNodeSpan(argsId, argsId, "BinaryExpression", {
          operator: '<', left: __formalsIndexId,
          right: __realArgCountId
        }),
        body: this.createGeneratedNodeSpan(argsId, argsId, "BlockStatement", {
          body: [this.createGeneratedNodeSpan(argsId, argsId, "ExpressionStatement", {
            expression: this.createGeneratedNodeSpan(argsId, argsId, "CallExpression", {
              callee: this.createNodeMembIds(argsId, argsId.name, 'push'),
              arguments: [this.createGeneratedNodeSpan(argsId, argsId, "MemberExpression", {
                computed: true, object: __paramsFormals,
                property: this.createGeneratedNodeSpan(argsId, argsId, "UpdateExpression", {
                  operator: '++', prefix: false, argument: __formalsIndexId
                })
              })]
            })
          })]
        })
      });
    },

    createNodeArgsAlternate: function (argsId, s) {
      var __args = '__args' + s;
      var __formalsIndexId = this.createGeneratedNodeSpan(argsId, argsId, "Identifier", { name: '__formalsIndex' + s });
      return this.createGeneratedNodeSpan(argsId, argsId, "BlockStatement", {
        body: [this.createGeneratedNodeSpan(argsId, argsId, "WhileStatement", {
          test: this.createGeneratedNodeSpan(argsId, argsId, "BinaryExpression", {
            operator: '<', left: __formalsIndexId,
            right: this.createNodeMembIds(argsId, __args, 'length')
          }),
          body: this.createGeneratedNodeSpan(argsId, argsId, "BlockStatement", {
            body: [this.createGeneratedNodeSpan(argsId, argsId, "ExpressionStatement", {
              expression: this.createGeneratedNodeSpan(argsId, argsId, "CallExpression", {
                callee: this.createNodeMembIds(argsId, argsId.name, 'push'),
                arguments: [this.createGeneratedNodeSpan(argsId, argsId, "MemberExpression", {
                  computed: true,
                  object: this.createGeneratedNodeSpan(argsId, argsId, "Identifier", { name: __args }),
                  property: this.createGeneratedNodeSpan(argsId, argsId, "UpdateExpression", {
                    operator: '++', prefix: false, argument: __formalsIndexId
                  })
                })]
              })
            })]
          })
        })]
      });
    },

    createNodeFnBodyIife: function (body) {
      var iifeBody = this.createGeneratedNodeSpan(body, body, "FunctionExpression", {
        params: [], defaults: [], body: body, generator: false, expression: false
      });
      var iifeCall = this.createGeneratedNodeSpan(body, body, "CallExpression", {
        callee: this.createGeneratedNodeSpan(body, body, "MemberExpression", {
          computed: false, object: iifeBody,
          property: this.createGeneratedNodeSpan(body, body, "Identifier", { name: 'call' })
        }),
        arguments: [this.createGeneratedNodeSpan(body, body, "ThisExpression")]
      });
      return this.createGeneratedNodeSpan(body, body, "ReturnStatement", { argument: iifeCall });
    },

    createNodeMemberCall: function (node, object, property, args) {
      var objId = this.createNodeFrom(node, "Identifier", { name: object });
      var propId = this.createNodeFrom(node, "Identifier", { name: property });
      var member = this.createNodeFrom(node, "MemberExpression", { object: objId, property: propId, computed: false });
      node.callee = member;
      node.arguments = args;
      return finishNode(node, "CallExpression");
    },

    createNodeMembIds: function(r, o, p) {
      return this.createNodeSpan(r, r, "MemberExpression", {
        computed: false,
        object: this.createNodeSpan(r, r, "Identifier", { name: o }),
        property: this.createNodeSpan(r, r, "Identifier", { name: p })
      })
    },

    createNodeMembIdLit: function(r, o, p) {
      return this.createNodeSpan(r, r, "MemberExpression", {
        computed: true,
        object: this.createNodeSpan(r, r, "Identifier", { name: o }),
        property: this.createNodeSpan(r, r, "Literal", { value: p })
      })
    },

    createNodeOpsCallee: function (node, fnName) {
      var runtimeId = this.createGeneratedNodeSpan(node, node, "Identifier", { name: runtimeParamName });
      var opsId = this.createGeneratedNodeSpan(node, node, "Identifier", { name: "ops" });
      var addId = this.createGeneratedNodeSpan(node, node, "Identifier", { name: fnName });
      var opsMember = this.createGeneratedNodeSpan(node, node, "MemberExpression", { object: runtimeId, property: opsId, computed: false });
      return this.createGeneratedNodeSpan(node, node, "MemberExpression", { object: opsMember, property: addId, computed: false });
    },

    createNodeRuntimeCall: function (r, mod, fn, args) {
      return this.createNodeSpan(r, r, "CallExpression", {
        callee: this.createNodeSpan(r, r, "MemberExpression", {
          computed: false,
          object: this.createNodeMembIds(r, runtimeParamName,  mod),
          property: this.createNodeSpan(r, r, "Identifier", { name: fn })
        }),
        arguments: args
      });
    },

    createVarDeclFromId: function (refNode, id, init) {
      var decl = startNodeFrom(refNode);
      decl.id = id;
      decl.init = init;
      this.finishNodeFrom(refNode, decl, "VariableDeclarator");
      var declDecl = startNodeFrom(refNode);
      declDecl.kind = "var";
      declDecl.declarations = [decl];
      return this.finishNodeFrom(refNode, declDecl, "VariableDeclaration");
    },

    createGeneratedVarDeclFromId: function (refNode, id, init) {
      var decl = startNodeFrom(refNode);
      decl.id = id;
      decl.init = init;
      this.finishNodeFrom(refNode, decl, "VariableDeclarator");
      var declDecl = startNodeFrom(refNode);
      declDecl.kind = "var";
      declDecl.declarations = [decl];
      declDecl.userCode = false;
      return this.finishNodeFrom(refNode, declDecl, "VariableDeclaration");
    },

    createClass: function(container, ctorNode, classParams, classBodyRefNode, classBlock) {
      function getPrototype(stmt) {
        if (stmt.expression && stmt.expression.left && stmt.expression.left.object &&
          stmt.expression.left.object.property && stmt.expression.left.object.property.name === "prototype")
          return stmt.expression.left.property.name;
        return null;
      }

      var ctorBlock = startNodeFrom(classBlock);
      ctorBlock.body = [];

      if (classParams.length === 1) {
        var objId = this.createNodeSpan(classBodyRefNode, classBodyRefNode, "Identifier", { name: classParams[0].name });
        var propertyId = this.createNodeSpan(classBodyRefNode, classBodyRefNode, "Identifier", { name: "call" });
        var calleeMember = this.createNodeSpan(classBodyRefNode, classBodyRefNode, "MemberExpression", { object: objId, property: propertyId, computed: false });
        var thisExpr = this.createNodeSpan(classBodyRefNode, classBodyRefNode, "ThisExpression");
        var callExpr = this.createNodeSpan(classBodyRefNode, classBodyRefNode, "CallExpression", { callee: calleeMember, arguments: [thisExpr] });
        var superExpr = this.createNodeSpan(classBodyRefNode, classBodyRefNode, "ExpressionStatement", { expression: callExpr });
        ctorBlock.body.push(superExpr);
      }

      for (var i in classBlock.body) {
        var stmt = classBlock.body[i];
        var prototype = getPrototype(stmt);
        if (!prototype) {
          ctorBlock.body.push(stmt);
        }
        else if (prototype === "__init__") {
          for (var j in stmt.expression.right.body.body)
            ctorBlock.body.push(stmt.expression.right.body.body[j]);
          ctorNode.params = stmt.expression.right.params;
        }
      }

      ctorNode.body = finishNode(ctorBlock, "BlockStatement");
      finishNode(ctorNode, "FunctionDeclaration");
      container.body.push(ctorNode);

      if (classParams.length === 1) {
        var childClassId = this.createNodeSpan(ctorNode, ctorNode, "Identifier", { name: ctorNode.id.name });
        var childPrototypeId = this.createNodeSpan(ctorNode, ctorNode, "Identifier", { name: "prototype" });
        var childPrototypeMember = this.createNodeSpan(ctorNode, ctorNode, "MemberExpression", { object: childClassId, property: childPrototypeId, computed: false });
        var parentClassId = this.createNodeSpan(ctorNode, ctorNode, "Identifier", { name: classParams[0].name });
        var parentPrototypeId = this.createNodeSpan(ctorNode, ctorNode, "Identifier", { name: "prototype" });
        var parentPrototypeMember = this.createNodeSpan(ctorNode, ctorNode, "MemberExpression", { object: parentClassId, property: parentPrototypeId, computed: false });
        var objClassId = this.createNodeSpan(ctorNode, ctorNode, "Identifier", { name: "Object" });
        var objCreateId = this.createNodeSpan(ctorNode, ctorNode, "Identifier", { name: "create" });
        var objPropertyMember = this.createNodeSpan(ctorNode, ctorNode, "MemberExpression", { object: objClassId, property: objCreateId, computed: false });
        var callExpr = this.createNodeSpan(ctorNode, ctorNode, "CallExpression", { callee: objPropertyMember, arguments: [parentPrototypeMember] });
        var assignExpr = this.createNodeSpan(ctorNode, ctorNode, "AssignmentExpression", { left: childPrototypeMember, operator: "=", right: callExpr });
        var inheritanceExpr = this.createNodeSpan(ctorNode, ctorNode, "ExpressionStatement", { expression: assignExpr });
        container.body.push(inheritanceExpr);
      }

      for (var i in classBlock.body) {
        var stmt = classBlock.body[i];
        var prototype = getPrototype(stmt);
        if (prototype && prototype !== "__init__")
          container.body.push(stmt);
      }

      return finishNode(container, "BlockStatement");
    },

    createFor: function (node, init, tupleArgs, right, body) {
      var forOrderedBody = body;
      var forInBody = JSON.parse(JSON.stringify(forOrderedBody));

      var tmpVarSuffix = newAstIdCount++;

      var arrayId = this.createNodeSpan(node, node, "Identifier", { name: "Array" });
      var lengthId = this.createNodeSpan(init, init, "Identifier", { name: "length" });
      var zeroLit = this.createNodeSpan(init, init, "Literal", { value: 0 });

      var rightId = this.createNodeSpan(right, right, "Identifier", { name: "__filbertRight" + tmpVarSuffix });
      var rightAssign = this.createVarDeclFromId(right, rightId, right);

      var forRightId = this.createNodeSpan(init, init, "Identifier", { name: "__filbertRight" + tmpVarSuffix });

      var forOrderedIndexId = this.createNodeSpan(init, init, "Identifier", { name: "__filbertIndex" + tmpVarSuffix });
      var forOrderedIndexDeclr = this.createNodeSpan(init, init, "VariableDeclarator", { id: forOrderedIndexId, init: zeroLit });
      var forOrderedIndexDecln = this.createNodeSpan(init, init, "VariableDeclaration", { declarations: [forOrderedIndexDeclr], kind: "var" });
      var forOrderedTestMember = this.createNodeSpan(init, init, "MemberExpression", { object: forRightId, property: lengthId, computed: false });
      var forOrderedTestBinop = this.createNodeSpan(init, init, "BinaryExpression", { left: forOrderedIndexId, operator: "<", right: forOrderedTestMember });
      var forOrderedUpdate = this.createNodeSpan(init, init, "UpdateExpression", { operator: "++", prefix: true, argument: forOrderedIndexId });
      var forOrderedMember = this.createNodeSpan(init, init, "MemberExpression", { object: forRightId, property: forOrderedIndexId, computed: true });

      if (tupleArgs) {
        var varStmts = unpackTuple(tupleArgs, forOrderedMember);
        for (var i = varStmts.length - 1; i >= 0; i--) forOrderedBody.body.unshift(varStmts[i]);
      }
      else {
        if (init.type === "Identifier" && !scope.exists(init.name)) {
          scope.addVar(init.name);
          forOrderedBody.body.unshift(this.createVarDeclFromId(init, init, forOrderedMember));
        } else {
          var forOrderedInit = this.createNodeSpan(init, init, "AssignmentExpression", { operator: "=", left: init, right: forOrderedMember });
          var forOrderedInitStmt = this.createNodeSpan(init, init, "ExpressionStatement", { expression: forOrderedInit });
          forOrderedBody.body.unshift(forOrderedInitStmt);
        }
      }

      var forOrdered = this.createNodeSpan(node, node, "ForStatement", { init: forOrderedIndexDecln, test: forOrderedTestBinop, update: forOrderedUpdate, body: forOrderedBody });
      var forOrderedBlock = this.createNodeSpan(node, node, "BlockStatement", { body: [forOrdered] });

      var forInLeft = init;
      if (tupleArgs) {
        var varStmts = unpackTuple(tupleArgs, right);
        forInLeft = varStmts[0];
        for (var i = varStmts.length - 1; i > 0; i--) forInBody.body.unshift(varStmts[i]);
      }
      else if (init.type === "Identifier" && !scope.exists(init.name)) {
        scope.addVar(init.name);
        forInLeft = this.createVarDeclFromId(init, init, null);
      }
      var forIn = this.createNodeSpan(node, node, "ForInStatement", { left: forInLeft, right: forRightId, body: forInBody });
      var forInBlock = this.createNodeSpan(node, node, "BlockStatement", { body: [forIn] });

      var ifRightId = this.createNodeSpan(node, node, "Identifier", { name: "__filbertRight" + tmpVarSuffix });
      var ifTest = this.createNodeSpan(node, node, "BinaryExpression", { left: ifRightId, operator: "instanceof", right: arrayId });
      var ifStmt = this.createNodeSpan(node, node, "IfStatement", { test: ifTest, consequent: forOrderedBlock, alternate: forInBlock });

      node.body = [rightAssign, ifStmt];

      return node;
    },

    createListCompPush: function (expr, tmpVarSuffix) {
      var exprPushTmpListId = this.createNodeSpan(expr, expr, "Identifier", { name: "__tmpList" + tmpVarSuffix });
      var exprPushId = this.createNodeSpan(expr, expr, "Identifier", { name: "push" });
      var exprMember = this.createNodeSpan(expr, expr, "MemberExpression", { object: exprPushTmpListId, property: exprPushId, computed: false });
      var exprCall = this.createNodeSpan(expr, expr, "CallExpression", { callee: exprMember, arguments: [expr] });
      return this.createNodeSpan(expr, expr, "ExpressionStatement", { expression: exprCall });
    },

    createListCompIife: function (node, body, tmpVarSuffix) {
      var iifeRuntimeId = this.createNodeSpan(node, node, "Identifier", { name: runtimeParamName });
      var iifeObjectsId = this.createNodeSpan(node, node, "Identifier", { name: "objects" });
      var iifeObjMember = this.createNodeSpan(node, node, "MemberExpression", { object: iifeRuntimeId, property: iifeObjectsId, computed: false });
      var iifeListId = this.createNodeSpan(node, node, "Identifier", { name: "list" });
      var iifeListMember = this.createNodeSpan(node, node, "MemberExpression", { object: iifeObjMember, property: iifeListId, computed: false });
      var iifeNewExpr = this.createNodeSpan(node, node, "NewExpression", { callee: iifeListMember, arguments: [] });
      var iifeListId = this.createNodeSpan(node, node, "Identifier", { name: "__tmpList" + tmpVarSuffix });
      var iifeListDecl = this.createVarDeclFromId(node, iifeListId, iifeNewExpr);

      var iifeReturnListId = this.createNodeSpan(node, node, "Identifier", { name: "__tmpList" + tmpVarSuffix });
      var iifeReturn = this.createNodeSpan(node, node, "ReturnStatement", { argument: iifeReturnListId });

      var iifeBlock = this.createNodeSpan(node, node, "BlockStatement", { body: [iifeListDecl, body, iifeReturn] });
      var fnExpr = this.createNodeSpan(node, node, "FunctionExpression", { params: [], defaults: [], body: iifeBlock, generator: false, expression: false });

      return this.createNodeSpan(node, node, "CallExpression", { callee: fnExpr, arguments: [] });
    }
  };
};

function eat(type) {
  if (tokType === type) {
    next();
    return true;
  }
}

function expect(type) {
  if (tokType === type) next();
  else if (tokType.isAssign === true) next();
  else unexpected();
}

function unexpected() {
  raise(tokStart, "Unexpected token");
}

function checkLVal(expr) {
  if (expr.type !== "Identifier" && expr.type !== "MemberExpression")
    raise(expr.start, "Assigning to rvalue");
  if (strict && expr.type === "Identifier" && isStrictBadIdWord(expr.name))
    raise(expr.start, "Assigning to " + expr.name + " in strict mode");
}

function getTupleArgs(expr) {
  if (expr.callee && expr.callee.object && expr.callee.object.object &&
    expr.callee.object.object.name === runtimeParamName &&
    expr.callee.property && expr.callee.property.name === "tuple")
    return expr.arguments;
  return null;
}

function unpackTuple(tupleArgs, right) {
  if (!tupleArgs || tupleArgs.length < 1) unexpected();

  var varStmts = [];

  var tmpId = nc.createNodeSpan(right, right, "Identifier", { name: "__filbertTmp" + newAstIdCount++ });
  var tmpDecl = nc.createVarDeclFromId(right, tmpId, right);
  varStmts.push(tmpDecl);

  for (var i = 0; i < tupleArgs.length; i++) {
    var lval = tupleArgs[i];
    var subTupleArgs = getTupleArgs(lval);
    if (subTupleArgs) {
      var subLit = nc.createNodeSpan(right, right, "Literal", { value: i });
      var subRight = nc.createNodeSpan(right, right, "MemberExpression", { object: tmpId, property: subLit, computed: true });
      var subStmts = unpackTuple(subTupleArgs, subRight);
      for (var j = 0; j < subStmts.length; j++) varStmts.push(subStmts[j]);
    } else {
      checkLVal(lval);
      var indexId = nc.createNodeSpan(right, right, "Literal", { value: i });
      var init = nc.createNodeSpan(right, right, "MemberExpression", { object: tmpId, property: indexId, computed: true });
      if (lval.type === "Identifier" && !scope.exists(lval.name)) {
        scope.addVar(lval.name);
        var varDecl = nc.createVarDeclFromId(lval, lval, init);
        varStmts.push(varDecl);
      }
      else {
        var node = startNodeFrom(lval);
        node.left = lval;
        node.operator = "=";
        node.right = init;
        finishNode(node, "AssignmentExpression");
        varStmts.push(nc.createNodeFrom(node, "ExpressionStatement", { expression: node }));
      }
    }
  }

  return varStmts;
}

function parseTopLevel() {
  lastStart = lastEnd = tokPos;
  inFunction = strict = null;
  bracketNesting = 0;
  readToken();
  var node = startNode();
  node.body = [];
  while (tokType !== _eof) {
    var stmt = parseStatement();
    if (stmt) node.body.push(stmt);
  }
  return finishNode(node, "Program");
}

function parseStatement() {
  if (tokType === _slash || tokType === _assign && tokVal == "/=")
    readToken(true);

  var starttype = tokType, node = startNode();

  switch (starttype) {

  case _break:
    next();
    return finishNode(node, "BreakStatement");

  case _continue:
    next();
    return finishNode(node, "ContinueStatement");

  case _class:
    next();
    return parseClass(node);

  case _def:
    next();
    return parseFunction(node);

  case _for:
    next();
    return parseFor(node);

  case _from:
    skipLine();
    next();
    return parseStatement();

  case _if: case _elif:
    next();
    if (tokType === _parenL) node.test = parseParenExpression();
    else node.test = parseExpression();
    expect(_colon);
    node.consequent = parseSuite();
    if (tokType === _elif) {
      node.alternate = parseStatement();
    }
    else if (eat(_else)) {
      expect(_colon);
      eat(_colon);
      node.alternate = parseSuite();
    }
    else {
      node.alternate = null;
    } 
    return finishNode(node, "IfStatement");

  case _import:
    skipLine();
    next();
    return parseStatement();

  case _newline:
    next();
    return null;

  case _pass:
    next();
    return finishNode(node, "EmptyStatement");

  case _return:
    if (!inFunction)
      raise(tokStart, "'return' outside of function");
    next();
    if (tokType ===_newline || tokType === _eof) node.argument = null;
    else { node.argument = parseExpression();}
    return finishNode(node, "ReturnStatement");

  case _try:
    next();
    node.block = parseBlock();
    node.handler = null;
    if (tokType === _catch) {
      var clause = startNode();
      next();
      expect(_parenL);
      clause.param = parseIdent();
      if (strict && isStrictBadIdWord(clause.param.name))
        raise(clause.param.start, "Binding " + clause.param.name + " in strict mode");
      expect(_parenR);
      clause.guard = null;
      clause.body = parseBlock();
      node.handler = finishNode(clause, "CatchClause");
    }
    node.guardedHandlers = [];
    node.finalizer = eat(_finally) ? parseBlock() : null;
    if (!node.handler && !node.finalizer)
      raise(node.start, "Missing catch or finally clause");
    return finishNode(node, "TryStatement");

  case _while:
    next();
    if (tokType === _parenL) node.test = parseParenExpression();
    else node.test = parseExpression();
    expect(_colon);
    node.body = parseSuite();
    return finishNode(node, "WhileStatement");

  case _with:
    if (strict) raise(tokStart, "'with' in strict mode");
    next();
    node.object = parseParenExpression();
    node.body = parseStatement();
    return finishNode(node, "WithStatement");

  case _semi:
    next();
    return finishNode(node, "EmptyStatement");

  default:
    var expr = parseExpression();
    if (tokType !== _semi && tokType !== _newline && tokType !== _eof) unexpected();
    if (expr.type === "VariableDeclaration" || expr.type === "BlockStatement") {
      return expr;
    } else {
      node.expression = expr;
      return finishNode(node, "ExpressionStatement");
    }
  }
}

function parseBlock() {
  var node = startNode();
  node.body = [];
  while (tokType !== _dedent && tokType !== _eof) {
    var stmt = parseStatement();
    if (stmt) node.body.push(stmt);
  }
  if (tokType === _dedent) next();
  return finishNode(node, "BlockStatement");
}

function parseSuite() {
  var node = startNode();
  node.body = [];
  if (eat(_newline)) {
    if (tokType === _indent) {
      expect(_indent);
      while (!eat(_dedent) && !eat(_eof)) {
        var stmt = parseStatement();
        if (stmt) node.body.push(stmt);
      }
    }
  } else if (tokType !== _eof) {
    node.body.push(parseStatement());
    next();
  }
  return finishNode(node, "BlockStatement");
}

function parseFor(node) {
  var init = parseExpression(false, true);
  var tupleArgs = getTupleArgs(init);
  if (!tupleArgs) checkLVal(init);
  expect(_in);
  var right = parseExpression();
  expect(_colon);
  var body = parseSuite();
  finishNode(node, "BlockStatement");
  return nc.createFor(node, init, tupleArgs, right, body);
}

function parseExpression(noComma, noIn) {
  return parseMaybeAssign(noIn);
}

function parseParenExpression() {
  expect(_parenL);
  var val = parseExpression();
  expect(_parenR);
  return val;
}

function parseMaybeAssign(noIn) {
  var left = parseMaybeTuple(noIn);
  if (tokType.isAssign) {
    var tupleArgs = getTupleArgs(left);
    if (tupleArgs) {
      next();
      var right = parseMaybeTuple(noIn);
      var blockNode = startNodeFrom(left);
      blockNode.body = unpackTuple(tupleArgs, right);
      return finishNode(blockNode, "BlockStatement");
    }

    if (scope.isClass()) {
      var thisExpr = nc.createNodeFrom(left, "ThisExpression");
      left = nc.createNodeFrom(left, "MemberExpression", { object: thisExpr, property: left });
    }

    var node = startNodeFrom(left);
    node.operator = tokVal;
    node.left = left;
    next();
    node.right = parseMaybeTuple(noIn);
    checkLVal(left);

    if (node.operator === '+=' || node.operator === '*=') {
      var right = nc.createNodeSpan(node.right, node.right, "CallExpression");
      right.callee = nc.createNodeOpsCallee(right, node.operator === '+=' ? "add" : "multiply");
      right.arguments = [left, node.right];
      node.right = right;
      node.operator = '=';
    }

    if (left.type === "Identifier" && !scope.exists(left.name)) {
      if (!node.operator || node.operator.length > 1) unexpected();
      scope.addVar(left.name);
      return nc.createVarDeclFromId(node.left, node.left, node.right);
    }
    return finishNode(node, "AssignmentExpression");
  }
  return left;
}

function parseMaybeTuple(noIn) {
  var expr = parseExprOps(noIn);
  if (tokType === _comma) {
    return parseTuple(noIn, expr);
  }
  return expr;
}

function parseExprOps(noIn) {
  return parseExprOp(parseMaybeUnary(noIn), -1, noIn);
}

function parseExprOp(left, minPrec, noIn) {
  var node, exprNode, right, op = tokType, val = tokVal;
  var prec = op === _not ? _in.prec : op.prec;
  if (op === _exponentiation && prec >= minPrec) {
    node = startNodeFrom(left);
    next();
    right = parseExprOp(parseMaybeUnary(noIn), prec, noIn);
    exprNode = nc.createNodeMemberCall(node, "Math", "pow", [left, right]);
    return parseExprOp(exprNode, minPrec, noIn);
  } else if (prec != null && (!noIn || op !== _in)) {
    if (prec > minPrec) {
      next();
      node = startNodeFrom(left);
      if (op === _floorDiv) {
        right = parseExprOp(parseMaybeUnary(noIn), prec, noIn);
        finishNode(node);
        var binExpr = nc.createNodeSpan(node, node, "BinaryExpression", { left: left, operator: '/', right: right });
        exprNode = nc.createNodeMemberCall(node, "Math", "floor", [binExpr]);
      } else if (op === _in || op === _not) {
        if (op === _in || eat(_in)) {
          right = parseExprOp(parseMaybeUnary(noIn), prec, noIn);
          finishNode(node);
          var notLit = nc.createNodeSpan(node, node, "Literal", { value: op === _not });
          exprNode = nc.createNodeRuntimeCall(node, 'ops', 'in', [left, right, notLit]);
        } else raise(tokPos, "Expected 'not in' comparison operator");
      } else if (op === _plusMin && val === '+' || op === _multiplyModulo && val === '*') {
        right = parseExprOp(parseMaybeUnary(noIn), prec, noIn);
        node.arguments = [left, right];
        finishNode(node, "CallExpression");
        node.callee = nc.createNodeOpsCallee(node, op === _plusMin ? "add" : "multiply");
        exprNode = node;
      } else {
        if (op === _is) {
          if (eat(_not)) node.operator = "!==";
          else node.operator = "===";
        } else node.operator = op.rep != null ? op.rep : val;
        node.left = left;
        node.right = parseExprOp(parseMaybeUnary(noIn), prec, noIn);
        exprNode = finishNode(node, (op === _or || op === _and) ? "LogicalExpression" : "BinaryExpression");
      }
      return parseExprOp(exprNode, minPrec, noIn);
    }
  }
  return left;
}

function parseMaybeUnary(noIn) {
  if (tokType.prefix || tokType === _plusMin) {
    var prec = tokType === _plusMin ? _posNegNot.prec : tokType.prec;
    var node = startNode();
    node.operator = tokType.rep != null ? tokType.rep : tokVal;
    node.prefix = true;
    tokRegexpAllowed = true;
    next();
    node.argument = parseExprOp(parseMaybeUnary(noIn), prec, noIn);
    return finishNode(node, "UnaryExpression");
  }
  return parseSubscripts(parseExprAtom());
}

function parseSubscripts(base, noCalls) {
  var node = startNodeFrom(base);
  if (eat(_dot)) {
    var id = parseIdent(true);
    if (pythonRuntime.imports[base.name] && pythonRuntime.imports[base.name][id.name]) {
      var runtimeId = nc.createNodeSpan(base, base, "Identifier", { name: runtimeParamName });
      var importsId = nc.createNodeSpan(base, base, "Identifier", { name: "imports" });
      var runtimeMember = nc.createNodeSpan(base, base, "MemberExpression", { object: runtimeId, property: importsId, computed: false });
      node.object = nc.createNodeSpan(base, base, "MemberExpression", { object: runtimeMember, property: base, computed: false });
    } else if (base.name && base.name === scope.getThisReplace()) {
      node.object = nc.createNodeSpan(base, base, "ThisExpression");
    } else node.object = base;
    node.property = id;
    node.computed = false;
    return parseSubscripts(finishNode(node, "MemberExpression"), noCalls);
  } else if (eat(_bracketL)) {
    var expr, isSlice = false;
    if (eat(_colon)) isSlice = true;
    else expr = parseExpression();
    if (!isSlice && eat(_colon)) isSlice = true;
    if (isSlice) return parseSlice(node, base, expr, noCalls);
    var subscriptCall = nc.createNodeSpan(expr, expr, "CallExpression");
    subscriptCall.callee = nc.createNodeOpsCallee(expr, "subscriptIndex");
    subscriptCall.arguments = [base, expr];
    node.object = base;
    node.property = subscriptCall;
    node.computed = true;
    expect(_bracketR);
    return parseSubscripts(finishNode(node, "MemberExpression"), noCalls);
  } else if (!noCalls && eat(_parenL)) {
    if (scope.isUserFunction(base.name)) {
      var pl = parseParamsList();
      
      var args = [];
      var other = [];
      for ( var i = 0; i < pl.length; ++i ) {
        if ( pl[i].isntFormal ) other.push(pl[i]);
        else args.push(pl[i]);
      }

      if ( other.length > 0 ) {
        var createParamsCall = nc.createNodeRuntimeCall(node, 'utils', 'createParamsObj', other);
        args.push(createParamsCall);
      }

      node.arguments = args;
    } else node.arguments = parseExprList(_parenR, false);


    if ( base.name === 'len' && node.arguments.length === 1 ) {
      node.type = "MemberExpression",
      node.object = node.arguments[0];
      node.property = nc.createNodeSpan(base, base, "Identifier", { name: "length"}),
      node.computed = false;
      delete node.arguments;
      delete node.callee;
      finishNode(node, "MemberExpression");
      return node; 
    }

    if (scope.isNewObj(base.name)) finishNode(node, "NewExpression");
    else finishNode(node, "CallExpression");

    if (pythonRuntime.functions[base.name]) {
      if (base.type !== "Identifier") unexpected();
      var runtimeId = nc.createNodeSpan(base, base, "Identifier", { name: runtimeParamName });
      var functionsId = nc.createNodeSpan(base, base, "Identifier", { name: "functions" });
      var runtimeMember = nc.createNodeSpan(base, base, "MemberExpression", { object: runtimeId, property: functionsId, computed: false });
      node.callee = nc.createNodeSpan(base, base, "MemberExpression", { object: runtimeMember, property: base, computed: false });
    } else node.callee = base;
    return parseSubscripts(node, noCalls);
  }
  return base;
}

function parseSlice(node, base, start, noCalls) {
  var end, step;
  if (!start) start = nc.createNodeFrom(node, "Literal", { value: null });
  if (tokType === _bracketR || eat(_colon)) {
    end = nc.createNodeFrom(node, "Literal", { value: null });
  } else {
    end = parseExpression();
    if (tokType !== _bracketR) expect(_colon);
  }
  if (tokType === _bracketR) step = nc.createNodeFrom(node, "Literal", { value: null });
  else step = parseExpression();
  expect(_bracketR);

  node.arguments = [start, end, step];
  var sliceId = nc.createNodeFrom(base, "Identifier", { name: "_pySlice" });
  var memberExpr = nc.createNodeSpan(base, base, "MemberExpression", { object: base, property: sliceId, computed: false });
  node.callee = memberExpr;
  return parseSubscripts(finishNode(node, "CallExpression"), noCalls);
}

function parseExprAtom() {
  switch (tokType) {

  case _dict:
    next();
    return parseDict(_parenR);

  case _name:
    return parseIdent();

  case _num: case _string: case _regexp:
    var node = startNode();
    node.value = tokVal;
    node.raw = input.slice(tokStart, tokEnd);
    next();
    return finishNode(node, "Literal");

  case _none: case _true: case _false:
    var node = startNode();
    node.value = tokType.atomValue;
    node.raw = tokType.keyword;
    next();
    return finishNode(node, "Literal");

  case _parenL:
    var tokStart1 = tokStart;
    next();
    if (tokType === _parenR) {
      var node = parseTuple(false);
      eat(_parenR);
      return node;
    }
    var val = parseMaybeTuple(false);
    expect(_parenR);
    return val;

  case _bracketL:
    return parseList();

  case _braceL:
    return parseDict(_braceR);

  case _indent:
    raise(tokStart, "Unexpected indent");

  case _else:
    raise(tokPos, '`else` needs to line up with its `if`.');

  default:
    unexpected();
  }
}

function parseList() {
  var node = startNode();
  node.arguments = [];
  next();

  if (!eat(_bracketR)) {
    var expr = parseExprOps(false);
    if (tokType === _for || tokType === _if) {
      var tmpVarSuffix = newAstIdCount++;
      expr = nc.createListCompPush(expr, tmpVarSuffix);
      var body = parseCompIter(expr, true);
      finishNode(node);
      return nc.createListCompIife(node, body, tmpVarSuffix);

    } else if (eat(_comma)) {
      node.arguments = [expr].concat(parseExprList(_bracketR, true, false));
    }
    else {
      expect(_bracketR);
      node.arguments = [expr];
    }
  }

  finishNode(node, "NewExpression");
  var runtimeId = nc.createNodeSpan(node, node, "Identifier", { name: runtimeParamName });
  var objectsId = nc.createNodeSpan(node, node, "Identifier", { name: "objects" });
  var runtimeMember = nc.createNodeSpan(node, node, "MemberExpression", { object: runtimeId, property: objectsId, computed: false });
  var listId = nc.createNodeSpan(node, node, "Identifier", { name: "list" });
  node.callee = nc.createNodeSpan(node, node, "MemberExpression", { object: runtimeMember, property: listId, computed: false });
  return node;
}

function parseCompIter(expr, first) {
  if (first && tokType !== _for) unexpected();
  if (eat(_bracketR)) return expr;
  var node = startNode();
  if (eat(_for)) {
    var init = parseExpression(false, true);
    var tupleArgs = getTupleArgs(init);
    if (!tupleArgs) checkLVal(init);
    expect(_in);
    var right = parseExpression();
    var body = parseCompIter(expr, false);
    var block = nc.createNodeSpan(body, body, "BlockStatement", { body: [body] });
    finishNode(node, "BlockStatement");
    return nc.createFor(node, init, tupleArgs, right, block);
  } else if (eat(_if)) {
    if (tokType === _parenL) node.test = parseParenExpression();
    else node.test = parseExpression();
    node.consequent = parseCompIter(expr, false);
    return finishNode(node, "IfStatement");
  } else unexpected();
}

function parseClass(ctorNode) {
  var container = startNodeFrom(ctorNode);
  container.body = [];

  ctorNode.id = parseIdent();
  ctorNode.params = [];
  var classParams = [];
  if (eat(_parenL)) {
    var first = true;
    while (!eat(_parenR)) {
      if (!first) expect(_comma); else first = false;
      classParams.push(parseIdent());
    }
  }
  if (classParams.length > 1) raise(tokPos, "Multiple inheritance not supported");
  expect(_colon);

  scope.startClass(ctorNode.id.name);

  var classBodyRefNode = finishNode(startNode());

  var classBlock = parseSuite();

  var classStmt = nc.createClass(container, ctorNode, classParams, classBodyRefNode, classBlock);

  scope.end();

  return classStmt;
}

function parseDict(tokClose) {
  var node = startNode(), first = true, key, value;
  node.arguments = [];
  next();
  while (!eat(tokClose)) {
    if (!first) {
      expect(_comma);
    } else first = false;

    if (tokClose === _braceR) {
      key = parsePropertyName();
      expect(_colon);
      value = parseExprOps(false);
    } else if (tokClose === _parenR) {
      var keyId = parseIdent(true);
      key = startNodeFrom(keyId);
      key.value = keyId.name;
      finishNode(key, "Literal");
      expect(_eq);
      value = parseExprOps(false);
    } else unexpected();
    node.arguments.push(nc.createNodeSpan(key, value, "ArrayExpression", { elements: [key, value] }));
  }
  finishNode(node, "NewExpression");

  var runtimeId = nc.createNodeSpan(node, node, "Identifier", { name: runtimeParamName });
  var objectsId = nc.createNodeSpan(node, node, "Identifier", { name: "objects" });
  var runtimeMember = nc.createNodeSpan(node, node, "MemberExpression", { object: runtimeId, property: objectsId, computed: false });
  var listId = nc.createNodeSpan(node, node, "Identifier", { name: "dict" });
  node.callee = nc.createNodeSpan(node, node, "MemberExpression", { object: runtimeMember, property: listId, computed: false });

  return node;
}

function parsePropertyName() {
  if (tokType === _num || tokType === _string) return parseExprAtom();
  return parseIdent(true);
}

function parseFunction(node) {
  var suffix = newAstIdCount++;
  node.id = parseIdent();
  node.params = [];

  var formals = [];
  var argsId = null;
  var kwargsId = null;
  var defaultsFound = false;
  var first = true;

  scope.startFn(node.id.name);

  expect(_parenL);
  while (!eat(_parenR)) {
    if (!first) expect(_comma); else first = false;
    if (tokVal === '*') {
      if (kwargsId) raise(tokPos, "invalid syntax");
      next(); argsId = parseIdent();
    } else if (tokVal === '**') {
      next(); kwargsId = parseIdent();
    } else {
      if (kwargsId) raise(tokPos, "invalid syntax");
      var paramId = parseIdent();
      if (eat(_eq)) {
        formals.push({ id: paramId, expr: parseExprOps(false) });
        defaultsFound = true;
      } else {
        if (defaultsFound) raise(tokPos, "non-default argument follows default argument");
        if (argsId) raise(tokPos, "missing required keyword-only argument");
        formals.push({ id: paramId, expr: null });
      }
      scope.addVar(paramId.name);
    }
  }
  expect(_colon);

  var oldInFunc = inFunction = true;

  if (scope.isParentClass()) {
    var selfId = formals.shift();
    scope.setThisReplace(selfId.id.name);
  }

  var body = parseSuite();
  node.body = nc.createNodeSpan(body, body, "BlockStatement", { body: [] });

  var r = node.id;
  var __hasParams = nc.createNodeSpan(r, r, "Identifier", { name: '__hasParams' + suffix });
  var __params = nc.createNodeSpan(node.id, node.id, "Identifier", { name: '__params' + suffix });
  var __realArgCount = nc.createNodeSpan(node.id, node.id, "Identifier", { name: '__realArgCount' + suffix });
  var paramHandler = [];

  if (formals.length > 0 || argsId || kwargsId) {
    var argumentsLen = nc.createNodeSpan(r, r, "BinaryExpression", {
      operator: '-',
      left: nc.createNodeMembIds(r, 'arguments', 'length'),
      right: nc.createNodeSpan(r, r, "Literal", { value: 1 })
    });

    var argumentsN = nc.createNodeSpan(r, r, "MemberExpression", {
      computed: true, object: nc.createNodeSpan(r, r, "Identifier", { name: 'arguments' }),
      property: argumentsLen
    });

    var setHasParams = nc.createNodeSpan(r, r, "LogicalExpression", {
      operator: '&&',
      left: nc.createNodeSpan(r, r, "LogicalExpression", {
        operator: '&&',
        left: nc.createNodeSpan(r, r, "BinaryExpression", {
          operator: '>',
          left: nc.createNodeMembIds(r, 'arguments', 'length'),
          right: nc.createNodeSpan(r, r, "Literal", { value: 0 })
        }),
        right: argumentsN
      }),
      right: nc.createNodeSpan(r, r, "MemberExpression", {
        computed: false, object: argumentsN,
        property: nc.createNodeSpan(r, r, "Identifier", { name: 'keywords' }),
      })
    });

    node.body.body.push(nc.createGeneratedVarDeclFromId(r, __hasParams, setHasParams));

    var setParams = nc.createNodeSpan(r, r, "ConditionalExpression", {
      test: __hasParams,
      consequent: nc.createNodeSpan(r, r, "MemberExpression", {
        computed: false, object: argumentsN,
        property: nc.createNodeSpan(r, r, "Identifier", { name: 'keywords' }),
      }),
      alternate: nc.createNodeSpan(r, r, "ObjectExpression", { properties: [] })
    });
    paramHandler.push(nc.createGeneratedVarDeclFromId(r, __params, setParams));

    var setRealArgCount = (nc.createGeneratedVarDeclFromId(node.id,
      __realArgCount,
      nc.createNodeSpan(node.id, node.id, "BinaryExpression", {
        operator: '-',
        left: nc.createNodeMembIds(node.id, 'arguments', 'length'),
        right: nc.createNodeSpan(node.id, node.id, "ConditionalExpression", {
          test: __hasParams,
          consequent: nc.createNodeSpan(node.id, node.id, "Literal", { value: 1 }),
          alternate: nc.createNodeSpan(node.id, node.id, "Literal", { value: 0 })
        })
      })
    ));

    paramHandler.push(setRealArgCount);
  }

  for (var i = 0; i < formals.length; ++i) {
    node.params.push(formals[i].id);
    for (var j = 0; j < i; ++j) if (formals[i].id.name === formals[j].id.name)
      raise(formals[i].id.start, "Argument name clash");
  }
  var fastModePossible = true;
  
  for ( i = 0; i < formals.length; ++i) {
    if ( formals[i].expr ) fastModePossible = false;
    var argName = nc.createNodeSpan(node.id, node.id, "Identifier", { name: formals[i].id.name });
    var argNameStr = nc.createNodeSpan(node.id, node.id, "Literal", { value: formals[i].id.name });
    var argSet = nc.createNodeSpan(node.id, node.id, "AssignmentExpression", {
      operator: '=',
      left: argName,
      right: nc.createNodeSpan(node.id, node.id, "ConditionalExpression", {
        test: nc.createNodeSpan(node.id, node.id, "BinaryExpression", { operator: 'in', left: argNameStr, right: __params }),
        consequent: nc.createNodeSpan(node, node, "MemberExpression", { object: __params, property: argNameStr, computed: true }),
        alternate: formals[i].expr ? formals[i].expr : nc.createNodeSpan(node.id, node.id, "Identifier", { name: 'undefined' })
      })
    });

    var argCheck = nc.createNodeSpan(node.id, node.id, "IfStatement", {
      test: nc.createNodeSpan(node.id, node.id, "BinaryExpression", {
        operator: '<',
        left: __realArgCount,
        right:  nc.createNodeSpan(node.id, node.id, "Literal", { value: i+1 })
      }),
      consequent: nc.createNodeSpan(node.id, node.id, "ExpressionStatement", { expression: argSet })
    });

    paramHandler.push(argCheck);
  }

  if ( paramHandler.length  > 0 ) {
    if ( fastModePossible ) {
          node.body.body.push(nc.createNodeSpan(node.id, node.id, "IfStatement", {
        test: __hasParams,
        consequent: nc.createNodeSpan(node.id, node.id, "BlockStatement", {body: paramHandler})
      }));
    } else {
      Array.prototype.push.apply(node.body.body, paramHandler);
    }
  }

  if (argsId) {
    node.body.body.push(nc.createGeneratedVarDeclFromId(node.id,
      nc.createNodeSpan(node.id, node.id, "Identifier", { name: '__formalsIndex' + suffix }),
      nc.createNodeSpan(node.id, node.id, "Literal", { value: formals.length })));

    var argsAssign = nc.createGeneratedVarDeclFromId(argsId, argsId, nc.createNodeSpan(argsId, argsId, "ArrayExpression", { elements: [] }));
    node.body.body.push(argsAssign);
    node.body.body.push(nc.createNodeArgsWhileConsequent(argsId, suffix));
    
  }

  if (kwargsId) {
    for (var i = 0; i < formals.length; ++i) {
      var formalDelete = nc.createNodeSpan(kwargsId, kwargsId, "ExpressionStatement", {
        expression: nc.createNodeSpan(kwargsId, kwargsId, "UnaryExpression", {
          operator: 'delete',
          prefix: true,
          argument: nc.createNodeSpan(kwargsId, kwargsId, "MemberExpression", {
            object: __params,
            property: nc.createNodeSpan(node.id, node.id, "Identifier", { name: formals[i].id.name }),
            computed: false 
          })
        })
      });
      node.body.body.push(formalDelete);
    }

    var kwargsAssign = nc.createGeneratedVarDeclFromId(kwargsId, kwargsId, __params);
    node.body.body.push(kwargsAssign);
  }

  node.body.body.push.apply(node.body.body, body.body);

  inFunction = oldInFunc;

  var retNode;
  if (scope.isParentClass()) {
    finishNode(node);
    var classId = nc.createNodeSpan(node, node, "Identifier", { name: scope.getParentClassName() });
    var prototypeId = nc.createNodeSpan(node, node, "Identifier", { name: "prototype" });
    var functionId = node.id;
    var prototypeMember = nc.createNodeSpan(node, node, "MemberExpression", { object: classId, property: prototypeId, computed: false });
    var functionMember = nc.createNodeSpan(node, node, "MemberExpression", { object: prototypeMember, property: functionId, computed: false });
    var functionExpr = nc.createNodeSpan(node, node, "FunctionExpression", { body: node.body, params: node.params });
    var assignExpr = nc.createNodeSpan(node, node, "AssignmentExpression", { left: functionMember, operator: "=", right: functionExpr });
    retNode = nc.createNodeSpan(node, node, "ExpressionStatement", { expression: assignExpr });
  } else retNode = finishNode(node, "FunctionDeclaration");

  scope.end();

  return retNode;
}

function parseExprList(close, allowTrailingComma, allowEmpty) {
  var elts = [], first = true;
  while (!eat(close)) {
    if (!first) {
      expect(_comma);
      if (allowTrailingComma && eat(close)) break;
    } else first = false;

    if (allowEmpty && tokType === _comma) elts.push(null);
    else elts.push(parseExprOps(false));
  }
  return elts;
}

function parseParamsList() {
  var elts = [], first = true;
  while (!eat(_parenR)) {
    if (!first) expect(_comma);
    else first = false;
    var expr = parseExprOps(false);
    if (eat(_eq)) {
      var right = parseExprOps(false);
      var kwId = nc.createNodeSpan(expr, right, "Identifier", {name:"__kwp"});
      var kwLit = nc.createNodeSpan(expr, right, "Literal", {value:true});
      var left = nc.createNodeSpan(expr, right, "ObjectExpression", { properties: [] });
      left.isntFormal = true;
      left.properties.push({ type: "Property", key: expr, value: right, kind: "init" });
      left.properties.push({ type: "Property", key: kwId, value: kwLit, kind: "init" });
      expr = left;
    }
    elts.push(expr);
  }
  return elts;
}

function parseIdent(liberal) {
  var node = startNode();
  if (liberal) liberal = false;
  if (tokType === _name) {
    if (!liberal && strict && input.slice(tokStart, tokEnd).indexOf("\\") == -1)
      raise(tokStart, "The keyword '" + tokVal + "' is reserved");
    node.name = tokVal;
  } else if (liberal && tokType.keyword) {
    node.name = tokType.keyword;
  } else {
    unexpected();
  }
  tokRegexpAllowed = false;
  next();
  return finishNode(node, "Identifier");
}

function parseTuple(noIn, expr) {
  var node = expr ? startNodeFrom(expr) : startNode();
  node.arguments = expr ? [expr] : [];
  
  if (tokType === _comma) {
    var oldPos = tokPos; skipSpace();
    var newPos = tokPos; tokPos = oldPos;
    if (newPos >= inputLen || input[newPos] === ';' || input[newPos] === ')' || newline.test(input[newPos]))
      eat(_comma);
  }

  while (eat(_comma)) {
    node.arguments.push(parseExprOps(noIn));
  }
  finishNode(node, "NewExpression");

  var runtimeId = nc.createNodeSpan(node, node, "Identifier", { name: runtimeParamName });
  var objectsId = nc.createNodeSpan(node, node, "Identifier", { name: "objects" });
  var runtimeMember = nc.createNodeSpan(node, node, "MemberExpression", { object: runtimeId, property: objectsId, computed: false });
  var listId = nc.createNodeSpan(node, node, "Identifier", { name: "tuple" });
  node.callee = nc.createNodeSpan(node, node, "MemberExpression", { object: runtimeMember, property: listId, computed: false });

  return node;
}

var pythonRuntime = {
  internal: {
    isSeq: function (a) { return a && (a._type === "list" || a._type === "tuple"); },
    slice: function (obj, start, end, step) {
      if (step == null || step === 0) step = 1;
      if (start == null) {
        if (step < 0) start = obj.length - 1;
        else start = 0;
      } else if (start < 0) start += obj.length;
      if (end == null) {
        if (step < 0) end = -1;
        else end = obj.length;
      } else if (end < 0) end += obj.length;

      var ret = new pythonRuntime.objects.list(), tmp, i;
      if (step < 0) {
        tmp = obj.slice(end + 1, start + 1);
        for (i = tmp.length - 1; i >= 0; i += step) ret.append(tmp[i]);
      } else {
        tmp = obj.slice(start, end);
        if (step === 1) ret = pythonRuntime.utils.createList(tmp);
        else for (i = 0; i < tmp.length; i += step) ret.append(tmp[i]);
      }
      return ret;
    },
    isJSArray: Array.isArray || function(obj) {
      return toString.call(obj) === '[object Array]';
    }
  },

  utils: {
    createDict: function () {
      var ret = new pythonRuntime.objects.dict();
      if (arguments.length === 1 && arguments[0] instanceof Object)
        for (var k in arguments[0]) ret[k] = arguments[0][k];
      else
        throw TypeError("createDict expects a single JavaScript object");
      return ret;
    },
    createParamsObj: function () {
      var params = { formals: new pythonRuntime.objects.list(), keywords: new PythonDict() };
      for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] && arguments[i].__kwp === true) {
          for (var k in arguments[i])
            if (k !== '__kwp') params.keywords[k] = arguments[i][k];
        }
        else params.formals.push(arguments[i]);
      }
      return params;
    },
    convertToList: function (list) {
      Object.defineProperties(list, pythonRuntime.utils.listPropertyDescriptor);
      return list;
    },
    convertToDict: function (dict) {
      Object.defineProperties(dict, pythonRuntime.utils.dictPropertyDescriptor);
      return dict;
    }, 
    listPropertyDescriptor: {
        "_type": {
          get: function () { return 'list'; },
          enumerable: false
        },
        "_isPython": {
          get: function () { return true; },
          enumerable: false
        },
        "append": {
          value: function (x) {
            this.push(x);
          },
          enumerable: false
        },
        "clear": {
          value: function () {
            this.splice(0, this.length);
          },
          enumerable: false
        },
        "copy": {
          value: function () {
            return this.slice(0);
          },
          enumerable: false
        },
        "count": {
          value: function (x) {
            var c = 0;
            for (var i = 0; i < this.length; i++)
              if (this[i] === x) c++;
            return c;
          },
          enumerable: false
        },
        "equals": {
          value: function (x) {
            try {
              if (this.length !== x.length) return false;
              for (var i = 0; i < this.length; i++) {
                if (this[i].hasOwnProperty("equals")) {
                  if (!this[i].equals(x[i])) return false;
                } else if (this[i] !== x[i]) return false;
              }
              return true;
            }
            catch (e) { }
            return false;
          },
          enumerable: false
        },
        "extend": {
          value: function (L) {
            for (var i = 0; i < L.length; i++) this.push(L[i]);
          },
          enumerable: false
        },
        "index": {
          value: function (x) {
            return this.indexOf(x);
          },
          enumerable: false
        },
        "indexOf": {
          value: function (x, fromIndex) {
            try {
              for (var i = fromIndex ? fromIndex : 0; i < this.length; i++) {
                if (this[i].hasOwnProperty("equals")) {
                  if (this[i].equals(x)) return i;
                } else if (this[i] === x) return i;
              }
            }
            catch (e) { }
            return -1;
          },
          enumerable: false
        },
        "insert": {
          value: function (i, x) {
            this.splice(i, 0, x);
          },
          enumerable: false
        },
        "pop": {
          value: function (i) {
            if (!i && i !== 0)
              i = this.length - 1;
            var item = this[i];
            this.splice(i, 1);
            return item;
          },
          enumerable: false
        },
        "_pySlice": {
          value: function (start, end, step) {
            return pythonRuntime.internal.slice(this, start, end, step);
          },
          enumerable: false
        },
        "remove": {
          value: function (x) {
            this.splice(this.indexOf(x), 1);
          },
          enumerable: false
        },
        "sort": {
          value: function(x, reverse) {
            var list2 = this.slice(0);
            var apply_key = function(a, numerical) {
              var list3 = list2.map(x);
              var mapping = {}
              for(var i in list3) mapping[list3[i]] = list2[i];
              if(numerical)
                list3.sort(function(a, b) { return a - b; });
              else
                list3.sort()
              for(var i in a) a[i] = mapping[list3[i]];
            }
            for(var i in this) {
              if(typeof this[i] !== 'number' || !isFinite(this[i])) {
                if(typeof x != 'undefined') {
                  apply_key(this, false);
                }
                else {
                  list2.sort();
                  for (var j in this) this[j] = list2[j];
                }
                if(reverse)
                  this.reverse();
                return;
              }
            }
            if(typeof x != 'undefined') {
              apply_key(this, true);
            }
            else {
              list2.sort(function(a, b) { return a - b; });
              for(var i in this) this[i] = list2[i];
            }
            if(reverse)
              this.reverse();
          },
          enumerable: false
        },
        "toString": {
          value: function () {
            return '[' + this.join(', ') + ']';
          },
          enumerable: false
        }
    },
    createList: function () {
      var ret = new pythonRuntime.objects.list();
      if (arguments.length === 1 && arguments[0] instanceof Array)
        for (var i in arguments[0]) ret.push(arguments[0][i]);
      else
        for (var i in arguments) ret.push(arguments[i]);
      return ret;
    },
    dictPropertyDescriptor: {
      "_type": {
        get: function () { return 'dict';},
        enumerable: false
      },
      "_isPython": {
        get: function () { return true; },
        enumerable: false
      },
      "items": {
        value: function () {
          var items = new pythonRuntime.objects.list();
          for (var k in this) items.append(new pythonRuntime.objects.tuple(k, this[k]));
          return items;
        },
        enumerable: false
      },
      "length": {
        get: function () {
          return Object.keys(this).length;
        },
        enumerable: false
      },
      "clear": {
        value: function () {
          for (var i in this) delete this[i];
        },
        enumerable: false
      },
      "get": {
        value: function (key, def) {
          if (key in this) return this[key];
          else if (def !== undefined) return def;
          return null;
        },
        enumerable: false
      },
      "keys": {
        value: function () {
          return Object.keys(this);
        },
        enumerable: false
      },
      "pop": {
        value: function (key, def) {
          var value;
          if (key in this) {
            value = this[key];
            delete this[key];
          } else if (def !== undefined) value = def;
          else return new Error("KeyError");
          return value;
        },
        enumerable: false
      }, "values": {
        value: function () {
          var values = new pythonRuntime.objects.list();
          for (var key in this) values.append(this[key]);
          return values;
        },
        enumerable: false
      }
    }
  },
  ops: {
    add: function (a, b) {
      if (typeof a === 'object' && pythonRuntime.internal.isSeq(a) && pythonRuntime.internal.isSeq(b)) {
        if (a._type !== b._type)
          throw TypeError("can only concatenate " + a._type + " (not '" + b._type + "') to " + a._type);
        var ret;
        if (a._type === 'list') ret = new pythonRuntime.objects.list();
        else if (a._type === 'tuple') ret = new pythonRuntime.objects.tuple();
        if (ret) {
          for (var i = 0; i < a.length; i++) ret.push(a[i]);
          for (var i = 0; i < b.length; i++) ret.push(b[i]);
          return ret;
        }
      }
      return a + b;
    },
    in: function (a, b, n) {
      var r = b.hasOwnProperty('indexOf') ? b.indexOf(a) >= 0 : a in b;
      return n ? !r : r;
    },
    multiply: function (a, b) {
      if ( typeof a === 'object' ) {
        if (pythonRuntime.internal.isSeq(a) && !isNaN(parseInt(b))) {
          var ret;
          if (a._type === 'list') ret = new pythonRuntime.objects.list();
          else if (a._type === 'tuple') ret = new pythonRuntime.objects.tuple();
          if (ret) {
            for (var i = 0; i < b; i++)
              for (var j = 0; j < a.length; j++) ret.push(a[j]);
            return ret;
          }
        } else if (pythonRuntime.internal.isSeq(b) && !isNaN(parseInt(a))) {
          var ret;
          if (b._type === 'list') ret = new pythonRuntime.objects.list();
          else if (b._type === 'tuple') ret = new pythonRuntime.objects.tuple();
          if (ret) {
            for (var i = 0; i < a; i++)
              for (var j = 0; j < b.length; j++) ret.push(b[j]);
            return ret;
          }
        }
      }
      return a * b;
    },
    subscriptIndex: function (o, i) {
      if ( i >= 0 ) return i;
      if ( pythonRuntime.internal.isSeq(o) ) return o.length + i;
      if ( pythonRuntime.internal.isJSArray(o) ) return o.length + i;
      if ( typeof o === "string" ) return o.length + i;
      return i;
    }
  },

  objects: {
    dict: function () {
      var obj = new PythonDict();
      for (var i = 0; i < arguments.length; ++i ) obj[arguments[i][0]] = arguments[i][1];
      return obj;
    },
    list: function () {
      var arr = [];
      arr.push.apply(arr, arguments);
      pythonRuntime.utils.convertToList(arr);
      return arr;
    },
    tuple: function () {
      var arr = [];
      arr.push.apply(arr, arguments);
      Object.defineProperty(arr, "_type",
      {
        get: function () { return 'tuple'; },
        enumerable: false
      });
      Object.defineProperty(arr, "_isPython",
      {
        get: function () { return true; },
        enumerable: false
      });
      Object.defineProperty(arr, "count",
      {
        value: function (x) {
          var c = 0;
          for (var i = 0; i < this.length; i++)
            if (this[i] === x) c++;
          return c;
        },
        enumerable: false
      });
      Object.defineProperty(arr, "equals",
      {
        value: function (x) {
          try {
            if (this.length !== x.length) return false;
            for (var i = 0; i < this.length; i++) {
              if (this[i].hasOwnProperty("equals")) {
                if (!this[i].equals(x[i])) return false;
              } else if (this[i] !== x[i]) return false;
            }
            return true;
          }
          catch (e) { }
          return false;
        },
        enumerable: false
      });
      Object.defineProperty(arr, "index",
      {
        value: function (x) {
          return this.indexOf(x);
        },
        enumerable: false
      });
      Object.defineProperty(arr, "indexOf",
      {
        value: function (x, fromIndex) {
          try {
            for (var i = fromIndex ? fromIndex : 0; i < this.length; i++) {
              if (this[i].hasOwnProperty("equals")) {
                if (this[i].equals(x)) return i;
              } else if (this[i] === x) return i;
            }
          }
          catch (e) { }
          return -1;
        },
        enumerable: false
      });
      Object.defineProperty(arr, "_pySlice",
      {
        value: function (start, end, step) { 
          return pythonRuntime.internal.slice(this, start, end, step);
        },
          enumerable: false
      });
      Object.defineProperty(arr, "toString",
      {
        value: function () {
          var s = '(' + this.join(', ');
          if (this.length === 1) s += ',';
          s += ')';
          return s;
        },
        enumerable: false
      });
      return arr;
    }
  },

  functions: {
    abs: function(x) {
      return Math.abs(x);
    },
    all: function(iterable) {
      for (var i in iterable) if (pythonRuntime.functions.bool(iterable[i]) !== true) return false;
      return true;
    },
    any: function(iterable) {
      for (var i in iterable) if (pythonRuntime.functions.bool(iterable[i]) === true) return true;
      return false;
    },
    ascii: function(obj) {
      var s = pythonRuntime.functions.repr(obj),
          asc = "",
          code;
      for (var i = 0; i < s.length; i++) {
        code = s.charCodeAt(i);
        if (code <= 127) asc += s[i];
        else if (code <= 0xFF) asc += "\\x" + code.toString(16);
        else if (0xD800 <= code && code <= 0xDBFF) { // UCS-2 for the astral chars
          code = ((code-0xD800)*0x400)+(s.charCodeAt(++i)-0xDC00)+0x10000;
          asc += "\\U" + ("000"+code.toString(16)).slice(-8);
        } else if (code <= 0xFFFF) asc += "\\u" + ("0"+code.toString(16)).slice(-4);
        else if (code <= 0x10FFFF) asc += "\\U" + ("000"+code.toString(16)).slice(-8);
        else;
      }
      return asc;
    },
    bool: function(x) {
      return !(x === undefined || // No argument
                x === null || // None
                x === false || // False
                x === 0 || // Zero
                x.length === 0 || // Empty Sequence
                (x.__bool__ !== undefined && x.__bool__() === false) || // If it has bool conversion defined
                (x.__len__ !== undefined && (x.__len__() === false || x.__len__() === 0))); // If it has length conversion defined
    },
    chr: function(i) {
      return String.fromCharCode(i);
    },
    divmod: function(a, b) {
      return pythonRuntime.objects.tuple(Math.floor(a/b), a%b);
    },
    enumerate: function(iterable, start) {
      start = start || 0;
      var ret = new pythonRuntime.objects.list();
      for (var i in iterable) ret.push(new pythonRuntime.objects.tuple(start++, iterable[i]));
      return ret;
    },
    filter: function(fn, iterable) {
      fn = fn || function () { return true; };
      var ret = new pythonRuntime.objects.list();
      for (var i in iterable) if (fn(iterable[i])) ret.push(iterable[i]);
      return ret;
    },
    float: function(x) {
      if (x === undefined) return 0.0;
      else if (typeof x == "string") { 
        x = x.trim().toLowerCase();
        if ((/^[+-]?inf(inity)?$/i).exec(x) !== null) return Infinity*(x[0]==="-"?-1:1);
        else if ((/^nan$/i).exec(x) !== null) return NaN;
        else return parseFloat(x);
      } else if (typeof x == "number") {
        return x;
      } else {
        if (x.__float__ !== undefined) return x.__float__();
        else return null;
      }
    },
    hex: function(x) {
      return x.toString(16);
    },
    int: function (s) {
      return parseInt(s);
    },
    len: function (o) {
      return o.length;
    },
    list: function (iterable) {
      var ret = new pythonRuntime.objects.list();
      if (iterable instanceof Array) for (var i in iterable) ret.push(iterable[i]);
      else for (var i in iterable) ret.push(i);
      return ret;
    },
    map: function(fn, iterable) {
      var ret = new pythonRuntime.objects.list();
      for (var i in iterable) ret.push(fn(iterable[i]));
      return ret;
    },
    max: function(arg1, arg2) {
      if (!arg2) { // iterable
        var max = null;
        for (var i in arg1) if (max === null || arg1[i] > max) max = arg1[i];
        return max;
      } else return arg1 >= arg2 ? arg1 : arg2;
    },
    min: function(arg1, arg2) {
      if (!arg2) { // iterable
        var max = null;
        for (var i in arg1) if (max === null || arg1[i] < max) max = arg1[i];
        return max;
      } else return arg1 <= arg2 ? arg1 : arg2;
    },
    oct: function(x) {
      return x.toString(8);
    },
    ord: function(c) {
      return c.charCodeAt(0);
    },
    pow: function(x, y, z) {
      return z ? Math.pow(x, y) % z : Math.pow(x, y);
    },
    print: function () {
      var s = "";
      for (var i = 0; i < arguments.length; i++)
        s += i === 0 ? arguments[i] : " " + arguments[i];
    },
    range: function (start, stop, step) {
      if (stop === undefined) {
        stop = start;
        start = 0;
        step = 1;
      }
      else if (step === undefined) step = 1;
      var len = ~~((stop - start) / step); //~~ is a fast floor
      var r = new Array(len);
      var element = 0;
      if (start < stop && step > 0 || start > stop && step < 0) {
        var i = start;
        while (i < stop && step > 0 || i > stop && step < 0) {
          r[element++] = i;
          i += step;
        }
      }
      pythonRuntime.utils.convertToList(r);
      return r;
    },
    repr: function (obj) {
      if (typeof obj === 'string') return "'" + obj + "'";
      if (obj.__repr__ !== undefined) return obj.__repr__();
      else if (obj.__class__ !== undefined && obj.__class__.module !== undefined && obj.__class__.__name__) {
        return '<'+obj.__class__.__module__+'.'+obj.__class__.__name__+' object>';
      } else return obj.toString();
    },
    reversed: function (seq) {
      var ret = new pythonRuntime.objects.list();
      for (var i in seq) ret.push(seq[i]);
      return ret.reverse();
    },
    round: function (num, ndigits) {
      if (ndigits) {
        var scale = Math.pow(10, ndigits);
        return Math.round(num * scale) / scale;
      }
      return Math.round(num);
    },
    sorted: function (iterable, key, reverse) {
      var ret = new pythonRuntime.objects.list();
      for (var i in iterable) ret.push(iterable[i]);
      if(key) ret.sort(key); else ret.sort();
      if (reverse) ret.reverse();
      return ret;
    },
    str: function (obj) {
      return obj.toString();
    },
    sum: function (iterable, start) {
      var ret = start || 0;
      for (var i in iterable) ret += iterable[i];
      return ret;
    },
    tuple: function (iterable) {
      var ret = new pythonRuntime.objects.tuple();
      for (var i in iterable) ret.push(iterable[i]);
      return ret;
    }
  },

  imports: {
    random: {
      random: function () { return Math.random(); }
    }
  }
};
//#endregion