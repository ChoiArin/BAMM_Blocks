goog.require('Blockly.Python');

var NODETYPE = {
  FUNC: 1,
  CONTROL: 2,
  EXECUTE: 3
};

function RootNode() {
  this.children = [];
}

function Node(line) {
  this.lineData = line;
  this.parent = null;
  this.children = [];
  this.xml = "";
}

function Tree() {
  this.root = new RootNode();
}

Tree.prototype.DFS = function(callback) {
  (function recurse(currentNode) {
    for (var i = 0, length = currentNode.children.length; i < length; i++)
      recurse(currentNode.children[i]);

    if(currentNode.lineData)
      callback(currentNode);
  })(this.root);
};

Tree.prototype.serialize = function() {
  var xml = "";
  (function recurse(currentNode) {
    var tagName = "";
    if(currentNode.lineData) {
      var m = currentNode.xml.match(/^<([^ ^>]+)/);
      if(m !== null)
        tagName = m[1];
      
      xml += currentNode.xml;
      
      xml += '<statement name="SUBSTACK">';
  
      var xmlTail = "";
      for (var i = 0, length = currentNode.children.length; i < length; i++) {
        var subTagName = recurse(currentNode.children[i]);
        xml += "<next>";
        xmlTail = "</next></" + subTagName + ">" + xmlTail;
      }
      xml += xmlTail;

      xml += "</statement>";
    } else {
      var xmlTail = "";
      for (var i = 0, length = currentNode.children.length; i < length; i++) {
        var subTagName = recurse(currentNode.children[i]);
        xml += "<next>";
        xmlTail = "</next></" + subTagName + ">" + xmlTail;
      }
      xml += xmlTail;
    }
    return tagName;
  })(this.root)

  xml = xml.replace(new RegExp('<statement name="SUBSTACK"></statement>', 'g'), "");
  xml = xml.replace(new RegExp('<next></next>', 'g'), "");

  return "<xml>" + xml + "</xml>";
};

Tree.prototype.lastNodeOfDepth = function(depth) {
  return (function recurse(currentNode, level) {
    if(depth === level)
      return currentNode;
    
    if(currentNode.children.length === 0)
      return currentNode;
    
    return recurse(currentNode.children[currentNode.children.length - 1], level + 1);
  })(this.root, 0);
};

Blockly.Python.revert = function(code) {
  var lines = code.split(/[\r\n]+/);

  var tabWord = '  ';
  //#region Determine - space(or tab) length
  for(var i = 0; i < lines.length; i++) {
    var tabArr = lines[i].match(/^[ \t]+/);
    
    if(tabArr === null)
      continue;

    tabWord = tabArr[0];
    break;
  }
  //#endregion

  var abstractTree = new Tree();
  //#region line-Tree
  lines.forEach(ln => {
    var nowDepth = getDepth(ln, tabWord);
    var parent = abstractTree.lastNodeOfDepth(nowDepth);
    var newNode = new Node(ln.trim());
    newNode.parent = parent;
    parent.children.push(newNode);
  });
  //#endregion

  //#region line-Tree tokenization
  abstractTree.DFS(function(node) {
    var headerBody = splitHeader(node.lineData);
    var header = headerBody.header;
    var argsCode = headerBody.body;
    var args;

    if(header in revertHeaders) {
      if(argsCode[0] === "(")
        args = getFuncArgs(argsCode);
      else
        args = getControlArgs(argsCode);
    } else {
      args = getControlArgs(argsCode);
    }

    node.xml = procHeader(header, args);
  });
  //#endregion

  return abstractTree.serialize();
}

function procHeader(header, args) {
  var xml = "";
  
  if(header in revertHeaders) {
    xml = revertHeaders[header](args);
  } else {
    xml = args.toString();
  }

  return xml;
}

function getDepth(codeLine, tab) {
  var aoiArr = codeLine.match(/^[ \t]+/);
  
  if(aoiArr === null)
      return 0;
  
  var aoi = aoiArr[0];
  return aoi.match(new RegExp(tab, 'g')).length;
}

function splitHeader(codeLine) {
  var m = codeLine.match(/^""$/);
  if(m !== null)
    return null;
  m = codeLine.match(/^[^ ^\(^\)^\{^\}^\[^\]]+/);
  if(m === null)
    return null;
  return { header: m[0], body: codeLine.replace(new RegExp("^" + m[0]), "").trim() };
}

function getFuncArgs(codeLine) {
  var tokens = [], args;
  var m = codeLine.match(/\(([\w\W]+)\)$/);
  if(m && m.length > 0) {
    var args = m[1];
    var parts = args.split(",");
    
    var commaParts = "";
    parts.forEach(elem => {
      if(elem[0] == "'" || elem[0] == '"') {
        commaParts = elem;
      } else if(elem[elem.length - 1] == "'" || elem[elem.length - 1] == '"') {
        commaParts += "," + elem;
        tokens.push(commaParts);
        commaParts = "";
      } else if(commaParts !== "") {
        commaParts += "," + elem;
      } else {
        tokens.push(elem);
      }
    });
  }

  return tokens;
}

function getControlArgs(codeLine) {
  var tokens = [];
  var m, re = /("[\w\W^\"]+"|[\w'"\(\)]+|[\+\-\*\/\=\<\>]+)/g;
  do {
    m = re.exec(codeLine);
    if(m && m.length > 0)
      tokens.push(m[1]);
  } while(m);

  return tokens;
}

function extractFromComma(literal) {
  var tokens = [], args;
  var m = literal.match(/^['"]([\w\W]+)['"]$/);
  if(m && m.length > 0)
    return m[1];
  else
    return literal;
}

revertHeaders = {};

//#region control methods
revertHeaders['if'] = function(args) {
  var bData = '<block type="control_if">';
  switch(args.length) {
    case 1:
    break;

    case 2:
    bData += '<value name="CONDITION">';
    bData += revertExecuters[args[0]](args[1]);
    bData += '</value>';
    break;

    case 3:
    bData += '<value name="CONDITION">';
    bData += revertExecuters[args[1]](args[0], args[2]);
    bData += '</value>';
    break;
    
    default:
    break;
  }
  return bData;
};

revertHeaders['else'] = function(args) {

};

revertHeaders['for'] = function(args) {

};

revertHeaders['while'] = function(args) {

};

revertHeaders['break'] = function(args) {

};

revertHeaders['continue'] = function(args) {

};

revertHeaders['return'] = function(args) {

};

revertHeaders['def'] = function(args) {

};

revertHeaders['del'] = function(args) {

};
//#endregion

//#region func methods
revertHeaders['str'] = function(args) {
  
};

revertHeaders['len'] = function(args) {
  
};

revertHeaders['find'] = function(args) {
  
};

revertHeaders['upper'] = function(args) {
  
};

revertHeaders['lower'] = function(args) {
  
};

revertHeaders['title'] = function(args) {
  
};

revertHeaders['lstrip'] = function(args) {
  
};

revertHeaders['rstrip'] = function(args) {
  
};

revertHeaders['strip'] = function(args) {
  
};

revertHeaders['print'] = function(args) {
  var bData = '<block type="texts_println">';
  bData += '<value name="TEXT">';
  bData += '<shadow type="text">';
  var headerBody = splitHeader(args[0]);
  if(headerBody) {
    var header = headerBody.header;
    var body = headerBody.body;
    if(header in revertHeaders) {
      if(body[0] === "(") {
        bData += '<field name="TEXT"> </field>';
        bData += '</shadow>';
        bData += revertHeaders[header](getFuncArgs(args));
      }
      else {
        bData += '<field name="TEXT"> </field>';
        bData += '</shadow>';
        bData += revertHeaders[header](getControlArgs(args));
      }
    } else {
      bData += '<field name="TEXT">' + extractFromComma(args[0]) + '</field>';
      bData += '</shadow>';
    }
  } else {
    bData += '<field name="TEXT">' + extractFromComma(args[0]) + '</field>';
    bData += '</shadow>';
  }
  bData += '</value>';
  return bData;
};

revertHeaders['count'] = function(args) {
  
};

revertHeaders['replace'] = function(args) {
  
};

revertHeaders['randint'] = function(args) {
  
};

revertHeaders['round'] = function(args) {
  
};

revertHeaders['fabs'] = function(args) {
  
};

revertHeaders['pow'] = function(args) {
  
};

revertHeaders['floor'] = function(args) {
  
};

revertHeaders['ceiling'] = function(args) {
  
};

revertHeaders['sqrt'] = function(args) {
  
};

revertHeaders['sin'] = function(args) {
  
};

revertHeaders['cos'] = function(args) {
  
};

revertHeaders['tan'] = function(args) {
  
};

revertHeaders['asin'] = function(args) {
  
};

revertHeaders['acos'] = function(args) {
  
};

revertHeaders['atan'] = function(args) {
  
};

revertHeaders['log'] = function(args) {
  
};

revertHeaders['log10'] = function(args) {
  
};

revertHeaders['exp'] = function(args) {
  
};

revertHeaders['range'] = function(args) {
  
};

revertHeaders['append'] = function(args) {
  
};

revertHeaders['insert'] = function(args) {
  
};
//#endregion

//#region methods of executors
revertExecuters = {};

revertExecuters['=='] = function(left, right) {
  var bData = '<block type="operator_equals">';
  bData += '<value name="OPERAND1">';
  bData += '<shadow type="text">';
  bData += '<field name="TEXT">' + left + '</field>';
  bData += '</shadow>';
  bData += '</value>';
  bData += '<value name="OPERAND2">';
  bData += '<shadow type="text">';
  bData += '<field name="TEXT">' + right + '</field>';
  bData += '</shadow>';
  bData += '</value>';
  bData += '</block>';
  return bData;
};
//#endregion