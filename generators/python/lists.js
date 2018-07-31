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
 * @fileoverview Generating Python for list blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.Python.lists');

goog.require('Blockly.Python');


Blockly.Python['data_listcontents'] = function(block) {
  // Create an empty list.
  var code = Blockly.Python.variableDB_.getName(block.getFieldValue('LIST'),
      Blockly.Variables.NAME_TYPE);
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['data_clearlist'] = function(block){
  var list = Blockly.Python.variableDB_.getName(block.getFieldValue('LIST'),
  Blockly.Variables.NAME_TYPE);
  var code = list + ' = []\n';
  return code;
};

Blockly.Python['data_range'] = function(block){
  var OP1 = Blockly.Python.valueToCode(block, 'NUM1',
  Blockly.Python.ORDER_NONE) || '0';
  var OP2 = Blockly.Python.valueToCode(block, 'NUM2',
  Blockly.Python.ORDER_NONE) || '0';
  var OP3 = Blockly.Python.valueToCode(block, 'STEP',
  Blockly.Python.ORDER_NONE) || '1';
  var code = 'range(' + OP1 + ', ' + OP2 + ', ' + OP3 + ')';
  return [code, Blockly.Python.ORDER_FUNCTION_CALL];
};

Blockly.Python['data_addtolist'] = function(block){
  var list = Blockly.Python.variableDB_.getName(block.getFieldValue('LIST'),
  Blockly.Variables.NAME_TYPE);
  var thing = Blockly.Python.valueToCode(block, 'ITEM',
  Blockly.Python.ORDER_NONE) || '0';
  var code = list + '.append' + '(' + thing + ')\n';
  return code;
};

Blockly.Python['data_deleteoflist'] = function(block){
  var list = Blockly.Python.variableDB_.getName(block.getFieldValue('LIST'),
  Blockly.Variables.NAME_TYPE);
  var thing = Blockly.Python.valueToCode(block, 'INDEX',
  Blockly.Python.ORDER_MULTIPLICATIVE) || '0';
  var code = 'del ' + list + '[' + thing + ']\n';
  return code;
};
/*
Blockly.Python['lists_create_with'] = function(block) {
  // Create a list with any number of elements of any type.
  var elements = new Array(block.itemCount_);
  for (var i = 0; i < block.itemCount_; i++) {
    elements[i] = Blockly.Python.valueToCode(block, 'ADD' + i,
        Blockly.Python.ORDER_NONE) || 'None';
  }
  var code = '[' + elements.join(', ') + ']';
  return [code, Blockly.Python.ORDER_ATOMIC];
};
*/
Blockly.Python['data_listcontainsitem'] = function(block) {
  // Block for reversing a list.
  var list = Blockly.Python.variableDB_.getName(block.getFieldValue('LIST'),
  Blockly.Variables.NAME_TYPE);
  var thing = Blockly.Python.valueToCode(block, 'ITEM',
  Blockly.Python.ORDER_NONE) || '0';
  var code = thing + ' in ' + list;
  return [code, Blockly.Python.ORDER_FUNCTION_CALL];
};

Blockly.Python['data_lengthoflist'] = function(block) {
  // String or array length.
  var list = Blockly.Python.variableDB_.getName(block.getFieldValue('LIST'),
      Blockly.Variables.NAME_TYPE);
  return ['len(' + list + ')', Blockly.Python.ORDER_FUNCTION_CALL];
};

Blockly.Python['data_itemoflist'] = function(block) {
  // Get element at index.
  // Note: Until January 2013 this block did not have MODE or WHERE inputs.
  var list = Blockly.Python.variableDB_.getName(block.getFieldValue('LIST'),
  Blockly.Variables.NAME_TYPE);
  var at = Blockly.Python.valueToCode(block, 'INDEX',
  Blockly.Python.ORDER_MULTIPLICATIVE) || '0';
  var code = list + '[' + at + ']';
  return [code, Blockly.Python.ORDER_MEMBER];
};

Blockly.Python['data_insertatlist'] = function(block) {
  // Set element at index.
  // Note: Until February 2013 this block did not have MODE or WHERE inputs.
  var list = Blockly.Python.variableDB_.getName(block.getFieldValue('LIST'),
    Blockly.Variables.NAME_TYPE);
  var value = Blockly.Python.valueToCode(block, 'ITEM',
      Blockly.Python.ORDER_NONE) || 'None';
  var at = Blockly.Python.valueToCode(block, 'INDEX',
  Blockly.Python.ORDER_MULTIPLICATIVE) || '0';
  return list + '.insert(' + at + ', ' + value + ')\n';
};

Blockly.Python['data_replaceitemoflist'] = function(block) {
  // Set element at index.
  // Note: Until February 2013 this block did not have MODE or WHERE inputs.
  var list = Blockly.Python.variableDB_.getName(block.getFieldValue('LIST'),
    Blockly.Variables.NAME_TYPE);
  var value = Blockly.Python.valueToCode(block, 'ITEM',
    Blockly.Python.ORDER_NONE) || 'None';
  var at = Blockly.Python.valueToCode(block, 'INDEX',
  Blockly.Python.ORDER_MULTIPLICATIVE) || '0';
  return list + '[' + at + '] = ' + value + '\n';
};

Blockly.Python['data_itemnumoflist'] = function(block) {
  // Set element at index.
  // Note: Until February 2013 this block did not have MODE or WHERE inputs.
  var list = Blockly.Python.variableDB_.getName(block.getFieldValue('LIST'),
    Blockly.Variables.NAME_TYPE);
  var value = Blockly.Python.valueToCode(block, 'ITEM',
    Blockly.Python.ORDER_NONE) || 'None';
  return [list + '.index(' + value + ')', Blockly.Python.ORDER_FUNCTION_CALL];
};

Blockly.Python['lists_sort'] = function(block) {
  // Block for sorting a list.
  var list = (Blockly.Python.valueToCode(block, 'LIST',
      Blockly.Python.ORDER_NONE) || '[]');
  var type = block.getFieldValue('TYPE');
  var reverse = block.getFieldValue('DIRECTION') === '1' ? 'False' : 'True';
  var sortFunctionName = Blockly.Python.provideFunction_('lists_sort',
  ['def ' + Blockly.Python.FUNCTION_NAME_PLACEHOLDER_ +
      '(my_list, type, reverse):',
    '  def try_float(s):',
    '    try:',
    '      return float(s)',
    '    except:',
    '      return 0',
    '  key_funcs = {',
    '    "NUMERIC": try_float,',
    '    "TEXT": str,',
    '    "IGNORE_CASE": lambda s: str(s).lower()',
    '  }',
    '  key_func = key_funcs[type]',
    '  list_cpy = list(my_list)', // Clone the list.
    '  return sorted(list_cpy, key=key_func, reverse=reverse)'
  ]);

  var code = sortFunctionName +
      '(' + list + ', "' + type + '", ' + reverse + ')';
  return [code, Blockly.Python.ORDER_FUNCTION_CALL];
};

Blockly.Python['lists_split'] = function(block) {
  // Block for splitting text into a list, or joining a list into text.
  var mode = block.getFieldValue('MODE');
  if (mode == 'SPLIT') {
    var value_input = Blockly.Python.valueToCode(block, 'INPUT',
        Blockly.Python.ORDER_MEMBER) || '\'\'';
    var value_delim = Blockly.Python.valueToCode(block, 'DELIM',
        Blockly.Python.ORDER_NONE);
    var code = value_input + '.split(' + value_delim + ')';
  } else if (mode == 'JOIN') {
    var value_input = Blockly.Python.valueToCode(block, 'INPUT',
        Blockly.Python.ORDER_NONE) || '[]';
    var value_delim = Blockly.Python.valueToCode(block, 'DELIM',
        Blockly.Python.ORDER_MEMBER) || '\'\'';
    var code = value_delim + '.join(' + value_input + ')';
  } else {
    throw 'Unknown mode: ' + mode;
  }
  return [code, Blockly.Python.ORDER_FUNCTION_CALL];
};

Blockly.Python['lists_reverse'] = function(block) {
  // Block for reversing a list.
  var list = Blockly.Python.valueToCode(block, 'LIST',
      Blockly.Python.ORDER_NONE) || '[]';
  var code = 'list(reversed(' + list + '))';
  return [code, Blockly.Python.ORDER_FUNCTION_CALL];
};

Blockly.Python['lists_repeat'] = function(block) {
  // Create a list with one element repeated.
  var item = Blockly.Python.valueToCode(block, 'ITEM',
      Blockly.Python.ORDER_NONE) || 'None';
  var times = Blockly.Python.valueToCode(block, 'NUM',
      Blockly.Python.ORDER_MULTIPLICATIVE) || '0';
  var code = '[' + item + '] * ' + times;
  return [code, Blockly.Python.ORDER_MULTIPLICATIVE];
};
Blockly.Python['lists_isEmpty'] = function(block) {
  // Is the string null or array empty?
  var list = Blockly.Python.valueToCode(block, 'VALUE',
      Blockly.Python.ORDER_NONE) || '[]';
  var code = 'not len(' + list + ')';
  return [code, Blockly.Python.ORDER_LOGICAL_NOT];
};

Blockly.Python['lists_indexOf'] = function(block) {
  // Find an item in the list.
  var item = Blockly.Python.valueToCode(block, 'FIND',
      Blockly.Python.ORDER_NONE) || '[]';
  var list = Blockly.Python.valueToCode(block, 'VALUE',
      Blockly.Python.ORDER_NONE) || '\'\'';
  if (block.workspace.options.oneBasedIndex) {
    var errorIndex = ' 0';
    var firstIndexAdjustment = ' + 1';
    var lastIndexAdjustment = '';
  } else {
    var errorIndex = ' -1';
    var firstIndexAdjustment = '';
    var lastIndexAdjustment = ' - 1';
  }
  if (block.getFieldValue('END') == 'FIRST') {
    var functionName = Blockly.Python.provideFunction_(
        'first_index',
        ['def ' + Blockly.Python.FUNCTION_NAME_PLACEHOLDER_ +
            '(my_list, elem):',
         '  try: index = my_list.index(elem)' + firstIndexAdjustment,
         '  except: index =' + errorIndex,
         '  return index']);
    var code = functionName + '(' + list + ', ' + item + ')';
    return [code, Blockly.Python.ORDER_FUNCTION_CALL];
  }
  var functionName = Blockly.Python.provideFunction_(
      'last_index',
      ['def ' + Blockly.Python.FUNCTION_NAME_PLACEHOLDER_ + '(my_list, elem):',
       '  try: index = len(my_list) - my_list[::-1].index(elem)' +
         lastIndexAdjustment,
       '  except: index =' + errorIndex,
       '  return index']);
  var code = functionName + '(' + list + ', ' + item + ')';
  return [code, Blockly.Python.ORDER_FUNCTION_CALL];
};