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
 * @fileoverview Generating Python for logic blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.Python.logic');

goog.require('Blockly.Python');


Blockly.Python['control_if'] = function(block) {
  // If/elseif/else condition.
  var code = '', branchCode, conditionCode;
  conditionCode = Blockly.Python.valueToCode(block, 'CONDITION',
        Blockly.Python.ORDER_NONE) || 'False';
  branchCode = Blockly.Python.statementToCode(block, 'SUBSTACK') ||
        Blockly.Python.PASS;
  code += 'if ' + conditionCode + ':\n' + branchCode;
  return code;
};

Blockly.Python['control_if_else'] = function(block) {
  // If/elseif/else condition.
  var code = '', branchCode1,branchCode2, conditionCode;
  conditionCode = Blockly.Python.valueToCode(block, 'CONDITION',
        Blockly.Python.ORDER_NONE) || 'False';
  branchCode1 = Blockly.Python.statementToCode(block, 'SUBSTACK') ||
        Blockly.Python.PASS;
  branchCode2 = Blockly.Python.statementToCode(block, 'SUBSTACK2') ||
        Blockly.Python.PASS;
  code += 'if ' + conditionCode + ':\n' + branchCode1 + '\nelse:\n' + branchCode2;
  return code;
};

Blockly.Python['logic_compare'] = function(block) {
  // Comparison operator.
  var OPERATORS = {
    'EQ': '==',
    'NEQ': '!=',
    'LT': '<',
    'LTE': '<=',
    'GT': '>',
    'GTE': '>='
  };
  var operator = OPERATORS[block.getFieldValue('OP')];
  var order = Blockly.Python.ORDER_RELATIONAL;
  var argument0 = Blockly.Python.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.Python.valueToCode(block, 'B', order) || '0';
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

Blockly.Python['logic_operation'] = function(block) {
  // Operations 'and', 'or'.
  var operator = (block.getFieldValue('OP') == 'AND') ? 'and' : 'or';
  var order = (operator == 'and') ? Blockly.Python.ORDER_LOGICAL_AND :
      Blockly.Python.ORDER_LOGICAL_OR;
  var argument0 = Blockly.Python.valueToCode(block, 'A', order);
  var argument1 = Blockly.Python.valueToCode(block, 'B', order);
  if (!argument0 && !argument1) {
    // If there are no arguments, then the return value is false.
    argument0 = 'False';
    argument1 = 'False';
  } else {
    // Single missing arguments have no effect on the return value.
    var defaultArgument = (operator == 'and') ? 'True' : 'False';
    if (!argument0) {
      argument0 = defaultArgument;
    }
    if (!argument1) {
      argument1 = defaultArgument;
    }
  }
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

Blockly.Python['logic_negate'] = function(block) {
  // Negation.
  var argument0 = Blockly.Python.valueToCode(block, 'BOOL',
      Blockly.Python.ORDER_LOGICAL_NOT) || 'True';
  var code = 'not ' + argument0;
  return [code, Blockly.Python.ORDER_LOGICAL_NOT];
};

Blockly.Python['logic_boolean'] = function(block) {
  // Boolean values true and false.
  var code = (block.getFieldValue('BOOL') == 'TRUE') ? 'True' : 'False';
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['logic_null'] = function(block) {
  // Null data type.
  return ['None', Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['logic_ternary'] = function(block) {
  // Ternary operator.
  var value_if = Blockly.Python.valueToCode(block, 'IF',
      Blockly.Python.ORDER_CONDITIONAL) || 'False';
  var value_then = Blockly.Python.valueToCode(block, 'THEN',
      Blockly.Python.ORDER_CONDITIONAL) || 'None';
  var value_else = Blockly.Python.valueToCode(block, 'ELSE',
      Blockly.Python.ORDER_CONDITIONAL) || 'None';
  var code = value_then + ' if ' + value_if + ' else ' + value_else;
  return [code, Blockly.Python.ORDER_CONDITIONAL];
};

Blockly.Python['operator_lt'] = function(block) {
  // Comparison operator.
  var order = Blockly.Python.ORDER_RELATIONAL;
  var argument0 = Blockly.Python.valueToCode(block, 'OPERAND1', order) || '0';
  var argument1 = Blockly.Python.valueToCode(block, 'OPERAND2', order) || '0';
  var code = argument0 + ' ' + '<' + ' ' + argument1;
  return [code, order];
};

Blockly.Python['operator_equals'] = function(block) {
  // Comparison operator.
  var order = Blockly.Python.ORDER_RELATIONAL;
  var argument0 = Blockly.Python.valueToCode(block, 'OPERAND1', order) || '0';
  var argument1 = Blockly.Python.valueToCode(block, 'OPERAND2', order) || '0';
  var code = argument0 + ' ' + '==' + ' ' + argument1;
  return [code, order];
};

Blockly.Python['operator_unequals'] = function(block) {
  // Comparison operator.
  var order = Blockly.Python.ORDER_RELATIONAL;
  var argument0 = Blockly.Python.valueToCode(block, 'OPERAND1', order) || '0';
  var argument1 = Blockly.Python.valueToCode(block, 'OPERAND2', order) || '0';
  var code = argument0 + ' ' + '!=' + ' ' + argument1;
  return [code, order];
};

Blockly.Python['operator_gt'] = function(block) {
  // Comparison operator.
  var order = Blockly.Python.ORDER_RELATIONAL;
  var argument0 = Blockly.Python.valueToCode(block, 'OPERAND1', order) || '0';
  var argument1 = Blockly.Python.valueToCode(block, 'OPERAND2', order) || '0';
  var code = argument0 + ' ' + '>' + ' ' + argument1;
  return [code, order];
};

Blockly.Python['operator_and'] = function(block) {
  // Operations 'and', 'or'.
  var order = Blockly.Python.ORDER_LOGICAL_AND;
  var argument0 = Blockly.Python.valueToCode(block, 'OPERAND1', order);
  var argument1 = Blockly.Python.valueToCode(block, 'OPERAND2', order);
  if (!argument0 && !argument1) {
    // If there are no arguments, then the return value is false.
    argument0 = 'False';
    argument1 = 'False';
  } else {
    // Single missing arguments have no effect on the return value.
    var defaultArgument = 'True';
    if (!argument0) {
      argument0 = defaultArgument;
    }
    if (!argument1) {
      argument1 = defaultArgument;
    }
  }
  var code = argument0 + ' ' + 'and' + ' ' + argument1;
  return [code, order];
};

Blockly.Python['operator_or'] = function(block) {
  // Operations 'and', 'or'.
  var order = Blockly.Python.ORDER_LOGICAL_OR;
  var argument0 = Blockly.Python.valueToCode(block, 'OPERAND1', order);
  var argument1 = Blockly.Python.valueToCode(block, 'OPERAND2', order);
  if (!argument0 && !argument1) {
    // If there are no arguments, then the return value is false.
    argument0 = 'False';
    argument1 = 'False';
  } else {
    // Single missing arguments have no effect on the return value.
    var defaultArgument =  'False';
    if (!argument0) {
      argument0 = defaultArgument;
    }
    if (!argument1) {
      argument1 = defaultArgument;
    }
  }
  var code = argument0 + ' ' + 'or' + ' ' + argument1;
  return [code, order];
};

Blockly.Python['operator_not'] = function(block) {
  // Operations 'and', 'or'.
  var argument0 = Blockly.Python.valueToCode(block, 'OPERAND',
      Blockly.Python.ORDER_LOGICAL_NOT) || 'True';
  var code = 'not ' + argument0;
  return [code, Blockly.Python.ORDER_LOGICAL_NOT];
};

Blockly.Python['operator_join'] = function(block) {
  // Operations 'and', 'or'.
  var argument0 = Blockly.Python.valueToCode(block, 'STRING1',
      Blockly.Python.ORDER_STRING_CONVERSION) || '';
  var argument1 = Blockly.Python.valueToCode(block, 'STRING2',
      Blockly.Python.ORDER_STRING_CONVERSION) || '';
  var code = argument0 + ' + ' + argument1;
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['operator_letter_of'] = function(block) {
  // Operations 'and', 'or'.
  var letter = Blockly.Python.valueToCode(block, 'LETTER',
      Blockly.Python.ORDER_ATOMIC) || 0;
  var argument1 = Blockly.Python.valueToCode(block, 'STRING',
      Blockly.Python.ORDER_STRING_CONVERSION) || '';
  var code = argument0 + ' + ' + argument1;
  return [code, Blockly.Python.ORDER_ATOMIC];
};