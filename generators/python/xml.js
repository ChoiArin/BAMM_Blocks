goog.provide('Blockly.Python.xml');

goog.require('Blockly.Python');
goog.require('Blockly.Xml');

function fillIt(tar) {
  var args = Array.prototype.slice.call(arguments, 1);
  return tar.replace(/{(\d+)}/g, function(match, num) { 
    return typeof args[num] != 'undefined' ? args[num] : match;
  });
};

Blockly.Python.xml.fromAST = function(AST) {
  var varCode = '<variables>', code = '';

  code = coBun(varCode, AST);
  
  varCode += '</variables>';

  return '<xml>' + varCode + code + '</xml>';
};

function coBun(varCode, AST) {
  var code = {head: '', tail: ''};

  for(o in AST.body) {
    var exp = AST.body[o];
    if(exp.type === 'VariableDeclaration') {
      var initType = exp.declarations[0].init.type;
      var bCode = '<variable type="{0}">{1}</variable>';
      varCode += fillIt(bCode, initType === 'Literal' ? '' : 'list', exp.declarations[0].id.name);
      if(exp.declarations[0].init.value !== null) {
        Blockly.Python.xml[initType](code, exp.declarations[0]);
      }
    } else if (exp.type === 'ExpressionStatement') {
      if(exp.expression.type === 'CallExpression') {
        Blockly.Python.xml[exp.expression.callee.property.name](code, exp.expression.arguments);
      } else if (exp.expression.type === 'AssignmentExpression' || exp.expression.type === 'BinaryExpression' || exp.expression.type === 'LogicalExpression' || exp.expression.type === 'UnaryExpression') {
        Blockly.Python.xml[exp.expression.operator](code, exp.expression);
      } else  if(exp.expression.type === 'MemberExpression') {
        Blockly.Python.xml[exp.expression.property.name](code, exp.expression.object);
      } 
    } else if (exp.type === 'IfStatement') {
      code.head += '<block type="control_if' + (exp.alternate ? '_else' : '') + '">';
      if(exp.test.type === 'Literal' && exp.test.value !== false && exp.test.value !== true) {
        
      } else if (exp.test.type === 'BinaryExpression' || exp.test.type === 'LogicalExpression' || exp.test.type === 'UnaryExpression') {
        code.head += '<value name="CONDITION">';
        Blockly.Python.xml[exp.test.operator](code, exp.test);
        code.head += '</value>';
      }
      code.head += '<statement name="SUBSTACK">';
      code.head += coBun(varCode, exp.consequent);
      code.head += '</statement>';
      
      if(exp.alternate) {
        code.head += '<statement name="SUBSTACK2">';
        code.head += coBun(varCode, exp.alternate);
        code.head += '</statement>';
      }

      code.head += '<next>';
      code.tail = '</next></block>' + code.tail;
    } else if (exp.type === 'WhileStatement') {
      code.head += '<block type="control_repeat_until">';
      if(exp.test.type === 'Literal' && exp.test.value !== false && exp.test.value !== true) {
        
      } else if (exp.test.type === 'BinaryExpression' || exp.test.type === 'LogicalExpression' || exp.test.type === 'UnaryExpression') {
        code.head += '<value name="CONDITION">';
        Blockly.Python.xml[exp.test.operator](code, exp.test);
        code.head += '</value>';
      }
      code.head += '<statement name="SUBSTACK">';
      code.head += coBun(varCode, exp.body);
      code.head += '</statement>';
      code.head += '<next>';
      code.tail = '</next></block>';
    } else if (exp.type === 'BlockStatement') {
      if(exp.body[0].type === 'VariableDeclaration' && exp.body[1].type === 'IfStatement' && exp.body[1].alternate.type === 'BlockStatement') { //for..?
        if(exp.body[1].alternate.body[0].type === 'ForInStatement') {
          var bCode = '<block type="control_repeat"><value name="TIMES"><shadow type="math_whole_number"><field name="NUM">{0}</field></shadow></value>';
          code.head += fillIt(bCode, exp.body[0].declarations[0].init.arguments[0].value);
          code.head += '<statement name="SUBSTACK">';
          code.head += coBun(varCode, exp.body[1].alternate.body[0].body);
          code.head += '</statement>';
          code.head += '<next>';
          code.tail = '</next></block>';
        }
      }
    }  else if (exp.type === 'BreakStatement') {
      code.head += '<block type="control_stop"><mutation hasnext="false"></mutation><field name="STOP_OPTION">this script</field></block>';
    } else if (exp.type === 'EmptyStatement') {
      //Empty
    }
  }

  return code.head + code.tail;
}

Blockly.Python.xml['Literal'] = function(code, declr) {
  var bCode = '<block type="data_setvariableto"><field name="VARIABLE">{0}</field><value name="VALUE"><shadow type="text"><field name="TEXT">{1}</field></shadow></value>'
  code.head += fillIt(bCode, declr.id.name, declr.init.value === null ? '\'\'' : declr.init.raw) + '<next>';
  code.tail = '</next></block>' + code.tail;
};

Blockly.Python.xml['NewExpression'] = function(code, args) {
  for(r in args.init.arguments) {
    var bCode = '<block type="data_addtolist"><field name="LIST">{0}</field><value name="ITEM"><shadow type="text"><field name="TEXT">{1}</field></shadow></value>';
    code.head += fillIt(bCode, args.id.name, args.init.arguments[r].raw) + '<next>';
    code.tail = '</next></block>' + code.tail;
  }
};

Blockly.Python.xml['add'] = function(code, args) {
  var bCode = '<block type="texts_join">';
  if(args[0].type === 'Literal') {
    bCode += '<value name="ADD0"><shadow type="text"><field name="TEXT">{0}</field></shadow>';
    code.head += fillIt(bCode, args[0].value);
  } else if (args[0].type === 'Identifier') {
    bCode += '<value name="ADD0"><shadow type="text"><field name="TEXT"></field></shadow><block type="data_variable"><field name="VARIABLE">{0}</field></block>';
    code.head += fillIt(bCode, args[0].name);
  } else if (args[0].type === 'CallExpression') {
    bCode += '<value name="ADD0"><shadow type="text"><field name="TEXT">';
    code.head += bCode;
    Blockly.Python.xml[args[0].callee.property.name](code, args[0].arguments);
    code.head += '</field></shadow>';
  }
  code.head += '</value>';

  bCode = '';
  if(args[1].type === 'Literal') {
    bCode += '<value name="ADD1"><shadow type="text"><field name="TEXT">{0}</field></shadow>';
    code.head += fillIt(bCode, args[1].value);
  } else if (args[1].type === 'Identifier') {
    bCode += '<value name="ADD1"><shadow type="text"><field name="TEXT"></field></shadow><block type="data_variable"><field name="VARIABLE">{0}</field></block>';
    code.head += fillIt(bCode, args[1].name);
  } else if (args[1].type === 'CallExpression') {
    bCode += '<value name="ADD1"><shadow type="text"><field name="TEXT">';
    code.head += bCode;
    Blockly.Python.xml[args[1].callee.property.name](code, args[1].arguments);
    code.head += '</field></shadow>';
  }
  code.head += '</value></block>';
};

Blockly.Python.xml['str'] = function(code, args) {
  code.head += args[0].value;
};

Blockly.Python.xml['length'] = function(code, args, merged) {
  var bCode = '<block type="' + (merged ? 'texts_isEmpty' : 'texts_length') + '">';
  if(args.type === 'Literal') {
    bCode += '<value name="VALUE"><shadow type="text"><field name="TEXT">{0}</field></shadow>';
    code.head += fillIt(bCode, args.value);
  } else if (args.type === 'Identifier') {
    bCode += '<value name="VALUE"><shadow type="text"><field name="TEXT"></field></shadow><block type="data_variable"><field name="VARIABLE">{0}</field></block>';
    code.head += fillIt(bCode, args.name);
  } else if (args.type === 'CallExpression') {
    bCode += '<value name="VALUE"><shadow type="text"><field name="TEXT"></field></shadow>';
    code.head += bCode;
    Blockly.Python.xml[args.callee.property.name](code, args.arguments);
  }
  code.head += '</value></block>';
};

Blockly.Python.xml['print'] = function(code, args) {
  var bCode = '<block type="texts_println">';
  if(args[0].type === 'Literal') {
    bCode += '<value name="TEXT"><shadow type="text"><field name="TEXT">{0}</field></shadow></value>';
    code.head += fillIt(bCode, args[0].value) + '<next>';
    code.tail = '</next></block>' + code.tail;
  } else if (args[0].type === 'Identifier') {
    bCode += '<value name="TEXT"><shadow type="text"><field name="TEXT"></field></shadow><block type="data_variable"><field name="VARIABLE">{0}</field></block></value>';
    code.head += fillIt(bCode, args[0].name) + '<next>';
    code.tail = '</next></block>' + code.tail;
  } else if (args[0].type === 'CallExpression') {
    bCode += '<value name="TEXT"><shadow type="text"><field name="TEXT"></field></shadow>';
    code.head += bCode;
    Blockly.Python.xml[args[0].callee.property.name](code, args[0].arguments);
    code.head += '</value><next>';
    code.tail = '</next></block>' + code.tail;
  }
};

Blockly.Python.xml['round'] = function(code, args) {
  var bCode = '<block type="operator_round">';
  if(args[0].type === 'Literal') {
    bCode += '<value name="NUM"><shadow type="math_number"><field name="NUM">{0}</field></shadow></value>';
    code.head += fillIt(bCode, args[0].raw);
  } else if (args[0].type === 'Identifier') {
    bCode += '<value name="NUM"><shadow type="math_number"><field name="NUM"></field></shadow><block type="data_variable"><field name="VARIABLE">{0}</field></block></value>';
    code.head += fillIt(bCode, args[0].name);
  }
  code.head += '</block>';
};

Blockly.Python.xml['='] = function(code, param) {
  var bCode = '<block type="data_setvariableto"><field name="VARIABLE">{0}</field>';
  
  if(param.right.type === 'Literal') {
    bCode += '<value name="VALUE"><shadow type="text"><field name="TEXT">{1}</field></shadow></value>';
    code.head += fillIt(bCode, param.left.name, param.right.raw) + '<next>';
  } else if(param.right.type === 'Identifier') {
    bCode += '<value name="VALUE"><shadow type="text"><field name="TEXT"></field></shadow><block type="data_variable"><field name="VARIABLE">{1}</field></block></value>';
    code.head += fillIt(bCode, param.left.name, param.right.name) + '<next>';
  } else if(param.right.type === 'CallExpression') {
    bCode += '<value name="VALUE"><shadow type="text"><field name="TEXT"></field></shadow>';
    code.head += bCode;
    Blockly.Python.xml[param.right.callee.property.name](code, param.right.arguments);
    code.head += '</value><next>';
  }
  code.tail = '</next></block>' + code.tail;
};

Blockly.Python.xml['operators'] = function(type, code, param) {
  code.head += '<block type="' + type + '">';

  var vName = 'VALUE';
  switch (type) {
    case 'operator_add':
    case 'operator_subtract':
    case 'operator_multifly':
    case 'operator_divide':
      vName = 'NUM'
      break;
    case 'operator_lt':
    case 'operator_equals':
    case 'operator_gt':
    case 'operator_and':
    case 'operator_or':
      vName = 'OPERAND'
      break;
  }
  
  if(param.left.type === 'Literal' && param.left.value !== false && param.left.value !== true) {
    var bCode = '<value name="' + vName + '1"><shadow type="text"><field name="TEXT">{0}</field></shadow></value>';
    code.head += fillIt(bCode, param.left.value);
  } else if(param.left.type === 'Identifier') {
    var bCode = '<value name="' + vName + '1"><shadow type="text"><field name="TEXT"></field></shadow><block type="data_variable"><field name="VARIABLE">{0}</field></block></value>';
    code.head += fillIt(bCode, param.left.name);
  } else if(param.left.type === 'BinaryExpression' || param.left.type === 'LogicalExpression' || param.left.type === 'UnaryExpression') {
    code.head += '<value name="' + vName + '1"><shadow type="text"><field name="TEXT"></field></shadow>';
    Blockly.Python.xml[param.left.operator](code, param.left);
    code.head += '</value>';
  } else if(param.left.type === 'MemberExpression') {
    code.head += '<value name="' + vName + '1"><shadow type="text"><field name="TEXT"></field></shadow>';
    Blockly.Python.xml[param.left.property.name](code, param.left.object);
    code.head += '</value>';
  } else if(param.left.type === 'CallExpression') {
    code.head += '<value name="' + vName + '1"><shadow type="text"><field name="TEXT"></field></shadow>';
    Blockly.Python.xml[param.left.callee.property.name](code, param.left.arguments);
    code.head += '</value>';
  }
  
  if(param.right.type === 'Literal' && param.right.value !== false && param.right.value !== true) {
    var bCode = '<value name="' + vName + '2"><shadow type="text"><field name="TEXT">{0}</field></shadow></value>';
    code.head += fillIt(bCode, param.right.value);
  } else if(param.right.type === 'Identifier') {
    var bCode = '<value name="' + vName + '2"><shadow type="text"><field name="TEXT"></field></shadow><block type="data_variable"><field name="VARIABLE">{0}</field></block></value>';
    code.head += fillIt(bCode, param.right.name);
  } else if(param.right.type === 'BinaryExpression' || param.right.type === 'LogicalExpression' || param.right.type === 'UnaryExpression') {
    code.head += '<value name="' + vName + '2"><shadow type="text"><field name="TEXT"></field></shadow>';
    Blockly.Python.xml[param.right.operator](code, param.right);
    code.head += '</value>';
  } else if(param.right.type === 'MemberExpression') {
    code.head += '<value name="' + vName + '2"><shadow type="text"><field name="TEXT"></field></shadow>';
    Blockly.Python.xml[param.right.property.name](code, param.right.object);
    code.head += '</value>';
  } else if(param.right.type === 'CallExpression') {
    code.head += '<value name="' + vName + '2"><shadow type="text"><field name="TEXT"></field></shadow>';
    Blockly.Python.xml[param.right.callee.property.name](code, param.right.arguments);
    code.head += '</value>';
  }

  code.head += '</block>';
}

Blockly.Python.xml['+'] = function(code, param) {
  Blockly.Python.xml['operators']('operator_add', code, param);
};

Blockly.Python.xml['-'] = function(code, param) {
  Blockly.Python.xml['operators']('operator_subtract', code, param);
};

Blockly.Python.xml['*'] = function(code, param) {
  Blockly.Python.xml['operators']('operator_multiply', code, param);
};

Blockly.Python.xml['/'] = function(code, param) {
  Blockly.Python.xml['operators']('operator_divide', code, param);
};

Blockly.Python.xml['<'] = function(code, param) {
  Blockly.Python.xml['operators']('operator_lt', code, param);
};

Blockly.Python.xml['=='] = function(code, param) {
  Blockly.Python.xml['operators']('operator_equals', code, param);
};

Blockly.Python.xml['>'] = function(code, param) {
  Blockly.Python.xml['operators']('operator_gt', code, param);
};

Blockly.Python.xml['&&'] = function(code, param) {
  Blockly.Python.xml['operators']('operator_and', code, param);
};

Blockly.Python.xml['||'] = function(code, param) {
  Blockly.Python.xml['operators']('operator_or', code, param);
};

Blockly.Python.xml['!'] = function(code, param) {
  var bCode = '<block type="operator_not">';
  
  if(param.argument.type === 'Literal' && param.argument.value !== false && param.argument.value !== true) {
    bCode += '<value name="OPERAND"><shadow type="text"><field name="TEXT">{0}</field></shadow></value>';
    code.head += fillIt(bCode, param.argument.raw) + '</block>';
  } else if(param.argument.type === 'Identifier') {
    bCode += '<value name="OPERAND"><shadow type="text"><field name="TEXT"></field></shadow><block type="data_variable"><field name="VARIABLE">{0}</field></block></value>';
    code.head += fillIt(bCode, param.argument.name) + '</block>';
  } else if(param.argument.type === 'BinaryExpression' || param.argument.type === 'LogicalExpression' || param.argument.type === 'UnaryExpression') {
    bCode += '<value name="OPERAND"><shadow type="text"><field name="TEXT"></field></shadow>';
    code.head += bCode;
    Blockly.Python.xml[param.argument.operator](code, param.argument);
    code.head += '</value></block>';
  } else if(param.argument.type === 'MemberExpression') {
    bCode += '<value name="OPERAND"><shadow type="text"><field name="TEXT"></field></shadow>';
    if(param.argument.property.name !== 'length') {
      code.head += bCode;
      Blockly.Python.xml[param.argument.property.name](code, param.argument.object);
      code.head += '</value>';
    } else {
      Blockly.Python.xml[param.argument.property.name](code, param.argument.object, true);
    }
  }
};