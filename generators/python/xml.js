goog.provide('Blockly.Python.xml');

goog.require('Blockly.Python');
goog.require('Blockly.Xml');

Blockly.Python.xml.fromAST = function(AST) {
  var code = codeAnalyze(AST);

  return '<xml>' + code + '</xml>';
};

function codeAnalyze(AST) {
  var code = {head: '', tail: ''};
  var varList = {};

  AST.body.forEach(function(elem) {
    codeBlockAnalyze(varList, code, elem);
  });

  return code.head + code.tail;
}

function codeBlockAnalyze(varList, code, elem) {
  if(elem.valueName) {
    code.head += '<value name="';
    code.head += elem.valueName;
    code.head += '">';
  }

  switch (elem.type) {
    case 'AssignmentExpression': {
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
      code.tail = '</next></block>' + code.tail;
      break;
    }
    case 'BinaryExpression': {
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
        code.head += 'operator_lt';
        logical = true;
      } else if(elem.operator === '<') {
        code.head += 'operator_gt';
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
    }
    case 'BlockStatement': {
      elem.body.forEach(function(e) {
        codeBlockAnalyze(varList, code, e);
      });
      code.head += code.tail;
      code.tail = '';
      break;
    }
    case 'BreakStatement': {
      code.head += '<block type="control_stop"><mutation hasnext="false"></mutation><field name="STOP_OPTION">this script</field></block>';
      break;
    }
    case 'CallExpression': {
      Blockly.Python.xml[elem.callee.property.name](varList, code, elem.arguments);
      break;
    }
    case 'EmptyStatement': {
      //Do nothing ^오^
      break;
    }
    case 'ExpressionStatement': {
      codeBlockAnalyze(varList, code, elem.expression);
      break;
    }
    case 'ForInStatement': {

      break;
    }
    case 'ForStatement': {

      break;
    }
    case 'FunctionDeclaration': {
      varList[elem.id.name] = 'func';
      code.head += '<block type="func">';
      code.head += '<field name="func" variabletype="func">';
      codeBlockAnalyze(varList, code, elem.id);
      code.head += '</field>';
      code.head += '<statement name="SUBSTACK">';
      codeBlockAnalyze(varList, code, elem.body);
      code.tail = '</statement></block>' + code.tail;
      break;
    }
    case 'Identifier': {
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
    }
    case 'IfStatement': {
      if(elem.alternate)
        code.head += '<block type="control_if_else">';
      else
        code.head += '<block type="control_if">';

      code.head += '<value name="CONDITION">';
      codeBlockAnalyze(varList, code, elem.test);
      code.head += '</value>';

      code.head += '<statement name="SUBSTACK">';
      code.tail = '</statement>' + code.tail;
      codeBlockAnalyze(varList, code, elem.consequent);

      if(elem.alternate) {
        code.head += '<statement name="SUBSTACK2">';
        code.tail = '</statement>' + code.tail;
        codeBlockAnalyze(varList, code, elem.alternate);
      }

      code.head += '<next>';
      code.tail = '</next></block>' + code.tail;
      break;
    }
    case 'Literal': {
      code.head += '<shadow type="';
      code.head += elem.shadowType ? elem.shadowType : 'text';
      code.head += '"><field name="';
      code.head += elem.fieldName ? elem.fieldName : 'TEXT';
      code.head += '">';
      code.head += elem.value === null ? '' : elem.value;
      code.head += '</field></shadow>';
      break;
    }
    case 'LogicalExpression': {
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
    }
    case 'MemberExpression': {
      // Yet
      break;
    }
    case 'NewExpression': {
      // list. no block assign
      break;
    }
    case 'Program': {
      codeBlockAnalyze(varList, code, elem.body);
      break;
    }
    case 'UnaryExpression': {
      code.head += '<block type="operator_not">';
      codeBlockAnalyze(varList, code, elem.argument);
      code.head += '</block>';
      break;
    }
    case 'UpdateExpression': {
      // Yet
      break;
    }
    case 'VariableDeclaration': {
      codeBlockAnalyze(varList, code, elem.declarations[0]);
      break;
    }
    case 'VariableDeclarator': {
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
      } else if(elem.init.type == 'CallExpression') { //func
        varList[elem.id] = 'var';
        code.head += '<block type="data_setvariableto">';
        elem.init.valueName = 'VALUE';
        codeBlockAnalyze(varList, code, elem.id);
        codeBlockAnalyze(varList, code, elem.init);
      }
      code.head += '<next>';
      code.tail = '</next></block>' + code.tail;
      break;
    }
    case 'WhileStatement': {
      code.head += '<block type="control_repeat_until">';
      code.head += '<value name="CONDITION">';
      codeBlockAnalyze(varList, code, elem.test);
      code.head += '</value>';
      code.head += '<statement name="SUBSTACK">';
      codeBlockAnalyze(varList, code, elem.body);
      code.tail = '</statement></block>' + code.tail;
      break;
    }
  }

  if(elem.valueName) {
    code.head += '</value>';
  }
}

Blockly.Python.xml['print'] = function(varList, code, args) {
  code.head += '<block type="texts_println">';
  args[0].valueName = 'TEXT';
  codeBlockAnalyze(varList, code, args[0]);
  code.head += '<next>';
  code.tail = '</next></block>' + code.tail;
};

Blockly.Python.xml['str'] = function(varList, code, args) {
  code.head += '<block type="texts_text">';
  args[0].valueName = 'VAR';
  args[0].shadowType = 'math_number';
  args[0].fieldName = 'NUM';
  codeBlockAnalyze(varList, code, args[0]);
  code.head += '</block>';
};

Blockly.Python.xml['add'] = function(varList, code, args) {
  code.head += '<block type="operator_add">';
  args[0].valueName = 'NUM1';
  codeBlockAnalyze(varList, code, args[0]);
  args[1].valueName = 'NUM2';
  codeBlockAnalyze(varList, code, args[1]);
  code.head += '</block>';
};

Blockly.Python.xml['randint'] = function(varList, code, args) {
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

Blockly.Python.xml['round'] = function(varList, code, args) {
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

Blockly.Python.xml['fabs'] = function(varList, code, args) {
  mathop('abs', varList, code, args);
};

Blockly.Python.xml['floor'] = function(varList, code, args) {
  mathop('floor', varList, code, args);
};

Blockly.Python.xml['ceil'] = function(varList, code, args) {
  mathop('ceiling', varList, code, args);
};

Blockly.Python.xml['sqrt'] = function(varList, code, args) {
  mathop('sqrt', varList, code, args);
};

Blockly.Python.xml['sin'] = function(varList, code, args) {
  mathop('sin', varList, code, args);
};

Blockly.Python.xml['cos'] = function(varList, code, args) {
  mathop('cos', varList, code, args);
};

Blockly.Python.xml['tan'] = function(varList, code, args) {
  mathop('tan', varList, code, args);
};

Blockly.Python.xml['asin'] = function(varList, code, args) {
  mathop('asin', varList, code, args);
};

Blockly.Python.xml['acos'] = function(varList, code, args) {
  mathop('acos', varList, code, args);
};

Blockly.Python.xml['atan'] = function(varList, code, args) {
  mathop('atan', varList, code, args);
};

Blockly.Python.xml['log'] = function(varList, code, args) {
  mathop('ln', varList, code, args);
};

Blockly.Python.xml['log10'] = function(varList, code, args) {
  mathop('log', varList, code, args);
};

Blockly.Python.xml['exp'] = function(varList, code, args) {
  mathop('e ^', varList, code, args);
};

Blockly.Python.xml['pow'] = function(varList, code, args) {
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

Blockly.Python.xml['range'] = function(varList, code, args) {
  code.head += '<block type="data_range">';
  if(args.length > 1) {
    args[0].valueName = 'NUM1';
    args[0].shadowType = 'math_number';
    args[0].fieldName = 'NUM';
    codeBlockAnalyze(varList, code, args[0]);
    args[1].valueName = 'NUM2';
    args[1].shadowType = 'math_number';
    args[1].fieldName = 'NUM';
    codeBlockAnalyze(varList, code, args[1]);
  } else {
    code.head += '<value name="NUM1"><shadow type="math_integer"><field name="NUM">0</field></shadow></value>';
    args[0].valueName = 'NUM2';
    args[0].shadowType = 'math_number';
    args[0].fieldName = 'NUM';
    codeBlockAnalyze(varList, code, args[0]);
  }
  code.head += '</block>';
};