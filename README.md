# BBAM_Blocks
### BBAM 블록 구현
## 소개
scratch-blocks를 기반으로 하여 BBAM에 들어가는 블록 코딩을 개발합니다.

## API
scratch-blocks에서는 구글에 만든 Blockly를 기반으로 하였으니, api 레퍼런스는 Blockly의 것을 참고하라고 합니다.

지금까지 소스코드를 비교해본 결과 Blockly에서 많이 달라졌으나 비슷한 부분이 많으니 [Blockly 레퍼런스](https://developers.google.com/blockly/reference/overview)를 참고해주세요.

## 설치 방법
첫 번째로는 Python2를 설치하셔야 합니다. 

package.json에서는 ```python2 build.py```와 같은 명령어로 파이썬2를 실행합니다.

Python2를 설치하신 뒤 환경변수 설정으로 python2로 실행하게 하시면 됩니다.

http://http2.tistory.com/19 해당 링크를 참고하여 환경변수를 설정하세요.

그 뒤에는 리포를 git으로 가져오시거나 직접 다운하셔서 scratch-blocks-develop/build.py를 열어주세요.

51, 52번째 줄의 코드를 다음과 같이 변경해줍니다.
```
CLOSURE_DIR_NPM = "node_modules/.bin"
CLOSURE_ROOT_NPM = os.path.join("node_modules/.bin")
```
그런 뒤 설치를 해주시면 됩니다.

```
npm install
```
 그리고 다시 build.py를 열어주셔서 다시 고쳐줍니다.
```
CLOSURE_DIR_NPM = "node_modules"
CLOSURE_ROOT_NPM = os.path.join("node_modules")
```
그리고 또다시 인스톨을 합니다.
```
npm install
```
어쩌다 발견한 거지만 이렇게 하면 오류가 뜨지 않고 완벽하게 설치가 되는 것을 확인했습니다.

그러면 이제 scratch-blocks-develop/tests/vertical_playground.html를 열어 잘 작동되는지 확인해주세요.

## 관련 링크

[Blockly 레퍼런스](https://developers.google.com/blockly/reference/overview)

[Blockly github](https://github.com/google/blockly)

[scratch-blocks github](https://github.com/LLK/scratch-blocks)
