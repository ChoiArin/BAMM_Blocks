"use strict";

var Blockly = require("./blockly_compressed");

Blockly.Python = require("./python_compressed")(Blockly);

module.exports = Blockly;
