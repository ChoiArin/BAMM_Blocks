let qTypes = ['입출력', '연산자', '조건문', '반복문'];

function buildPlz() {
  let htmlStr = '<div>';
  htmlStr += '<select id="type">';
  let subHtmlStr = '';
  qTypes.forEach((e, i) => {
    htmlStr += '<option value="' + i + '">' + e + '</option>';
    subHtmlStr += e + '<select name="level">';
    for(let j = 0; j < 3; j++)
      subHtmlStr += '<option value="' + j + '">' + (['下', '中', '上'])[j] + '</option>';
    subHtmlStr += '</select>';
  });
  htmlStr += '</select>';
  htmlStr += subHtmlStr;
  htmlStr += '<button onclick="getQuiz()">문제 문제</button>';
  htmlStr += '</div>';
  htmlStr += '<p id="quiz"></p>'

  let div = document.createElement("div");
  div.innerHTML = htmlStr;
  while (div.children.length > 0)
    document.body.insertBefore(div.children[0], document.getElementById("quiz"));
  
  level = document.getElementsByName("level");
  for(let i = 0; i < 3; i++)
    level[i].selectedIndex = getRndNUM(3);

  getQuiz();
}

function getQuiz() {
  let type = document.getElementById("type").value;
  let level = document.getElementsByName("level");

  let levels = [];
  for(let i = 0; i < level.length; i++)
    levels.push(level[i].value);
  let quiz = makeQuiz(type, levels);

  document.getElementById("quiz").innerHTML = quiz;
}

function getRndStr(usedStr) {
  let RND_STR = ['hello', 'world', 'bbam', 'software maestro swm', 'You will never know until you try', 'There is no royal road to learning', 'If you do not walk today, you will have to run tomorrow', 'coding', 'program', 'programing', 'apple', '김영하', '박성범', '한호민', '홍길동', '도롱뇽', '고질라', '원숭이'];
  if(usedStr !== undefined) {
    if(typeof(usedStr) === Array) {
      usedStr.forEach(e => {
        let idx = usedStr.indexOf(e);
        if(idx)
          RND_STR.splice(idx, 1);
      });
    } else {
      let idx = usedStr.indexOf(usedStr);
      if(idx)
        RND_STR.splice(idx, 1);
    }
  }
  return RND_STR[Math.floor(Math.random() * RND_STR.length)];
}

function getRndFormat() {
  let RND_FORMAT = [
    {
      format: 'hh:mm:ss',
      sep: ':'
    },
    {
      format: 'xxxxxx-xxxxxxx',
      sep: '-'
    },
    {
      format: 'yyyy.mm.dd',
      sep: '.'
    },
    {
      format: 'dd-mm-yyyy',
      sep: '-'
    }
  ];
  return RND_FORMAT[Math.floor(Math.random() * RND_FORMAT.length)];
}

function getRndNUM(max, min) {
  if(min === undefined)
    min = 0;
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRndBool(opt) {
  if(opt === undefined || opt === 1)
    opt = 2;
  if(opt < 1)
    return false;
  return Math.floor(Math.random() * opt) === 0 ? false : true;
}

function makeQuiz(type, levels) {
  //dog foot bird foot
  return baguette[qTypes[type]](levels);
}

function isSame(arr, arr2) {
  if(arr.length !== arr.length)
    return false;

  for(let i = 0; i < arr.length; i++)
    if(arr[i] !== arr2[i])
      return false;
  
  return true;
}

function shuffle(arr) {
  if(typeof(arr) !== Array || arr.length <= 1)
    return arr;

  let tmpArr = [];
  for(let i = 0; i < arr.length; i++)
    tmpArr.push(arr[i]);

  let t, x;
  do {
    for(let i = 0; i < arr.length; i++) {
        x = arr[i];
        arr[i] = arr[t];
        arr[t] = x;
    }
  } while(isSame(tmpArr, arr));
  return arr;
}

//#region flour
let flour = {};

flour['입출력'] = {
  0: [
    {
      outer: '그대로 출력해보자',
      inside: ''
    }
  ],
  1: [
    {
      isPlural: true,
      outer: '한 줄에 하나씩',
      inside: ''
    },
    {
      isStr: true,
      outer: '영문 소문자를 대문자로 바꾸어',
      inside: ''
    },
    {
      isStr: true,
      outer: '영문 대문자를 소문자로 바꾸어',
      inside: ''
    },
    {
      outer: '작은 따옴표로 감싸서',
      inside: ''
    },
    {
      outer: '큰 따옴표로 감싸서',
      inside: ''
    }
  ],
  2: [
    {
      isStr: true,
      isFunc: true,
      outer: function() {
        let formatSet = getRndFormat();
        let formatSetArr = formatSet.format.split(formatSet.sep);
        return '"' + formatSet.format + '" 형태라고 가정하고 ' + formatSetArr[getRndNUM(formatSetArr.length)] + ' 부분만'
      },
      inside: ''
    },
    {
      isStr: true,
      isFunc: true,
      outer: function() {
        let formatSet = getRndFormat();
        return '"' + formatSet.format + '" 형태라고 가정하고 ' + formatSet.sep + '를 빼고'
      },
      inside: ''
    },
    {
      isStr: true,
      isFunc: true,
      outer: function() {
        let formatSet = getRndFormat();
        let formatSetArr = formatSet.format.split(formatSet.sep);
        return '"' + formatSet.format + '" 형태라고 가정하고 "' + shuffle(formatSetArr).join(formatSet.sep) + '" 형태로 바꾸어'
      },
      inside: ''
    }
  ]
};

flour['연산자'] = {
  0: [
    {
      isNum: true,
      isFunc: true,
      outer: function() {
        return getRndNUM(26) + "을 더하고";
      },
      inside: ''
    },
    {
      isNum: true,
      isFunc: true,
      outer: function() {
        return getRndNUM(26) + "을 빼고";
      },
      inside: ''
    },
    {
      isNum: true,
      isFunc: true,
      outer: function() {
        return getRndNUM(26) + "을 곱하고";
      },
      inside: ''
    },
    {
      isNum: true,
      isFunc: true,
      outer: function() {
        return getRndNUM(26) + "으로 나누고";
      },
      inside: ''
    }
  ],
  1: [
    {
      isNum: true,
      isPlural: true,
      outer: '모두 더하고',
      inside: ''
    },
    {
      isNum: true,
      isPlural: true,
      outer: '평균을 구하고',
      inside: ''
    },
    {
      isNum: true,
      isFunc: true,
      outer: function() {
        return getRndNUM(26) + "으로 나눈 나머지를 구하고";
      },
      inside: ''
    },
    {
      isNum: true,
      isFunc: true,
      outer: function() {
        return getRndNUM(26) + "으로 나눈 몫을 구하고";
      },
      inside: ''
    },
    {
      isNum: true,
      prNum: 2,
      outer: "두 수의 합을 구하고",
      inside: ''
    },
    {
      isNum: true,
      prNum: 2,
      outer: "두 수의 곱을 구하고",
      inside: ''
    },
    {
      isNum: true,
      prNum: 2,
      outer: "첫번째 수에서 두번째 수를 뺀 값을 구하고",
      inside: ''
    },
    {
      isNum: true,
      prNum: 2,
      outer: "두번째 수에서 첫번째 수를 뺀 값을 구하고",
      inside: ''
    },
    {
      isNum: true,
      prNum: 2,
      outer: "첫번째 수를 두번째 수로 나눈 값을 구하고",
      inside: ''
    },
    {
      isNum: true,
      prNum: 2,
      outer: "두번째 수를 첫번째 수로 나눈 값을 구하고",
      inside: ''
    },
    {
      isNum: true,
      outer: '부호를 바꾸고',
      inside: ''
    }
  ],
  2: [
    {
      isNum: true,
      outer: '그만큼 2를 거듭제곱한 값을 구하고',
      inside: ''
    },
    {
      isNum: true,
      prNum: 2,
      isFunc: true,
      outer: "두 수의 합, 차, 곱, 몫, 나머지를 구하고",
      inside: ''
    }
  ]
};

flour['조건문'] = {
  0: [
    {
      isNum: true,
      outer: '짝수만',
      inside: ''
    },
    {
      isNum: true,
      outer: '홀수만',
      inside: ''
    },
    {
      isNum: true,
      isOtho: true,
      isFunc: true,
      outer: function() {
        return getRndNUM(26) + "보다 크면";
      },
      inside: ''
    },
    {
      isNum: true,
      isOtho: true,
      isFunc: true,
      outer: function() {
        return getRndNUM(26) + "보다 크면";
      },
      inside: ''
    },
    {
      isNum: true,
      isPlural: true,
      isFunc: true,
      outer: function() {
        return getRndNUM(26) + "보다 큰 값만";
      },
      inside: ''
    },
    {
      isNum: true,
      isPlural: true,
      isFunc: true,
      outer: function() {
        return getRndNUM(26) + "보다 작은 값만";
      },
      inside: ''
    },
    {
      isStr: true,
      isFunc: true,
      outer: function() {
        return "길이가 " + getRndNUM(6, 2) + "보다 긴 경우에만";
      },
      inside: ''
    },
    {
      isStr: true,
      isFunc: true,
      outer: function() {
        return "길이가 " + getRndNUM(6, 2) + "보다 짧은 경우에만";
      },
      inside: ''
    }
  ],
  1: [
    {
      isNum: true,
      isOtho: true,
      isFunc: true,
      outer: function() {
        let n = getRndNUM(26 / 2);
        let m = getRndNUM(n + 26, n + 1);
        return n + "과 " + m + "사이면";
      },
      inside: ''
    },
    {
      isNum: true,
      isOtho: true,
      isFunc: true,
      outer: function() {
        let n = getRndNUM(26 / 2);
        let m = getRndNUM(n + 26, n + 1);
        return n + "과 " + m + "사이가 아니면";
      },
      inside: ''
    },
    {
      isNum: true,
      isPlural: true,
      isFunc: true,
      outer: function() {
        let n = getRndNUM(26 / 2);
        let m = getRndNUM(n + 26, n + 1);
        return n + "과 " + m + "사이인 것만";
      },
      inside: ''
    },
    {
      isNum: true,
      isPlural: true,
      isFunc: true,
      outer: function() {
        let n = getRndNUM(26 / 2);
        let m = getRndNUM(n + 26, n + 1);
        return n + "과 " + m + "사이가 아닌 것만";
      },
      inside: ''
    },
    {
      isStr: true,
      isFunc: true,
      outer: function() {
        let n = getRndNUM(6, 2);
        let m = getRndNUM(n + 6, n + 1);
        return "길이가 " + n + "과 " + m + " 사이인 경우에만";
      },
      inside: ''
    },
    {
      isStr: true,
      isFunc: true,
      outer: function() {
        let n = getRndNUM(6);
        let m = getRndNUM(n + 6, n + 1);
        return "길이가 " + n + "과 " + m + " 사이가 아닌 경우에만";
      },
      inside: ''
    }
  ],
  2: [
    {
      isNum: true,
      isFunc: true,
      outer: function() {
        let n = (getRndNUM(6, 1)) * 60;
        let c = getRndNUM(6, 2);
        let ret = '';
        for(let i = 0; i < c; i++)
          ret += (i * n / c) + "과 " + ((i + 1) * n / c) + "사이이면... ";
        return ret;
      },
      inside: ''
    },
    {
      isStr: true,
      isFunc: true,
      outer: function() {
        let n = (getRndNUM(6, 1)) * 6;
        let c = 3;
        let ret = '길이가 ';
        for(let i = 0; i < c; i++)
          ret += (i * n / c) + "과 " + ((i + 1) * n / c) + "사이이면... ";
        return ret;
      },
      inside: ''
    }
  ]
};

flour['반복문'] = {
  0: [
    {
      outer: '계속 반복해서',
      inside: ''
    }
  ],
  1: [
    {
      isFunc: true,
      outer: function(){
        return getRndNUM(11, 1) + "번 반복해서";
      },
      inside: ''
    }
  ],
  2: [
    {
      isFunc: true,
      outer: function(){
        return getRndNUM(11, 1) + "번 반복해서";
      },
      inside: ''
    }
  ]
};

function yeast(flourStr, level, inputParam, inputCount) {
  let sacks = [];
  for(let i = Math.max(level - 1, 0); i <= level; i++)
    sacks = sacks.concat(flour[flourStr][i]);
  
  let sack = sacks.filter(function(e){
    if((!e.isStr && !e.isNum) || (inputParam === 's' && e.isStr) || (inputParam === 'i' && e.isNum)) {
      if(inputCount === 1)
        return (!e.isOtho && !e.isPlural && !e.prNum) || e.isOtho || !e.isPlural || e.prNum === 1;
      else if(inputCount === -1)
        return (!e.isOtho && !e.isPlural && !e.prNum) || e.isPlural;
      else
        return (!e.isOtho && !e.isPlural && !e.prNum) || e.isPlural || e.prNum === inputCount;
    }
    return false;
  });

  let sackChoice = sack[getRndNUM(sack.length)];
  if(!sackChoice)
    return '';

  let ret = '';
  if(sackChoice.isFunc)
    ret = sackChoice.outer();
  else
    ret = sackChoice.outer;

  return ret;
}
//#endregion

//#region baguette
let baguette = {};

baguette['입력'] = function(level, inputType) {
  if(level === 0) {
    switch (inputType) {
      case 's':
        return '주어진 문자열을 이용해';
        break;

      case 'i':
        return '주어진 숫자를 이용해';
        break;

      case 'ss':
        return '다음의 문자열들을 이용해';
        break;

      case 'is':
        return '다음의 숫자들을 이용해';
        break;

      default:
        if(inputType.length > 1)
          return '다음 ' + inputType.substring(1) + '개의 ' + (inputType.substring(0, 1) === 's' ? '문자열을' : '숫자를') + " 이용해";
        break;
    }
  } else {
    switch (inputType) {
      case 's':
        return '문자열을 하나 입력 받아';
        break;

      case 'i':
        return '숫자를 하나 입력 받아';
        break;

      case 'ss':
        return '문자열들을 입력 받아';
        break;

      case 'is':
        return '숫자들을 입력 받아';
        break;

      default:
        if(inputType.length > 1)
          return inputType.substring(1) + '개의 ' + (inputType.substring(0, 1) === 's' ? '문자열을' : '숫자를') + " 입력 받아";
        break;
    }
  }
}

baguette['입출력'] = function(levels) {
  let level_io = parseInt(levels[(qTypes.indexOf('입출력'))]);
  let level_op = parseInt(levels[(qTypes.indexOf('연산자'))]);
  let level_if = parseInt(levels[(qTypes.indexOf('조건문'))]);
  let level_rp = parseInt(levels[(qTypes.indexOf('반복문'))]);
  let ret = '';
  let param = [];

  let inputParam = 's';
  let inputCount = getRndNUM(3, 1);
  if(getRndBool())
    inputParam = 'i';

  if(getRndBool(level_rp)) {
    if(getRndBool())
      inputCount = getRndNUM(11, 1) * 10;
    else
      inputCount = -1;
  }

  ret += baguette['입력'](level_io, inputParam + (inputCount === 1 ? '' : (inputCount < 0 ? 's' : Math.max(inputCount, 10)))) + " ";
  
  //for(let i = 0; i < (inputCount < 0 ? 5 : inputCount); i++)
  //  param.push(inputParam === 's' ? getRndStr(param) : getRndNUM(100, -100));

  if(level_io === 0) {
    ret += yeast('입출력', level_io, inputParam, inputCount);
    return ret + "<br><br>[주어진 입력]<br>" + param.join("<br>") + "<br><br>[출력 예제]<br>";
  } else {
    let cnType = getRndNUM(10);
    if(cnType === 0)
      ret += yeast('조건문', level_io, inputParam, inputCount) + ' ';
    else if(cnType === 1)
      ret += yeast('연산자', level_io, inputParam, inputCount) + ' ';
    ret += yeast('입출력', level_io, inputParam, inputCount) + ' 출력해보자.';
  }

  return ret + "<br><br>[입력 예제]<br>" + param.join("<br>") + "<br><br>[출력 예제]<br>";
}

baguette['연산자'] = function(levels) {
  return "Not yet.";
}

baguette['조건문'] = function(levels) {
  return "Not yet.";
}

baguette['반복문'] = function(levels) {
  return "Not yet.";
}
//#endregion