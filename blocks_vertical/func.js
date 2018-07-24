'use strict';

goog.provide('Blockly.Blocks.func');
goog.provide('Blockly.Constants.func');

goog.require('Blockly.Blocks');
goog.require('Blockly.Colours');
goog.require('Blockly.constants');
goog.require('Blockly.ScratchBlocks.VerticalExtensions');

Blockly.Blocks['func'] = {
    /**
     * function blocks
     * @this Blockly.Block
     */
    init: function() {
      this.jsonInit({
        "message0": "%1",
        "message1": "%1",
        "args0": [
          {
            "type": "field_variable_getter",
            "text": "",
            "name": "func",
            "variableType": Blockly.FUNC_TYPE
          }
        ],
        "args1": [
          {
            "type": "input_statement",
            "name": "SUBSTACK"
          }
        ],
        "category": Blockly.Categories.func,
        "extensions": ["colours_func", "shape_func"]
      });
    }
  };

Blockly.Blocks['modify_func'] = {
  /**
   * Block for reporting length of list.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1",
      "args0": [
        {
          "type": "field_variable",
          "name": "func"
        }
      ],
      "category": Blockly.Categories.func,
      "extensions": ["colours_func", "output_number"]
    });
  }
};
  
// PSB_블록을 만들 때 이름과 ID를 저장할 dictionary
Blockly.Blocks.funcUniqueId = {};

Blockly.Blocks.setFuncUniqueId = function(name, id) {
  Blockly.Blocks.funcUniqueId[name] = id;
}

Blockly.Blocks.getFuncUniqueId = function(name) {
  return Blockly.Blocks.funcUniqueId[name];
}

Blockly.Blocks.deleteFuncUniqueId = function(name) {
  delete Blockly.Blocks.funcUniqueId[name];
}