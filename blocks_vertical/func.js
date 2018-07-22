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
        "args0": [
          {
            "type": "field_variable_getter",
            "text": "",
            "name": "func",
            "variableType": Blockly.FUNC_TYPE
          }
        ],
        "category": Blockly.Categories.func,
        "extensions": ["colours_data_lists", "output_string"],
        "checkboxInFlyout": true
      });
    }
  };