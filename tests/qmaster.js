let MAX_LEVEL = 10;
let qTypes = ['입출력', '산술연산', '조건문', '반복문'];

function getRndNUM(max, min = 0) {
	return Math.floor(Math.random() * (max - min)) + min;
}

function getRndName(usedName) {
	return getRndStr(['철수', '영희', '민수', '호민이', '성범이', '영하'], usedName);
}

function getRndResult(usedResult) {
	return getRndStr(['Apple', 'Kiwi', 'Grape', 'Melon', 'Berry', 'Banana', 'Monkey', 'Dog', 'Sky', 'Box', 'Can', 'Summer', 'Winter'], usedResult);
}

function getRndStr(rndStr, usedStr) {
	let RND_STR = rndStr;
	if(usedStr) {
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

function makeQuiz(levels) {
	let quiz = {
		code: '', desc: '', pre: '', hint: '', test: '',
		addCode: function(nCode){ this.code += this.pre + nCode + "\n"},
		addDesc: function(nDesc, noNewLine = false){ this.desc += this.pre + nDesc + (noNewLine ? '' : "\n")},
		addPre: function(mult = 1){for(let i = 0; i < mult; i++) this.pre += '  ';},
		subPre: function(mult = 1){this.pre = this.pre.substring(2 * mult);}
	};
	
	let ioLevel = levels[0];
	let opLevel = levels[1];
	let ifLevel = levels[2];
	let frLevel = levels[3];
	
	let inVar = [];
	if(frLevel === 2) {
		let tName = getRndName();
		switch (getRndNUM(2)) {
			case 0:
			quiz.addDesc(tName + '는 구구단을 공부하고 있습니다.');
			quiz.addDesc(tName + '가 잘 공부할 수 있도록 구구단을 출력하는 프로그램을 만들어보세요.');
			
			quiz.addCode('for x in range(1, 10):');
			quiz.addPre();
			quiz.addCode('for y in range(1, 10):');
			quiz.addPre();
			quiz.addCode('print(str(x) + " * " + str(y) + " = " + str(x * y))');
			quiz.subPre(2);
			
			if(ioLevel) {
				inVar.push('INVAR1');
				quiz.test += 'i';
				quiz.addDesc('구구단을 모두 출력한 다음에는, 정수를 하나 입력받아 그 단을 출력해보세요.');
				
				quiz.addCode('for y in range(1, 10):');
				quiz.addPre();
				quiz.addCode('print(str(INVAR1) + " * " + str(y) + " = " + str(INVAR1 * y))');
			}
			
			quiz.hint = '구구단을 출력하려면 반복문 두 개를 겹쳐서 사용해야합니다.';
			break;
			
			case 1:
			quiz.addDesc(tName + '는 오랜 수련 끝에 369 게임을 마스터했습니다.');
			quiz.addDesc('주어진 조건에 따라 코딩해서 ' + tName + '에게 더 어려운 게임을 만들어주세요.');
			quiz.addPre();
			
			if(ifLevel) {
				quiz.addDesc('조건 1. ', true);
				if(ioLevel) {
					quiz.addDesc('정수를 하나 입력받고, 1부터 그 수까지 한 줄에 하나씩 출력하세요.');
					inVar.push('INVAR1');
					quiz.test += 'i';
					quiz.subPre();
					quiz.addCode('for x in range(1, INVAR1 + 1):');
				} else {
					quiz.addDesc('1부터 100까지 수를 한 줄에 하나씩 출력하세요.');
					quiz.subPre();
					quiz.addCode('for x in range(1, 101):');
				}
				quiz.addPre();
				
				let num1 = getRndNUM(9, 2);
				let num2 = getRndNUM(9, 2);
				quiz.addDesc('조건 2. 만약 출력할 수가 ' + num1 + '의 배수라면 그 줄에는 1부터 그 숫자 사이에 있는 ' + num2 + '의 배수들을 출력하세요.');
				quiz.addDesc('예를 들어 ' + ((num2 * 5) + (num1 - (num2 * 5) % num1)) + '는 ' + num1 + '의 배수이므로, 그 줄에는 ', true);
				for(let i = num2; i <= (num2 * 5) + (num1 - (num2 * 5) % num1); i += num2) {
					if(i != num2) {
            quiz.addDesc(' ', true);
          }
					quiz.addDesc(i, true);
				}
				quiz.addDesc('를 출력해야합니다.');
				quiz.addCode('if x % ' + num1 + ' == 0:');
				quiz.addPre();
				quiz.addCode('for y in range(1, x + 1):');
				quiz.addPre();
				quiz.addCode('if y % ' + num2 + ' == 0:');
				quiz.addPre();
				quiz.addCode('if y / ' + num2 + ' > 1: print(" ", end="")');
				quiz.addCode('print(y, end="")');
				quiz.subPre(2);
				quiz.addCode('print("")');
				quiz.subPre();
        quiz.addCode('else:');
				quiz.addPre();
        quiz.addCode('print(x)');
			} else {
				quiz.addDesc('조건: ', true);
				if(ioLevel) {
					inVar.push('INVAR1');
					quiz.test += 'i';
					quiz.addDesc('정수를 하나 입력받고, 1부터 그 수까지 순서대로 출력합니다.');
					quiz.subPre();
					quiz.addCode('for x in range(1, INVAR1 + 1):');
				} else {
					quiz.addDesc('1부터 10까지 순서대로 출력합니다.');
					quiz.subPre();
					quiz.addCode('for x in range(1, 11):');
				}
				quiz.addPre();
				quiz.addDesc('단, 각 줄에는 숫자 하나만 출력하는 것이 아니라, 그 수부터 1까지 거꾸로 한 줄에 출력해야 합니다.');
				quiz.addDesc('예를 들어 두번째 줄이라면 2 1을, 다섯번째 줄이라면 5 4 3 2 1을 출력해야 합니다.');
				quiz.addCode('for y in range(x + 1, 0, -1): print(y)');
			}
			
			quiz.hint = '조건문 안에서 반복문을 이용하여 출력하는 문제입니다. 주어진 조건은 여러 블록으로 표현할 필요가 있습니다. 부분부분 나누어 생각해보세요.';
			break;
			
			case 2:
			quiz.addDesc(tName + '는 독특하게 생긴 주사위를 몇 개 가지고 있습니다.');
			for(let i = 0; i < (opLevel == 2 ? 3 : 2); i++) {
				inVar.push(getRndNUM(12, 4));
				if(i > 0) {
          quiz.addDesc(', ', true);
        }
				quiz.addDesc((['첫번째', '두번째', '세번째'])[i] + ' 주사위는 1부터' + inVar[inVar.length - 1] + '까지', true);
			}
			quiz.addDesc('의 숫자가 나올 수 있습니다.');
			
			let bbb = [];
			bbb.push('df');
			for(let i = 0; i < ifLevel; i++) {
        bbb.push('if');
      }
			
			quiz.addCode('for x in range(1, ' + inVar[0] + ' + 1):');
			quiz.addCode('  for y in range(1, ' + inVar[1] + ' + 1):');
			if(inVar.length > 2) {
        quiz.addCode('    for z in range(1, ' + inVar[2] + ' + 1):');
      }
			
			quiz.addDesc('이 주사위들을 던졌을 때 총 경우의 수는 ' + inVar[0] + " * " + inVar[1] + (inVar.length > 2 ? " * " + inVar[2] : '') + " = " + (inVar[0] * inVar[1] * (inVar.length > 2 ? inVar[2] : 1)) + '가지입니다.');
			switch (bbb[getRndNUM(bbb.length - 1)]) {
				case 'if':
				quiz.addDesc('이 중 다음 조건을 만족하는 경우만 출력해보세요.');
				quiz.addDesc('  조건 1. 첫번째 주사위의 숫자가 두번째 주사위의 숫자보다 ', true);
				let cond = '';
				if(getRndNUM(1)) {
					quiz.addDesc('큽니다.');
					cond += 'x > y';
				} else {
					quiz.addDesc('작습니다.');
					cond += 'x < y';
				}
				cond += ' and ';
				if(inVar.length > 2) {
					quiz.addDesc('  조건 2. 두번째 주사위의 숫자가 세번째 주사위의 숫자보다 ', true); 
					if(getRndNUM(1)) {
						quiz.addDesc('큽니다.');
						cond += 'y > z';
					} else {
						quiz.addDesc('작습니다.');
						cond += 'y < z';
					}
				} else {
					quiz.addDesc('  조건 2. 두번째 주사위의 숫자가 ', true); 
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
				quiz.addCode('print(str(x) + " " + str(y)' + (inVar.length > 2 ? '+ " " + str(z)' : '') + ')');
				break;
				
				default:
				quiz.addDesc('주사위의 순서에 주의하여 모든 경우를 출력해보세요.');
				quiz.addPre(inVar.length);
				quiz.addCode('print(str(x) + " " + str(y)' + (inVar.length > 2 ? '+ " " + str(z)' : '') + ')');
				break;
			}
			
			quiz.hint = '주사위 수 만큼 반복문을 겹쳐 사용해야합니다.';
			break;
		}
	} else {
		if(frLevel) {
			if(ioLevel) {
				inVar.push('INVAR1');
				quiz.test += 'l';
				quiz.addDesc('먼저 정수를 하나 입력 받으세요.');
				quiz.addCode('INVAR1 = input()');
				quiz.addCode('for x in range(INVAR1):');
				quiz.addDesc('입력된 수만큼 다음 과정을 반복하세요:');
			} else {
				inVar.push(getRndNUM(10, 1) * 10);
				quiz.test += inVar[inVar.length - 1];
				quiz.addCode('for x in range('+inVar[inVar.length - 1]+'):');
				quiz.addDesc('다음 과정을 ' + inVar[inVar.length - 1] + '번 반복하세요:');
			}
			quiz.addPre();
		}
		
		if(ifLevel == 2) {
			if(opLevel) {
				inVar.push('INVAR2');
				quiz.addCode('INVAR2 = input()');
				quiz.test += 'i';
				if(getRndNUM(1)) {
					inVar.push('INVAR3');
					quiz.addCode('INVAR3 = input()');
					quiz.test += 'i';
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
					quiz.addDesc((i > 0 ? '  위의 조건에는 해당하지 않고, ' : '  ') + condition_Baguette[rndCond].descFunc(op_Baguette[rndOp].descFunc(namedVar1, namedVar2), getRndNUM(5)) + josa('"' + rndResult[i] + '"', '을', '를') + ' 출력하세요.');
					quiz.addCode((i > 0 ? 'el' : '') + 'if ' + sprintf(condition_Baguette[rndCond].line, 'INVAR2', inVar.indexOf('INVAR3') >= 0 ? 'INVAR3' : inVar[inVar.length - 1]) + 'print("' + rndResult[i] + '")');
          
          usedOp.push(rndOp);
          inVar[inVar.length - 1] = getRndNUM(9, 1);
          namedVar2 = inVar.indexOf('INVAR3') >= 0 ? '두번째 수' : inVar[inVar.length - 1];
				}
        quiz.addDesc('해당하는 경우가 하나도 없다면 "Fail"을 출력하세요.');
        quiz.addCode('else: print("Fail")');
				
				quiz.hint = '서로 독립적인 조건을 검사할 때에는 조건문도 분리하여 사용해야합니다. 반대로 연관된 조건을 검사할 때에는 조건문을 중첩해야 할 필요도 있습니다.';
			} else {
				inVar.push('INVAR2');
				quiz.test += 'i';
				quiz.addCode('INVAR2 = input()');
				quiz.addDesc('정수를 하나 입력 받으세요.');
				quiz.addDesc('입력된 정수에 대해, 아래 조건에 따라 값을 출력해보세요.');
				
				let rng = getRndNUM(5, 2) * 5;
				let rndResult = [];
				for(let i = 0; i < getRndNUM(5, 3); i++) {
					rndResult.push(getRndResult(rndResult));
					quiz.addDesc('  값이 ' + (i * rng) + '에서 ' + ((i + 1) * rng - 1) + '까지의 수 중 하나라면 ' + rndResult[i] + '을 출력합니다.');
					quiz.addCode((i > 0 ? 'el' : '') + 'if INVAR2 >= ' + (i * rng) + ' and INVAR2 <= ' + ((i + 1) * rng - 1) + ': print("' + rndResult[i] + '")');
				}
				quiz.addDesc('만약 해당하는 경우가 없다면 "Out of Range"를 출력합니다.');
				quiz.addCode('else: print("Out of Range")');
				
				quiz.hint = '주어진 조건들은 모두 연관되어 있습니다. 조건문을 여러 개 중첩해서 문제를 해결해보세요.';
			}
		} else if(ifLevel) {
			if(ioLevel) {
				inVar.push('INVAR2');
				quiz.test += 'i';
				quiz.addCode('INVAR2 = input()');
				if(getRndNUM(1)) {
					inVar.push('INVAR3');
					quiz.test += 'i';
					quiz.addCode('INVAR3 = input()');
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
			
			if(inVar.indexOf('INVAR2') >= 0) {
        quiz.addDesc('입력된 정수' + (inVar.indexOf('INVAR3') >= 0 ? '들' : '') + '에 대해, 아래 조건에 따라 값을 출력해보세요.');
      } else {
        quiz.addDesc('주어진 조건에 따라 값을 출력해보세요.');
      }
			
			let usedOp = [];
			let rndResult = [];
			for(let i = 0; i < Math.max(opLevel, 1); i++) {
				let rndOp;
				do {
					rndOp = getRndNUM(op_Baguette.length - 1);
				} while (usedOp.indexOf(rndOp) >= 0);
				usedOp.push(rndOp);
				
				rndResult.push(getRndResult(rndResult));
				let rndCond = getRndNUM(condition_Baguette.length - 1);
				if(inVar.indexOf('INVAR3') < 0 && inVar.indexOf('INVAR2') >= 0) {
					inVar[inVar.length - 1] = getRndNUM(9, 1);
					namedVar2 = inVar[inVar.length - 1];
				}
				let newCheckVal = getRndNUM(5);
				quiz.addDesc((i > 0 ? '  위의 조건에는 해당하지 않고, ' : '  ') + condition_Baguette[rndCond].descFunc(op_Baguette[rndOp].descFunc(namedVar1, namedVar2), newCheckVal), true);
				quiz.addDesc(' ' + josa('"' + rndResult[i] + '"', '을', '를') + ' 출력하세요.');
				quiz.addCode((i > 0 ? 'el' : '') + 'if ' + sprintf(condition_Baguette[rndCond].line, sprintf(op_Baguette[rndOp].line, inVar.indexOf('INVAR2') >= 0 ? 'INVAR2' : namedVar1, inVar.indexOf('INVAR3') >= 0 ? 'INVAR3' : namedVar2), newCheckVal) + 'print("' + rndResult[i] + '")');
      }
      
      quiz.hint = '조건문 안에 들어갈 조건을 정확히 입력하는 것이 중요합니다. 긴 수식은 여러 개의 작은 수식으로 이루어져 있습니다. 분리하여 생각하면 더 쉽게 이해할 수 있습니다.';
    } else {
      if(opLevel == 0) {
        if(ioLevel) {
          inVar.push('INVAR2');
          quiz.test += 'i';
          quiz.addCode('INVAR2 = input()');
          if(getRndNUM(1)) {
            quiz.addDesc('문자열을 하나 입력 받으세요.');
          } else {
            quiz.addDesc('정수를 한 개 입력 받으세요.');
          }
          
          quiz.addDesc('입력받은 값을 그대로 출력해보세요.');
        } else {
          if(getRndNUM(1)) {
            inVar.push(getRndResult());
          } else {
            inVar.push(getRndNUM(1000));
          }
          
          if(!getRndNUM(7)) {
            quiz.addDesc(inVar[inVar.length - 1] + '을 작은 따옴표로 감싸서 출력해보세요.');
            quiz.addCode('print("\'' + inVar[inVar.length - 1] + '\'")');
          } else if(!getRndNUM(7)) {
            quiz.addDesc(inVar[inVar.length - 1] + '을 큰 따옴표로 감싸서 출력해보세요.');
            quiz.addCode('print(\'\"' + inVar[inVar.length - 1] + '\"\')');
          } else {
            quiz.addDesc(inVar[inVar.length - 1] + '을 출력해보세요.');
            quiz.addCode('print(' + inVar[inVar.length - 1] + ')');
          }
        }
        
        quiz.hint = '입력 블록과 출력 블록을 이용하는 간단한 문제입니다.';
      } else {
        if(ioLevel) {
          inVar.push('INVAR2');
          quiz.test += 'i';
          quiz.addCode('INVAR2 = input()');
          if(getRndNUM(1)) {
            inVar.push('INVAR3');
            quiz.test += 'i';
            quiz.addCode('INVAR3 = input()');
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
        
        if(inVar.indexOf('INVAR2') >= 0) {
          quiz.addDesc('입력된 정수' + (inVar.indexOf('INVAR3') >= 0 ? '들' : '') + '에 대해, ', true);
        }
        
        if(opLevel == 1) {
          let rndOp1 = getRndNUM(op_Baguette.length - 1);
          quiz.addDesc(op_Baguette[rndOp1].descFunc(namedVar1, namedVar2) + '을 출력해보세요.');
          quiz.addCode('print(' + sprintf(op_Baguette[rndOp1].line, inVar[inVar.length - 2], inVar[inVar.length - 1]) + ')');
        } else if(opLevel == 2) {
          let rndOp1 = getRndNUM(op_Baguette.length - 1);
          let rndOp2 = getRndNUM(op_Baguette.length - 1);
          let rndNewVal = getRndNUM(2, 1) * 5;
          quiz.addDesc(op_Baguette[rndOp2].descFunc(op_Baguette[rndOp1].descFunc(namedVar1, namedVar2), rndNewVal) + '을 출력해보세요.');
          quiz.addCode('print(' + sprintf(op_Baguette[rndOp2].line, sprintf(op_Baguette[rndOp1].line, inVar[inVar.length - 2], inVar[inVar.length - 1]), rndNewVal) + ')');
        } else if(opLevel == 3) {
          let rndOp1 = getRndNUM(op_Baguette.length - 1);
          let rndOp2 = getRndNUM(op_Baguette.length - 1);
          let rndOp3 = getRndNUM(op_Baguette.length - 1);
          quiz.addDesc(op_Baguette[rndOp3].descFunc2(op_Baguette[rndOp1].descFunc(namedVar1, namedVar2), op_Baguette[rndOp2].descFunc(namedVar1, namedVar2)) + ' 출력해보세요.');
          quiz.addCode('print(' + sprintf(op_Baguette[rndOp3].line, sprintf(op_Baguette[rndOp1].line, inVar[inVar.length - 2], inVar[inVar.length - 1]), sprintf(op_Baguette[rndOp2].line, inVar[inVar.length - 2], inVar[inVar.length - 1])) + ')');
        }
        
        quiz.hint = '적절한 연산자를 사용하세요. 사칙연산 외에도 다양한 수학 블록이 있습니다.';
      }
    }
  }
  
  for(let i = inVar.length; i >= 0; i--) {
    if(typeof inVar[i] === 'string' || inVar[i] instanceof String) {
      quiz.code = inVar[i] + " = input()\n" + quiz.code;
    }
    
    if(frLevel < 2) {
      break;
    }
  }
  
  quiz.code = 'import math\n' + quiz.code;
  
  return quiz;
}

let sprintf = function(format) {
  let args = Array.prototype.slice.call(arguments, 1);
  return format.replace(/{(\d+)}/g, function(match, number) { 
    return typeof args[number] != 'undefined' ? args[number] : match;
  });
};

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
    if(josa1 === '으') {
      code = ((['영', '으', '이', '삼', '사', '오', '육', '으', '으', '구', '십'])[inputString % 10]).charCodeAt(0) - 44032;
    } else {
      code = ((['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구', '십'])[inputString % 10]).charCodeAt(0) - 44032;
    }
  } else if(inputString[inputString.length - 1].toLowerCase() >= 'a' && inputString[inputString.length - 1].toLowerCase() <= 'z') {
    let snip = inputString[inputString.length - 1].toLowerCase();
    if(snip === 'l' || snip === 'm' || snip === 'n' || snip === 'r') {
      code = 28;
    }
  } else {
    code = inputString.charCodeAt(inputString.length - 1) - 44032;
  }
  
  inputString += tailString;
  if (code >= 0 && code <= 11171) {
    inputString += code % 28 ? josa1 : josa2;
  }
  
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

function papaCascade(paCode, paInput) {
  let ret = paCode;
  let paInputArr = paInput.split(/\s/gm);
  for(let i = 0; i < paInputArr.length; i++) {
    if(!isNaN(parseFloat(paInputArr[i])) && isFinite(paInputArr[i])) {
      ret = ret.replace(/input\(\)/, paInputArr[i]);
    } else {
      ret = ret.replace(/input\(\)/, '"' + paInputArr[i] + '"');
    }
  }
  return ret;
}

function papaArray(paCode, paLoop, paArray) {
  let ret = paCode;
  ret = ret.replace(/input\(\)/, paLoop);
  ret = ret.replace(/input\(\)/, '([' + paArray.join(', ') + '])[x]');
  return ret;
}

function callBrython(cbCode, cbInput, cbArray) {
  try {
    let papaCode;
    if(cbArray) {
      papaCode = papaArray(cbCode, cbInput, cbArray);
    } else {
      papaCode = papaCascade(cbCode, cbInput);
    }
    let brythonJS = __BRYTHON__.py2js(papaCode, '__main__', '__main__').to_js();
    eval(brythonJS);
  } catch (error) {
    return false;
  }
  return true;
}

function letsGoQMaster() {
  brython();
  
  console.log('console log is hooked.');

  let passConsole = '';
  console.bndlog = console.log.bind(console);
  console.log = function (e) {
    passConsole += e;
    console.bndlog.apply(console, arguments);
  }
  
  let quizCounter = {IO:0, FOR:0, IF:0, CAL:0};
  let quizList = [];
  let quizSQL = '';
  for(let ioLevel = 0; ioLevel < 2; ioLevel++) {
    for(let opLevel = 0; opLevel < 4; opLevel++) {
      for(let ifLevel = 0; ifLevel < 3; ifLevel++) {
        for(let frLevel = 0; frLevel < 3; frLevel++) {
          let levels = [];
          levels.push(ioLevel);
          levels.push(opLevel);
          levels.push(ifLevel);
          levels.push(frLevel);
          
          for(let idx = 0; idx < 1000; idx++) {
            let quiz = makeQuiz(levels);
            
            let flag = false;
            for(let chk = 0; chk < quizList.length; chk++) {
              if(quizList[chk].code === quiz.code) {
                flag = true;
                break;
              }
            }
            
            if(flag) {
              break;
            }
            
            quizList.push(quiz);
            
            let diff = Math.min(3, Math.max(ioLevel, opLevel, ifLevel, frLevel) + 1);
            
            let cls = 'IO';
            if(frLevel) {
              cls = 'FOR';
            } else if(ifLevel) {
              cls = 'IF';
            } else if(opLevel) {
              cls = 'CAL';
            }
            
            quizCounter[cls]++;
            let quizSQLTemp = 'Insert Into PRB (PRB_ID, PRB_NM, PRB_DIFF, PRB_CLS, PRB_CNT, PRB_HNT, PRB_RTN, PRB_CD) Values ('
            + quizList.length + ','
            + '"' + ('[' + (['초급', '중급', '고급'])[diff - 1] + '-' + cls + ']' + ({IO:'입출력', FOR:'반복문', IF:'조건문', CAL:'연산자'})[cls]) + quizCounter[cls] + '"' + ','
            + diff + ','
            + '"' + cls + '"' + ','
            + '"' + quiz.desc.trim().replace(/\\([\s\S])|(")/g,"\\$1$2") + '"' + ','
            + '"' + quiz.hint.replace(/\\([\s\S])|(")/g,"\\$1$2") + '"' + ','
            + (diff * 100) + ','
            + '"' + quiz.code.trimEnd().replace(/\\([\s\S])|(")/g,"\\$1$2") + '"'
            + ');\n';
            
            let tcFailCounter = 0;
            let tcFlag = false;
            for(let tc = 0; tc < 3; tc++) {
              if(tcFailCounter > 3) {
                break;
              }
              
              let conCase = quiz.test;
              let testCase = '';
              let testArray = [];
              
              if((conCase[0] === 'l' && conCase.length > 1) || (conCase.length > 2 && conCase[1] === '0')) {
                let ccv = getRndNUM(10, 1);
                if(conCase[1] === '0') {
                  ccv = parseInt(conCase[0]) * 10; 
                }
                testCase += ccv + '\n';
                
                for(let cci = 0; cci < ccv; cci++) {
                  if(conCase.length > 1) {
                    let tmpNum = getRndNUM(10, 1);
                    testCase += tmpNum + '\n';
                    testArray.push(tmpNum);
                  }

                  if(conCase.length > 2) {
                    let tmpNum = getRndNUM(10, 1);
                    testCase += tmpNum + '\n';
                    testArray.push(tmpNum);
                  }
                }
              } else if(conCase[0] === 'i') {
                for(let cl = 0; cl < conCase.length; cl++) {
                  testCase += getRndNUM(10, 1) + '\n';
                }
              }
              
              passConsole = '';
              let retBrython;
              if(testArray.length) {
                retBrython = callBrython(quiz.code, testCase.split(/\s/gm)[0], testArray);
              } else {
                retBrython = callBrython(quiz.code, testCase);
              }

              if(!retBrython) {
                tcFailCounter++;
                tc--;
                continue;
              }
              
              quizSQLTemp += 'Insert Into ATP (ATP_PID, ATP_TID, ATP_IN, ATP_OUT) Values ('
              + quizList.length + ','
              + (tc + 1) + ','
              + '"' + testCase.trimEnd().replace(/\\([\s\S])|(")/g,"\\$1$2") + '"' + ','
              + '"' + passConsole.replace(/\\([\s\S])|(")/g,"\\$1$2") + '"'
              + ');\n';
              
              tcFlag = true;

              if(testCase === '') {
                break;
              }
            }
            
            if(tcFlag) {
              quizSQL += quizSQLTemp;
            }
          } 
        }
      }
    }
  }
  
  console.log('num of prob.: ' + quizList.length);
  
  let blob = new Blob([quizSQL], {type: "text/plain;charset=utf-8"});
  let anchor = document.createElement('a');
  anchor.download = 'probData.sql';
  anchor.href = window.URL.createObjectURL(blob);
  anchor.dataset.downloadurl = ['text/plain', anchor.download, anchor.href].join(':');
  anchor.click();
}