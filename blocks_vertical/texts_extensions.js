"use strict";

goog.provide("Blockly.Blocks.texts_extensions");

goog.require("Blockly.Blocks");
goog.require("Blockly.Colours");
goog.require("Blockly.constants");
goog.require("Blockly.ScratchBlocks.VerticalExtensions");

<<<<<<< HEAD
Blockly.Blocks["texts_join"] = {
=======
Blockly.Blocks['texts_text'] = {
>>>>>>> 694477364c386ead1a435c7780abe5e683eac075
  /**
   * Block for texts join.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
<<<<<<< HEAD
      type: "texts_join",
      message0: "join %1 and %2",
      args0: [
        {
          type: "input_value",
          name: "ADD0"
        },
        {
          type: "input_value",
          name: "ADD1"
=======
      "type": "texts_text",
      "message0": '"%1"',
      "args0": [
        {
          "type": "input_value",
          "name": "VAR"
>>>>>>> 694477364c386ead1a435c7780abe5e683eac075
        }
      ],
      category: Blockly.Categories.texts_extensions,
      extensions: ["colours_texts_extensions", "output_string"]
    });
  }
};

Blockly.Blocks["texts_append"] = {
  /**
   * Block for texts append.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      type: "texts_append",
      message0: "to %1 append %2",
      args0: [
        {
          type: "input_value",
          name: "VAR"
        },
        {
          type: "input_value",
          name: "TEXT"
        }
      ],
      category: Blockly.Categories.texts_extensions,
      extensions: ["colours_texts_extensions", "shape_statement"]
    });
  }
};

Blockly.Blocks["texts_length"] = {
  /**
   * Block for texts length.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      type: "texts_length",
      message0: "length of %1",
      args0: [
        {
          type: "input_value",
          name: "VALUE"
        }
      ],
      category: Blockly.Categories.texts_extensions,
      extensions: ["colours_texts_extensions", "output_number"]
    });
  }
};

Blockly.Blocks["texts_isEmpty"] = {
  /**
   * Block for texts isEmpty.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      type: "texts_isEmpty",
      message0: "%1 is Empty?",
      args0: [
        {
          type: "input_value",
          name: "VALUE"
        }
      ],
      category: Blockly.Categories.texts_extensions,
      extensions: ["colours_texts_extensions", "output_boolean"]
    });
  }
};

Blockly.Blocks["texts_indexOf"] = {
  /**
   * Block for texts indexOf.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      type: "texts_indexOf",
      message0: "index of %3 in %1 from %2",
      args0: [
        {
          type: "input_value",
          name: "VALUE"
        },
        {
          type: "field_dropdown",
          name: "END",
          options: [["start", "FIRST"], ["end", "LAST"]]
        },
        {
          type: "input_value",
          name: "FIND"
        }
      ],
      category: Blockly.Categories.texts_extensions,
      extensions: ["colours_texts_extensions", "output_number"]
    });
  }
};

Blockly.Blocks["texts_charAt"] = {
  /**
   * Block for texts charAt.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      type: "texts_charAt",
      message0: "%1 at %2",
      args0: [
        {
          type: "input_value",
          name: "WHERE"
        },
        {
          type: "input_value",
          name: "VALUE"
        }
      ],
      category: Blockly.Categories.texts_extensions,
      extensions: ["colours_texts_extensions", "output_string"]
    });
  }
};

Blockly.Blocks["texts_getSubstring"] = {
  /**
   * Block for texts getSubstring.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      type: "texts_getSubstring",
      message0: " in %1 get from %3(from %2) to %5(from %4)",
      args0: [
        {
          type: "input_value",
          name: "STRING"
        },
        {
          type: "field_dropdown",
          name: "WHERE1",
          options: [["start", "FROM_START"], ["end", "FROM_END"], ["first", "FIRST"]]
        },
        {
          type: "input_value",
          name: "AT1"
        },
        {
          type: "field_dropdown",
          name: "WHERE2",
          options: [["start", "FROM_START"], ["end", "FROM_END"], ["last", "LAST"]]
        },
        {
          type: "input_value",
          name: "AT2"
        }
      ],
      category: Blockly.Categories.texts_extensions,
      extensions: ["colours_texts_extensions", "output_string"]
    });
  }
};

Blockly.Blocks["texts_changeCase"] = {
  /**
   * Block for texts changeCase.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      type: "texts_changeCase",
      message0: "change case of %1 to %2",
      args0: [
        {
          type: "input_value",
          name: "TEXT"
        },
        {
          type: "field_dropdown",
          name: "CASE",
          options: [["upper", "UPPERCASE"], ["lower", "LOWERCASE"], ["title", "TITLECASE"]]
        }
      ],
      category: Blockly.Categories.texts_extensions,
      extensions: ["colours_texts_extensions", "output_string"]
    });
  }
};

Blockly.Blocks["texts_trim"] = {
  /**
   * Block for texts trim.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      type: "texts_trim",
      message0: "%2 trim of %1",
      args0: [
        {
          type: "input_value",
          name: "TEXT"
        },
        {
          type: "field_dropdown",
          name: "MODE",
          options: [["left", "LEFT"], ["right", "RIGHT"], ["both", "BOTH"]]
        }
      ],
      category: Blockly.Categories.texts_extensions,
      extensions: ["colours_texts_extensions", "output_string"]
    });
  }
};

Blockly.Blocks["texts_println"] = {
  /**
   * Block for texts print.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      type: "texts_println",
      message0: "print %1 \u23CE",
      args0: [
        {
          type: "input_value",
          name: "TEXT"
        }
      ],
      category: Blockly.Categories.texts_extensions,
      extensions: ["colours_texts_extensions", "shape_statement"]
    });
  }
};

Blockly.Blocks["texts_print"] = {
  /**
   * Block for texts print.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      type: "texts_print",
      message0: "print %1",
      args0: [
        {
          type: "input_value",
          name: "TEXT"
        }
      ],
      category: Blockly.Categories.texts_extensions,
      extensions: ["colours_texts_extensions", "shape_statement"]
    });
  }
};

Blockly.Blocks["texts_prompt"] = {
  /**
   * Block for texts prompt.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      type: "texts_prompt",
      message0: "prompt %1",
      args0: [
        {
          type: "input_value",
          name: "TEXT"
        }
      ],
      category: Blockly.Categories.texts_extensions,
      extensions: ["colours_texts_extensions", "shape_statement"]
    });
  }
};

Blockly.Blocks["texts_count"] = {
  /**
   * Block for texts count.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      type: "texts_count",
      message0: "count %2 in %1",
      args0: [
        {
          type: "input_value",
          name: "TEXT"
        },
        {
          type: "input_value",
          name: "SUB"
        }
      ],
      category: Blockly.Categories.texts_extensions,
      extensions: ["colours_texts_extensions", "output_number"]
    });
  }
};

Blockly.Blocks["texts_replace"] = {
  /**
   * Block for texts replace.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      type: "texts_replace",
      message0: "replace %2 to %3 in %1",
      args0: [
        {
          type: "input_value",
          name: "TEXT"
        },
        {
          type: "input_value",
          name: "FROM"
        },
        {
          type: "input_value",
          name: "TO"
        }
      ],
      category: Blockly.Categories.texts_extensions,
      extensions: ["colours_texts_extensions", "output_string"]
    });
  }
};

Blockly.Blocks["texts_reverse"] = {
  /**
   * Block for texts reverse.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      type: "texts_reverse",
      message0: "reverse of %1",
      args0: [
        {
          type: "input_value",
          name: "TEXT"
        }
      ],
      category: Blockly.Categories.texts_extensions,
      extensions: ["colours_texts_extensions", "output_string"]
    });
  }
};
