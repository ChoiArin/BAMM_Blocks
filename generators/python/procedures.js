/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Generating Python for procedure blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Python.procedures');

goog.require('Blockly.Python');

// Blockly.Procedures['externalProcedureDefCallback'] = function(workspace, opt_callback, opt_type) {
//     var modalTitle;
    
//     opt_type = opt_type ? opt_type : '';
//     // opt_type = Blockly.LIST_VARIABLE_TYPE;
//     modalTitle = Blockly.Msg.LIST_MODAL_TITLE;

//     var validate = Blockly.Variables.nameValidator_.bind(null, opt_type);

//     Blockly.prompt('New function name:', '',
//       function(text) {
//         var validatedText = validate(text, workspace, opt_callback);
//         if (validatedText) {
//           // The name is valid according to the type, create the variable
//           var potentialVarMap = workspace.getPotentialVariableMap();
//           var variable;
//           // This check ensures that if a new variable is being created from a
//           // workspace that already has a variable of the same name and type as
//           // a potential variable, that potential variable gets turned into a
//           // real variable and thus there aren't duplicate options in the field_variable
//           // dropdown.
//           if (potentialVarMap && opt_type) {
//             variable = Blockly.Variables.realizePotentialVar(validatedText,
//                 opt_type, workspace, false);
//           }
//           if (!variable) {
//             variable = workspace.createVariable(validatedText, opt_type);
//           }

//           var flyout = workspace.isFlyout ? workspace : workspace.getFlyout();
//           var variableBlockId = variable.getId();
//           if (flyout.setCheckboxState) {
//             flyout.setCheckboxState(variableBlockId, true);
//           }

//           if (opt_callback) {
//             opt_callback(variableBlockId);
//           }
//         } else {
//           // User canceled prompt without a value.
//           if (opt_callback) {
//             opt_callback(null);
//           }
//         }
//       }, modalTitle, opt_type);
// };

Blockly.Python['func'] = function(block) {
    // PSB_이 부분에 함수의 호출을 구현
    // 함수의 정의는 함수가 변수처럼 정의되는 부분을 고쳐서 하는 것이 나아보임
    // variable과 list가 생성되면 맨 위에 코드를 작성해주는 부분을 찾아야 함!!!

    // var until = block.getFieldValue('MODE') == 'UNTIL';
    // var argument0 = Blockly.Python.valueToCode(block, 'BOOL',
    //     until ? Blockly.Python.ORDER_LOGICAL_NOT :
    //     Blockly.Python.ORDER_NONE) || 'False';
    // var branch = Blockly.Python.statementToCode(block, 'DO');
    // branch = Blockly.Python.statementToCode(block, 'SUBSTACK') ||
    //     Blockly.Python.PASS;
    // return 'def ' + argument0 + ':\n' + branch;

    if(block === null)
        return '';
    
    var branch = Blockly.Python.statementToCode(block, 'DO');
    branch = Blockly.Python.statementToCode(block, 'SUBSTACK') ||
        Blockly.Python.PASS;

    // Default로 pass가 들어가는 것은 NAME_TYPE일듯
    var blockId = block.workspace.id;
    var workspace = Blockly.Workspace.getById(blockId);
    var defvars = [];
    var variables = workspace.getAllVariables();
    var flyout = workspace.isFlyout ? workspace : workspace.getFlyout();
    for (var i = 0; i < variables.length; i++) {
        defvars[i] = Blockly.Python.variableDB_.getName(variables[i].getId(),
            Blockly.Variables.NAME_TYPE);

        // PSB_맨 위쪽에 함수의 정의를 하고 싶으나 붙지 않음...
        // 적용이 되지 않는 문제가 있음
        // if(variables[i].type === 'func'){
        //     //console.log(defvars[i]);
        //     defvars[i] += branch;
        //     //console.log(defvars[i]);
        // }
        Blockly.Blocks.updateFuncUniqueDef(block.id, branch);
    }

    return '';
    // return branch;
}

Blockly.Python['return_nothing'] = function(block) {
    // var branch = Blockly.Python.statementToCode(block, 'DO');
    // branch = Blockly.Python.statementToCode(block, 'SUBSTACK') ||
    //     Blockly.Python.PASS;

    return 'return\n';
}

// PSB_여기에 return_something 추가
Blockly.Python['return_something'] = function(block) {
    var argument0 = Blockly.Python.valueToCode(block, 'VALUE',
    Blockly.Python.ORDER_NONE) || 0;
    // var branch = Blockly.Python.statementToCode(block, 'DO');
    // branch = Blockly.Python.statementToCode(block, 'SUBSTACK') ||
    //     Blockly.Python.PASS;

    // PSB_정수를 판단하여 정수형으로 바꿔야 함
    return 'return ' + argument0;
    // if(branch === Blockly.Python.PASS)
    //     return 'return\n';
    // else
    //     return 'return' + argument0;
}

Blockly.Python['procedures_defreturn'] = function(block) {
  // Define a procedure with a return value.
  // First, add a 'global' statement for every variable that is not shadowed by
  // a local parameter.
  var globals = [];
  var varName;
  var workspace = block.workspace;
  var variables = Blockly.Variables.allUsedVarModels(workspace) || [];
  for (var i = 0, variable; variable = variables[i]; i++) {
    varName = variable.name;
    if (block.arguments_.indexOf(varName) == -1) {
      globals.push(Blockly.Python.variableDB_.getName(varName,
          Blockly.Variables.NAME_TYPE));
    }
  }
  // Add developer variables.
  var devVarList = Blockly.Variables.allDeveloperVariables(workspace);
  for (var i = 0; i < devVarList.length; i++) {
    globals.push(Blockly.Python.variableDB_.getName(devVarList[i],
        Blockly.Names.DEVELOPER_VARIABLE_TYPE));
  }

  globals = globals.length ?
      Blockly.Python.INDENT + 'global ' + globals.join(', ') + '\n' : '';
  var funcName = Blockly.Python.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var branch = Blockly.Python.statementToCode(block, 'STACK');
  if (Blockly.Python.STATEMENT_PREFIX) {
    var id = block.id.replace(/\$/g, '$$$$');  // Issue 251.
    branch = Blockly.Python.prefixLines(
        Blockly.Python.STATEMENT_PREFIX.replace(
            /%1/g, '\'' + id + '\''), Blockly.Python.INDENT) + branch;
  }
  if (Blockly.Python.INFINITE_LOOP_TRAP) {
    branch = Blockly.Python.INFINITE_LOOP_TRAP.replace(/%1/g,
        '"' + block.id + '"') + branch;
  }
  var returnValue = Blockly.Python.valueToCode(block, 'RETURN',
      Blockly.Python.ORDER_NONE) || '';
  if (returnValue) {
    returnValue = Blockly.Python.INDENT + 'return ' + returnValue + '\n';
  } else if (!branch) {
    branch = Blockly.Python.PASS;
  }
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.Python.variableDB_.getName(block.arguments_[i],
        Blockly.Variables.NAME_TYPE);
  }
  var code = 'def ' + funcName + '(' + args.join(', ') + '):\n' +
      globals + branch + returnValue;
  code = Blockly.Python.scrub_(block, code);
  // Add % so as not to collide with helper functions in definitions list.
  Blockly.Python.definitions_['%' + funcName] = code;
  return null;
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
Blockly.Python['procedures_defnoreturn'] =
    Blockly.Python['procedures_defreturn'];

Blockly.Python['procedures_callreturn'] = function(block) {
  // Call a procedure with a return value.
  var funcName = Blockly.Python.variableDB_.getName(block.getFieldValue('NAME'),
      Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.Python.valueToCode(block, 'ARG' + i,
        Blockly.Python.ORDER_NONE) || 'None';
  }
  var code = funcName + '(' + args.join(', ') + ')';
  return [code, Blockly.Python.ORDER_FUNCTION_CALL];
};

Blockly.Python['procedures_callnoreturn'] = function(block) {
  // Call a procedure with no return value.
  var funcName = Blockly.Python.variableDB_.getName(block.getFieldValue('NAME'),
      Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.Python.valueToCode(block, 'ARG' + i,
        Blockly.Python.ORDER_NONE) || 'None';
  }
  var code = funcName + '(' + args.join(', ') + ')\n';
  return code;
};

Blockly.Python['procedures_ifreturn'] = function(block) {
  // Conditionally return value from a procedure.
  var condition = Blockly.Python.valueToCode(block, 'CONDITION',
      Blockly.Python.ORDER_NONE) || 'False';
  var code = 'if ' + condition + ':\n';
  if (block.hasReturnValue_) {
    var value = Blockly.Python.valueToCode(block, 'VALUE',
        Blockly.Python.ORDER_NONE) || 'None';
    code += Blockly.Python.INDENT + 'return ' + value + '\n';
  } else {
    code += Blockly.Python.INDENT + 'return\n';
  }
  return code;
};
