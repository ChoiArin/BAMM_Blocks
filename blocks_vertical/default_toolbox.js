/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Massachusetts Institute of Technology
 * All rights reserved.
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

"use strict";

goog.provide("Blockly.Blocks.defaultToolbox");

goog.require("Blockly.Blocks");

/**
 * @fileoverview Provide a default toolbox XML.
 */

Blockly.Blocks.defaultToolbox = '<xml id="toolbox-categories" style="display: none">' +
  '<category name="%{BKY_CATEGORY_CONTROL}" id="control" colour="#98AFC9" secondaryColour="#5D6C7A">' +
    /*
    '<block type="control_wait" id="control_wait">' +
      '<value name="DURATION">' +
        '<shadow type="math_positive_number">' +
          '<field name="NUM">1</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    */
    '<block type="control_repeat" id="control_repeat">' +
      '<value name="TIMES">' +
        '<shadow type="math_whole_number">' +
          '<field name="NUM">10</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="control_forever" id="control_forever"></block>' +
    '<block type="control_if" id="control_if"></block>' +
    '<block type="control_if_else" id="control_if_else"></block>' +
    /*'<block type="control_wait_until" id="control_wait_until"></block>' +*/
    '<block type="control_repeat_until" id="control_repeat_until"></block>' +
    '<block type="control_stop" id="control_stop"></block>' +
  '</category>' +
  '<category name="Texts" id="texts_extensions" colour="#00316B" secondaryColour="#001B35">' +
    '<block type="texts_text" id="texts_text">' +
      '<value name="VAR">' +
        '<shadow type="math_number">' +
          '<field name="NUM">0</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="texts_int" id="texts_int">' +
      '<value name="VAR">' +
        '<shadow type="text">' +
          '<field name="TEXT">0</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    /*
    '<block type="texts_append" id="texts_append">' +
      '<value name="TEXT">' +
        '<shadow type="text">' +
          '<field name="TEXT">world</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    */
    '<block type="texts_length" id="texts_length">' +
      '<value name="VALUE">' +
        '<shadow type="text">' +
          '<field name="TEXT">hello, world!</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="texts_isEmpty" id="texts_isEmpty">' +
      '<value name="VALUE">' +
        '<shadow type="text">' +
          '<field name="TEXT">hello, world!</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="texts_indexOf" id="texts_indexOf">' +
      '<value name="VALUE">' +
        '<shadow type="text">' +
          '<field name="TEXT">hello, world!</field>' +
        '</shadow>' +
      '</value>' +
      '<value name="FIND">' +
        '<shadow type="text">' +
          '<field name="TEXT">world</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="texts_charAt" id="texts_charAt">' +
      '<value name="WHERE">' +
        '<shadow type="math_number">' +
          '<field name="NUM">0</field>' +
        '</shadow>' +
      '</value>' +
      '<value name="VALUE">' +
        '<shadow type="text">' +
          '<field name="TEXT">hello, world!</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="texts_getSubstring" id="texts_getSubstring">' +
      '<value name="STRING">' +
        '<shadow type="text">' +
          '<field name="TEXT">hello</field>' +
        '</shadow>' +
      '</value>' +
      '<value name="AT1">' +
        '<shadow type="math_number">' +
          '<field name="NUM">0</field>' +
        '</shadow>' +
      '</value>' +
      '<value name="AT2">' +
        '<shadow type="math_number">' +
          '<field name="NUM">0</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="texts_changeCase" id="texts_changeCase">' +
      '<value name="TEXT">' +
        '<shadow type="text">' +
          '<field name="TEXT">hello</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="texts_trim" id="texts_trim">' +
      '<value name="TEXT">' +
        '<shadow type="text">' +
          '<field name="TEXT"> hello, world!  </field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="texts_input" id="texts_input">' +
      '<value name="TEXT">' +
      '</value>' +
    '</block>' +
    '<block type="texts_println" id="texts_println">' +
      '<value name="TEXT">' +
        '<shadow type="text">' +
          '<field name="TEXT">hello, world!</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="texts_print" id="texts_print">' +
      '<value name="TEXT">' +
        '<shadow type="text">' +
          '<field name="TEXT">hello, world!</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="texts_count" id="texts_count">' +
      '<value name="TEXT">' +
        '<shadow type="text">' +
          '<field name="TEXT">hello, world!</field>' +
        '</shadow>' +
      '</value>' +
      '<value name="SUB">' +
        '<shadow type="text">' +
          '<field name="TEXT">world</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="texts_replace" id="texts_replace">' +
      '<value name="TEXT">' +
        '<shadow type="text">' +
          '<field name="TEXT">hello, world!</field>' +
        '</shadow>' +
      '</value>' +
      '<value name="FROM">' +
        '<shadow type="text">' +
          '<field name="TEXT">hello</field>' +
        '</shadow>' +
      '</value>' +
      '<value name="TO">' +
        '<shadow type="text">' +
          '<field name="TEXT">world</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="texts_reverse" id="texts_reverse">' +
      '<value name="TEXT">' +
        '<shadow type="text">' +
          '<field name="TEXT">hello, world!</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
  '</category>' +
  '<category name="%{BKY_CATEGORY_OPERATORS}" id="operators" colour="#7C6AC0" secondaryColour="#544C84">' +
    '<block type="operator_true" id="operator_true">' +
    '</block>' +
    '<block type="operator_false" id="operator_false">' +
    '</block>' +
    '<block type="operator_add" id="operator_add">' +
      '<value name="NUM1">' +
        '<shadow type="math_number">' +
          '<field name="NUM"></field>' +
        '</shadow>' +
      '</value>' +
      '<value name="NUM2">' +
        '<shadow type="math_number">' +
          '<field name="NUM"></field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="operator_subtract" id="operator_subtract">' +
      '<value name="NUM1">' +
        '<shadow type="math_number">' +
          '<field name="NUM"></field>' +
        '</shadow>' +
      '</value>' +
      '<value name="NUM2">' +
        '<shadow type="math_number">' +
          '<field name="NUM"></field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="operator_multiply" id="operator_multiply">' +
      '<value name="NUM1">' +
        '<shadow type="math_number">' +
          '<field name="NUM"></field>' +
        '</shadow>' +
      '</value>' +
      '<value name="NUM2">' +
        '<shadow type="math_number">' +
          '<field name="NUM"></field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="operator_divide" id="operator_divide">' +
      '<value name="NUM1">' +
        '<shadow type="math_number">' +
          '<field name="NUM"></field>' +
        '</shadow>' +
      '</value>' +
      '<value name="NUM2">' +
        '<shadow type="math_number">' +
          '<field name="NUM"></field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="operator_random" id="operator_random">' +
      '<value name="FROM">' +
        '<shadow type="math_number">' +
          '<field name="NUM">1</field>' +
        '</shadow>' +
      '</value>' +
      '<value name="TO">' +
        '<shadow type="math_number">' +
          '<field name="NUM">10</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="operator_lt" id="operator_lt">' +
      '<value name="OPERAND1">' +
        '<shadow type="text">' +
          '<field name="TEXT"></field>' +
        '</shadow>' +
      '</value>' +
      '<value name="OPERAND2">' +
        '<shadow type="text">' +
          '<field name="TEXT"></field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="operator_equals" id="operator_equals">' +
      '<value name="OPERAND1">' +
        '<shadow type="text">' +
          '<field name="TEXT"></field>' +
        '</shadow>' +
      '</value>' +
      '<value name="OPERAND2">' +
        '<shadow type="text">' +
          '<field name="TEXT"></field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="operator_unequals" id="operator_unequals">' +
      '<value name="OPERAND1">' +
        '<shadow type="text">' +
          '<field name="TEXT"></field>' +
        '</shadow>' +
      '</value>' +
      '<value name="OPERAND2">' +
        '<shadow type="text">' +
          '<field name="TEXT"></field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="operator_gt" id="operator_gt">' +
      '<value name="OPERAND1">' +
        '<shadow type="text">' +
          '<field name="TEXT"></field>' +
        '</shadow>' +
      '</value>' +
      '<value name="OPERAND2">' +
        '<shadow type="text">' +
          '<field name="TEXT"></field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="operator_and" id="operator_and"></block>' +
    '<block type="operator_or" id="operator_or"></block>' +
    '<block type="operator_not" id="operator_not">' +
      '<value name="OPERAND">' +
        '<shadow type="math_number">' +
          '<field name="NUM"></field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="operator_mod" id="operator_mod">' +
      '<value name="NUM1">' +
        '<shadow type="math_number">' +
          '<field name="NUM"></field>' +
        '</shadow>' +
      '</value>' +
      '<value name="NUM2">' +
        '<shadow type="math_number">' +
          '<field name="NUM"></field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="operator_round" id="operator_round">' +
      '<value name="NUM">' +
        '<shadow type="math_number">' +
          '<field name="NUM"></field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="operator_mathop" id="operator_mathop">' +
      '<value name="NUM">' +
        '<shadow type="math_number">' +
          '<field name="NUM"></field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="operator_pow" id="operator_pow">' +
      '<value name="NUM1">' +
        '<shadow type="math_number">' +
          '<field name="NUM"></field>' +
        '</shadow>' +
      '</value>' +
      '<value name="NUM2">' +
        '<shadow type="math_integer">' +
          '<field name="NUM"></field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
  '</category>' +
  '<category name="%{BKY_CATEGORY_VARIABLES}" id="data" colour="#A6B6FE" secondaryColour="#8E9BD9" custom="VARIABLE">' +
  '</category>' +
  '<category name="%{BKY_CATEGORY_MYBLOCKS}" id="more" colour="#3194FF" secondaryColour="#226CAF" custom="PROCEDURE">' +
  '</category>' +
  '</xml>';