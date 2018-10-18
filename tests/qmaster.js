let MAX_LEVEL = 10; //각 분야별 최대 레벨
let qTypes = ['입출력', '연산자', '조건문', '반복문']; //분야, html 출력용

//분야별 입력부 생성
function buildPlz() {
  let htmlStr = '<div style="margin-bottom: 10px;">';
  let subHtmlStr = '';
  qTypes.forEach((e, i) => {
    subHtmlStr += e + '<select name="level">';
    for(let j = 0; j < MAX_LEVEL; j++)
      subHtmlStr += '<option value="' + j + '">' + j + '</option>';
    subHtmlStr += '</select>';
  });
  htmlStr += subHtmlStr;
  htmlStr += '<button onclick="getQuiz()">문제 문제</button>';
  htmlStr += '</div>';
  htmlStr += '<div id="quiz"></div>'

  let div = document.createElement("div");
  div.innerHTML = htmlStr;
  while (div.children.length > 0)
    document.body.insertBefore(div.children[0], document.getElementById("quiz"));
  
  level = document.getElementsByName("level");
  for(let i = 0; i < qTypes.length; i++)
    level[i].selectedIndex = getRndNUM(MAX_LEVEL);

  getQuiz();
}

//분야별 레벨 가져와서 퀴즈 생성 및 출력
function getQuiz() {
  let level = document.getElementsByName("level");

  let levels = [];
  for(let i = 0; i < level.length; i++)
    levels.push(level[i].value);
  let quiz = makeQuiz(levels);

  document.getElementById("quiz").innerText = quiz.desc.replace(/\n  /g, "\n　　") + "\n" + quiz.code.replace(/\n  /g, "\n　　");
}

//랜덤 숫자
function getRndNUM(max, min = 0) {
  return Math.floor(Math.random() * (max - min)) + min;
}

//랜덤 이름
function getRndName(usedName) {
  return getRndStr(['철수', '영희', '민수', '호민이', '성범이', '영하'], usedName);
}

//랜덤 문자열
function getRndResult(usedResult) {
  return getRndStr(['Berry', 'Banana', 'Monkey', 'Dog', 'Sky', 'Box', 'Can', 'Summer', 'Winter'], usedResult);
}

//랜덤 문자열
function getRndStr(rndStr, usedStr) {
  let RND_STR = rndStr;
  if(usedStr !== undefined) {
    if(typeof usedStr === 'array') {
      for(let i = 0; i < usedStr.length; i++) {
        var usedIdx = RND_STR.indexOf(usedStr[i]);
        if (usedIdx > -1)
          RND_STR.splice(usedIdx, 1);
      }
    } else {
      var usedIdx = RND_STR.indexOf(usedStr);
      if (usedIdx > -1)
        RND_STR.splice(usedIdx, 1);
    }
  }
  return RND_STR[getRndNUM(RND_STR.length - 1)];
}

//임계값 형식
function convertBin(inputLevel, threshold) {
  return inputLevel < threshold ? 0 : 1;
}

//가파른 경사
function convertPow(inputLevel, maxOutput) {
  let ratio = maxOutput / Math.pow(MAX_LEVEL, 2);
  return Math.round(Math.pow(inputLevel, 2) * ratio);
}

//완만한 경사
function convertHill(inputLevel, maxOutput) {
  let ratio = maxOutput / Math.log(MAX_LEVEL);
  return Math.round(Math.log(inputLevel) * ratio);
}

//퀴즈를 만들자
function makeQuiz(levels) {
  let quiz = { //퀴즈 객체
    code: '', desc: '', pre: '',
    addCode: function(nCode){ this.code += this.pre + nCode + "\n"},
    addDesc: function(nDesc, noNewLine = false){ this.desc += this.pre + nDesc + (noNewLine ? '' : "\n")},
    addPre: function(mult = 1){for(let i = 0; i < mult; i++) this.pre += '  ';},
    subPre: function(mult = 1){this.pre = this.pre.substring(2 * mult);}
  };

  //각 분야 별 레벨을 적당히 매핑
  let ioLevel = convertBin(levels[0], 1);
  let opLevel = convertHill(levels[1], 6);
  let ifLevel = convertPow(levels[2], 3);
  let frLevel = convertPow(levels[3], 2);

  let inVar = []; //입력 변수
  if(frLevel === 2 && getRndNUM(3)) { //중첩 반복문을 사용할 수 있는 경우
    let tName = getRndName();
    switch (getRndNUM(2)) {
      case 0:
        quiz.addDesc(tName + '는 구구단을 공부하고 있습니다.');
        quiz.addDesc(tName + '가 잘 공부할 수 있도록 구구단을 출력하는 프로그램을 만들어보세요.');

        quiz.addCode('for x in range(9):');
        quiz.addPre();
        quiz.addCode('for y in range(9):');
        quiz.addPre();
        quiz.addCode('print(x + " * " + y + " = " + (x * y))');
        quiz.subPre(2);

        if(ioLevel) {
          inVar.push('INVAR1');
          quiz.addDesc('구구단을 모두 출력한 다음에는, 정수를 하나 입력받아 그 단만 출력하세요.');

          quiz.addCode('for y in range(9):');
          quiz.addPre();
          quiz.addCode('print(INVAR1 + " * " + y + " = " + (INVAR1 * y))');
        }
        break;

      case 1:
        quiz.addDesc(tName + '는 오랜 수련 끝에 369 게임을 마스터했습니다.');
        quiz.addDesc('주어진 조건에 따라 코딩해서 ' + tName + '에게 더 어려운 게임을 만들어주세요.');
        quiz.addPre();
        
        if(ifLevel) {
          quiz.addDesc('조건 1. ', true);
          if(ioLevel) {
            inVar.push('INVAR1');
            quiz.addCode('for x in range(INVAR1):');
            quiz.addDesc('정수를 하나 입력받고, 1부터 그 수까지 한 줄에 하나씩 출력하세요.');
          } else {
            quiz.addCode('for x in range(100):');
            quiz.addDesc('1부터 100까지 수를 한 줄에 하나씩 출력하세요.');
          }

          let num1 = getRndNUM(9, 2);
          let num2 = getRndNUM(9, 2);
          quiz.addDesc('조건 2. 만약 출력할 수가 ' + num1 + '의 배수라면 그 줄에는 1부터 그 숫자 사이에 있는 ' + num2 + '의 배수들을 출력하세요.');
          quiz.addDesc('예를 들어 ' + ((num2 * 5) + (num1 - (num2 * 5) % num1)) + '는 ' + num1 + '의 배수이므로, 그 줄에는 ', true);
          for(let i = num2; i <= (num2 * 5) + (num1 - (num2 * 5) % num1); i += num2) {
            if(i != num2)
              quiz.addDesc(' ', true);
            quiz.addDesc(i, true);
          }
          quiz.addDesc('를 출력해야합니다.');
          quiz.addPre();
          quiz.addCode('if x % ' + num1 + ' == 0:');
          quiz.addPre();
          quiz.addCode('for y in range(x):');
          quiz.addPre();
          quiz.addCode('if y % ' + num2 + ' == 0:');
          quiz.addPre();
          quiz.addCode('if y / num2 >= 2: print(" ", end="")');
          quiz.addCode('print(y, end="")');
          quiz.subPre(2);
          quiz.addCode('print("")');
        } else {
          quiz.addDesc('조건: ', true);
          if(ioLevel) {
            inVar.push('INVAR1');
            quiz.addCode('for x in range(INVAR1):');
            quiz.addDesc('정수를 하나 입력받고, 1부터 그 수까지 순서대로 출력합니다.');
          } else {
            quiz.addCode('for x in range(10):');
            quiz.addDesc('1부터 10까지 순서대로 출력합니다.');
          }
          quiz.addDesc('단, 각 줄에는 숫자 하나만 출력하는 것이 아니라, 그 수부터 1까지 거꾸로 한 줄에 출력해야 합니다.');
          quiz.addDesc('예를 들어 두번째 줄이라면 2 1을, 다섯번째 줄이라면 5 4 3 2 1을 출력해야 합니다.');
          quiz.addPre();
          quiz.addCode('for y in range(x): print(y)');
        }
        break;

      case 2:
        quiz.addDesc(tName + '는 독특하게 생긴 주사위를 몇 개 가지고 있습니다.');
        for(let i = 0; i < getRndNUM(3, 2); i++) {
          inVar.push(getRndNUM(12, 4));
          if(i > 0)
            quiz.addDesc(', ', true);
          quiz.addDesc((['첫번째', '두번째', '세번째'])[i] + ' 주사위는 1부터' + inVar[inVar.length - 1] + '까지', true);
        }
        quiz.addDesc('의 숫자가 나올 수 있습니다.');
        
        let bbb = [];
        bbb.push('df');
        if(opLevel)
          bbb.push('op');
        if(ifLevel)
          bbb.push('if');

        quiz.addCode('for x in range(' + inVar[0] + '):');
        quiz.addCode('  for y in range(' + inVar[1] + '):');
        if(inVar.length > 2)
          quiz.addCode('    for z in range(' + inVar[2] + '):');

        quiz.addDesc('이 주사위들을 던졌을 때 총 경우의 수는 ' + (inVar[0] * inVar[1] * (inVar.length > 2 ? inVar[2] : 1)) + '가지입니다.');
        switch (bbb[getRndNUM(bbb.length - 1)]) {
          case 'op':
            quiz.addDesc('이 중 다음 조건을 만족하는 경우만 출력해보세요.');
            quiz.addCode('조건: ');
            break;

          case 'if':
            quiz.addDesc('이 중 다음 조건을 만족하는 경우만 출력해보세요.');
            quiz.addDesc('조건 1. 첫번째 주사위의 숫자가 두번째 주사위의 숫자보다 ', true);
            let cond = '';
            if(getRndNUM(1)) {
              quiz.addDesc('큽니다.');
              cond += 'x > y';
            } else {
              quiz.addDesc('작습니다.');
              cond += 'x < y';
            }
            cond += ' && ';
            if(inVar.length > 2) {
              quiz.addDesc('조건 2. 두번째 주사위의 숫자가 세번째 주사위의 숫자보다 ', true); 
              if(getRndNUM(1)) {
                quiz.addDesc('큽니다.');
                cond += 'y > z';
              } else {
                quiz.addDesc('작습니다.');
                cond += 'y < z';
              }
            } else {
              quiz.addDesc('조건 2. 두번째 주사위의 숫자가 ', true); 
              if(getRndNUM(1)) {
                quiz.addDesc('짝수입니다.');
                cond += 'y % 2 == 0';
              } else {
                quiz.addDesc('홀수입니다.');
                cond += 'y % 2 == 1';
              }
            }
            quiz.addPre(inVar.length);
            quiz.addCode('if ' + cond + ':');
            quiz.addPre();
            quiz.addCode('print(x + " " + y' + (inVar.length > 2 ? '+ " " + z' : '') + ')');
            break;
          
          default:
            quiz.addDesc('주사위의 순서에 주의하여 모든 경우를 출력해보세요.');
            quiz.addPre(inVar.length);
            quiz.addCode('print(x + " " + y' + (inVar.length > 2 ? '+ " " + z' : '') + ')');
            break;
        }
        break;
    }
  } else {
    if(frLevel && getRndNUM(3)) { //반복문을 사용할 수 있는 경우
      if(ioLevel) {
        inVar.push('INVAR1');
        quiz.addDesc('먼저 정수를 하나 입력 받으세요.');
        quiz.addCode('for x in range(INVAR1):');
        quiz.addDesc('입력된 수만큼 다음 과정을 반복하세요:');
      } else {
        inVar.push(getRndNUM(10, 1) * 10);
        quiz.addCode('for x in range('+inVar[inVar.length - 1]+'):');
        quiz.addDesc('다음 과정을 ' + inVar[inVar.length - 1] + '번 반복하세요:');
      }
      quiz.addPre();
    }

    if(ifLevel >= 3 && getRndNUM(1)) { //중첩 조건문을 사용할 수 있는 경우
      if(opLevel && getRndNUM(1)) {
        inVar.push('INVAR2');
        if(getRndNUM(1)) {
          inVar.push('INVAR3');
          quiz.addDesc('정수를 두 개 입력 받으세요.');
        } else {
          inVar.push(getRndNUM(9, 1));
          quiz.addDesc('정수를 한 개 입력 받으세요.');
        }
        quiz.addDesc('입력된 정수' + (inVar.indexOf('INVAR3') >= 0 ? '들' : '') + '에 대해, 아래 조건에 따라 값을 출력하세요.');

        let namedVar1 = inVar.indexOf('INVAR3') >= 0 ? '첫번째 수' : '그 수';
        let namedVar2 = inVar.indexOf('INVAR3') >= 0 ? '두번째 수' : inVar[inVar.length - 1];

        let usedOp = [];
        let rndResult = [];
        for(let i = 0; i < opLevel; i++) {
          let rndOp;
          do {
            rndOp = getRndNUM(op_Baguette.length - 1);
          } while (usedOp.indexOf(rndOp) >= 0);

          rndResult.push(getRndResult(rndResult));
          let rndCond = getRndNUM(condition_Baguette.length - 1);
          quiz.addDesc('  ' + condition_Baguette[rndCond].descFunc(op_Baguette[rndOp].descFunc(namedVar1, namedVar2), getRndNUM(5)) + josa('"' + rndResult[i] + '"', '을', '를') + ' 출력하세요.');
          quiz.addCode('if ' + sprintf(condition_Baguette[rndCond].line, 'INVAR2', inVar.indexOf('INVAR3') >= 0 ? 'INVAR3' : inVar[inVar.length - 1]) + 'print("' + rndResult[i] + '")');

          usedOp.push(rndOp);
        }
      } else {
        inVar.push('INVAR2');
        quiz.addDesc('정수를 하나 입력 받으세요.');
        quiz.addDesc('입력된 정수에 대해, 아래 조건에 따라 값을 출력해보세요.');

        let rng = getRndNUM(5, 2) * 5;
        let rndResult = [];
        for(let i = 0; i < getRndNUM(5, 3); i++) {
          rndResult.push(getRndResult(rndResult));
          quiz.addDesc('  값이 ' + (i * rng) + '에서 ' + ((i + 1) * rng - 1) + '까지의 수 중 하나라면 ' + rndResult[i] + '을 출력합니다.');
          quiz.addCode((i > 0 ? 'el' : '') + 'if INVAR2 >= ' + (i * rng) + ' && INVAR2 <= ' + ((i + 1) * rng - 1) + ': print("' + rndResult[i] + '")');
        }
        quiz.addDesc('만약 해당하는 경우가 없다면 "Out of Range"를 출력합니다.');
        quiz.addCode('else: print("Out of Range")');
      }
    } else if(ifLevel) {
      if(ioLevel) {
        inVar.push('INVAR2');
        if(getRndNUM(1)) {
          inVar.push('INVAR3');
          quiz.addDesc('정수를 두 개 입력 받으세요.');
        } else {
          inVar.push(getRndNUM(9, 1));
          quiz.addDesc('정수를 한 개 입력 받으세요.');
        }
      } else {
        inVar.push(getRndNUM(9, 1));
        inVar.push(getRndNUM(9, 1));
      }

      let namedVar1 = inVar.indexOf('INVAR3') >= 0 ? '첫번째 수' : (inVar.indexOf('INVAR2') >= 0 ? '그 수' : inVar[inVar.length - 2]);
      let namedVar2 = inVar.indexOf('INVAR3') >= 0 ? '두번째 수' : inVar[inVar.length - 1];

      if(inVar.indexOf('INVAR2') >= 0)
        quiz.addDesc('입력된 정수' + (inVar.indexOf('INVAR3') >= 0 ? '들' : '') + '에 대해, 아래 조건에 따라 값을 출력해보세요.');
      else
        quiz.addDesc('주어진 조건에 따라 값을 출력해보세요.');

      let usedOp = [];
      let rndResult = [];
      for(let i = 0; i < Math.max(opLevel, 1); i++) {
        let rndOp;
        do {
          rndOp = getRndNUM(op_Baguette.length - 1);
        } while (usedOp.indexOf(rndOp) >= 0);

        rndResult.push(getRndResult(rndResult));
        let rndCond = getRndNUM(condition_Baguette.length - 1);
        if(inVar.indexOf('INVAR3') < 0 && inVar.indexOf('INVAR2') >= 0) {
          inVar[inVar.length - 1] = getRndNUM(9, 1);
          namedVar2 = inVar[inVar.length - 1];
        }
        let newCheckVal = getRndNUM(5);
        quiz.addDesc('  ' + condition_Baguette[rndCond].descFunc(op_Baguette[rndOp].descFunc(namedVar1, namedVar2), newCheckVal), true);
        quiz.addDesc(' ' + josa('"' + rndResult[i] + '"', '을', '를') + ' 출력하세요.');
        quiz.addCode(
          'if ' +
          sprintf(
            condition_Baguette[rndCond].line, 
            sprintf(
              op_Baguette[rndOp].line,
              inVar.indexOf('INVAR2') >= 0 ? 'INVAR2' : namedVar1,
              inVar.indexOf('INVAR3') >= 0 ? 'INVAR3' : namedVar2
            ),
            newCheckVal
          ) +
          'print("' + rndResult[i] + '")'
        );

        usedOp.push(rndOp);
      }
    } else {
      if(ioLevel) {
        inVar.push('INVAR2');
        if(getRndNUM(1)) {
          inVar.push('INVAR3');
          quiz.addDesc('정수를 두 개 입력 받으세요.');
        } else {
          inVar.push(getRndNUM(9, 1));
          quiz.addDesc('정수를 한 개 입력 받으세요.');
        }
      } else {
        inVar.push(getRndNUM(9, 1));
        inVar.push(getRndNUM(9, 1));
      }

      let namedVar1 = inVar.indexOf('INVAR3') >= 0 ? '첫번째 수' : (inVar.indexOf('INVAR2') >= 0 ? '그 수' : inVar[inVar.length - 2]);
      let namedVar2 = inVar.indexOf('INVAR3') >= 0 ? '두번째 수' : inVar[inVar.length - 1];

      if(inVar.indexOf('INVAR2') >= 0)
        quiz.addDesc('입력된 정수' + (inVar.indexOf('INVAR3') >= 0 ? '들' : '') + '에 대해, ', true);
      //else
      //  quiz.addDesc(josa(namedVar1, '과', '와') + ' ' + josa(namedVar2, '을', '를') + ' 이용하여 ', true);

      let opCompressLevel = Math.round(opLevel / 2);
      if(!opCompressLevel)
        opCompressLevel = 1;

      if(opCompressLevel == 1) {
        let rndOp1 = getRndNUM(op_Baguette.length - 1);
        quiz.addDesc(op_Baguette[rndOp1].descFunc(namedVar1, namedVar2) + '을 출력해보세요.');
        quiz.addCode('print(' + sprintf(op_Baguette[rndOp1].line, inVar[inVar.length - 2], inVar[inVar.length - 1]) + ')');
      } else if(opCompressLevel == 2) {
        let rndOp1 = getRndNUM(op_Baguette.length - 1);
        let rndOp2 = getRndNUM(op_Baguette.length - 1);
        let rndNewVal = getRndNUM(2, 1) * 5;
        quiz.addDesc(op_Baguette[rndOp2].descFunc(op_Baguette[rndOp1].descFunc(namedVar1, namedVar2), rndNewVal) + '을 출력해보세요.');
        quiz.addCode('print(' + sprintf(op_Baguette[rndOp2].line, sprintf(op_Baguette[rndOp1].line, inVar[inVar.length - 2], inVar[inVar.length - 1]), rndNewVal) + ')');
      } else {
        let rndOp1 = getRndNUM(op_Baguette.length - 1);
        let rndOp2 = getRndNUM(op_Baguette.length - 1);
        let rndOp3 = getRndNUM(op_Baguette.length - 1);
        quiz.addDesc(op_Baguette[rndOp3].descFunc2(op_Baguette[rndOp1].descFunc(namedVar1, namedVar2), op_Baguette[rndOp2].descFunc(namedVar1, namedVar2)) + ' 출력해보세요.');
        quiz.addCode('print(' + sprintf(op_Baguette[rndOp3].line, sprintf(op_Baguette[rndOp1].line, inVar[inVar.length - 2], inVar[inVar.length - 1]), sprintf(op_Baguette[rndOp2].line, inVar[inVar.length - 2], inVar[inVar.length - 1])) + ')');
      }
    }
  }

  for(let i = inVar.length; i >= 0; i--)
    if(typeof inVar[i] === 'string' || inVar[i] instanceof String)
      quiz.code = inVar[i] + " = input()\n" + quiz.code;

  return quiz;
}

//문자열 포맷 처리
let sprintf = function(format) {
  let args = Array.prototype.slice.call(arguments, 1);
  return format.replace(/{(\d+)}/g, function(match, number) { 
    return typeof args[number] != 'undefined' ? args[number] : match;
  });
};

//조사를 붙여요
function josa(inputString, josa1, josa2) {
  if(inputString === '')
    return '';

  let tailString = '';
  if(!(typeof inputString === 'number' && inputString % 1 === 0)) {
    if(inputString[inputString.length - 1] === '"') {
      tailString = '"';
      inputString = inputString.substring(0, inputString.length - 1);
    }
  }

  var code = 0;
  if(typeof inputString === 'number' && inputString % 1 === 0) {
    if(josa1 === '으')
      code = ((['영', '으', '이', '삼', '사', '오', '육', '으', '으', '구', '십'])[inputString % 10]).charCodeAt(0) - 44032;
    else
      code = ((['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구', '십'])[inputString % 10]).charCodeAt(0) - 44032;
  } else if(inputString[inputString.length - 1].toLowerCase() >= 'a' && inputString[inputString.length - 1].toLowerCase() <= 'z') {
    let snip = inputString[inputString.length - 1].toLowerCase();
    if(snip === 'l' || snip === 'm' || snip === 'n' || snip === 'r')
      code = 28;
  } else {
    code = inputString.charCodeAt(inputString.length - 1) - 44032;
  }

  inputString += tailString;
  if (code >= 0 && code <= 11171)
      inputString += code % 28 ? josa1 : josa2;

  return inputString;
}

let op_Baguette = [
  {
    line: 'math.pow({0}, {1})',
    desc: '{0} {1}만큼 거듭제곱한 값',
    desc2: '{0} {1}만큼 거듭제곱해서',
    descFunc: function(inArg1, inArg2) {
      return sprintf(this.desc, josa(inArg1, '을', '를'), inArg2);
    },
    descFunc2: function(inArg1, inArg2) {
      return sprintf(this.desc2, josa(inArg1, '을', '를'), inArg2);
    }
  },
  {
    line: '({0} + {1})',
    desc: '{0}에 {1} 더한 값',
    desc2: '{0}에 {1} 더해서',
    descFunc: function(inArg1, inArg2) {
      return sprintf(this.desc, inArg1, josa(inArg2, '을', '를'));
    },
    descFunc2: function(inArg1, inArg2) {
      return sprintf(this.desc2, inArg1, josa(inArg2, '을', '를'));
    },
  },
  {
    line: '({0} - {1})',
    desc: '{0}에서 {1} 뺀 값',
    desc2: '{0}에서 {1} 빼서',
    descFunc: function(inArg1, inArg2) {
      return sprintf(this.desc, inArg1, josa(inArg2, '을', '를'));
    },
    descFunc2: function(inArg1, inArg2) {
      return sprintf(this.desc2, inArg1, josa(inArg2, '을', '를'));
    }
  },
  {
    line: '({0} * {1})',
    desc: '{0}에 {1} 곱한 값',
    desc2: '{0}에 {1} 곱해서',
    descFunc: function(inArg1, inArg2) {
      return sprintf(this.desc, inArg1, josa(inArg2, '을', '를'));
    },
    descFunc2: function(inArg1, inArg2) {
      return sprintf(this.desc2, inArg1, josa(inArg2, '을', '를'));
    }
  },
  {
    line: '({0} / {1})',
    desc: '{0} {1}로 나눈 값',
    desc2: '{0} {1}로 나눠서',
    descFunc: function(inArg1, inArg2) {
      return sprintf(this.desc, josa(inArg1, '을', '를'), josa(inArg2, '으', ''));
    },
    descFunc2: function(inArg1, inArg2) {
      return sprintf(this.desc2, josa(inArg1, '을', '를'), josa(inArg2, '으', ''));
    }
  },
  {
    line: 'math.floor({0} / {1})',
    desc: '{0} {1}로 나눈 몫',
    desc2: '{0} {1}로 나눠서 몫만',
    descFunc: function(inArg1, inArg2) {
      return sprintf(this.desc, josa(inArg1, '을', '를'), josa(inArg2, '으', ''));
    },
    descFunc2: function(inArg1, inArg2) {
      return sprintf(this.desc2, josa(inArg1, '을', '를'), josa(inArg2, '으', ''));
    }
  },
  {
    line: '{0} % {1}',
    desc: '{0} {1}로 나눈 나머지 값',
    desc2: '{0} {1}로 나눠서 나머지만',
    descFunc: function(inArg1, inArg2) {
      return sprintf(this.desc, josa(inArg1, '을', '를'), josa(inArg2, '으', ''));
    },
    descFunc2: function(inArg1, inArg2) {
      return sprintf(this.desc2, josa(inArg1, '을', '를'), josa(inArg2, '으', ''));
    }
  }
];

let condition_Baguette = [
  {
    line: '{0} < {1}:',
    desc: '{0} {1}보다 작다면',
    descFunc: function(inArg1, inArg2) {
      return sprintf(this.desc, josa(inArg1, '이', '가'), inArg2);
    }
  },
  {
    line: '{0} > {1}:',
    desc: '{0} {1}보다 크다면',
    descFunc: function(inArg1, inArg2) {
      return sprintf(this.desc, josa(inArg1, '이', '가'), inArg2);
    }
  },
  {
    line: '{0} == {1}:',
    desc: '{0} {1}면',
    descFunc: function(inArg1, inArg2) {
      return sprintf(this.desc, josa(inArg1, '이', '가'), josa(inArg2, '이', '라'));
    }
  },
  {
    line: '{0} != {1}:',
    desc: '{0} {1} 아니라면',
    descFunc: function(inArg1, inArg2) {
      return sprintf(this.desc, josa(inArg1, '이', '가'), josa(inArg2, '이', '가'));
    }
  }
];