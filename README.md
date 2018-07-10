# BBAM_Blocks
### BBAM 블록 구현
## 소개
scratch-blocks를 기반으로 하여 BBAM에 들어가는 블록 코딩을 개발  합니다.

## API
scratch-blocks에서는 구글에 만든 Blockly를 기반으로 하였으니, api 레퍼런스는 Blockly의 것을 참고하라고 합니다.

지금까지 소스코드를 비교해본 결과 Blockly에서 많이 달라졌으나 비슷한 부분이 많으니 [Blockly 레퍼런스](https://developers.google.com/blockly/reference/overview)를 참고해주세요.

## 설치 방법
#### 1. BBAM_blocks 다운

BBAM_Blocks 리포를 git으로 가져오시거나 직접 다운받아주세요.

#### 2. Closure Libary 다운
다음은 [Closure Libary](https://github.com/google/closure-library/)로 들어가셔서 zip으로 다운받습니다.

압축을 푼뒤 폴더 이름을 ```closure-library```으로 바꾸셔서 BBAM_Blocks-master 폴더 옆에 둬주세요.  

#### 3. Python2 설치

이 모듈은 ```python2 build.py```와 같은 명령어로 파이썬2를 실행합니다.

Python2를 설치하신 뒤 환경변수 설정을 통하여 python2로 실행하게 하시면 됩니다.

http://http2.tistory.com/19 해당 링크를 참고하여 환경변수를 설정하세요.

아니면 직접 package.json에서 prepublish를 고쳐주세요.

#### 4. npm install

BBAM_Blocks-master/build.py를 열어주세요.

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
그리고 또다시 설치를 합니다.
```
npm install
```
어쩌다 발견한 거지만 이렇게 하면 오류가 뜨지 않고 완벽하게 설치가 되는 것을 확인했습니다.

그러면 이제 BBAM_Blocks-master/tests/vertical_playground.html를 열어 잘 작동되는지 확인해주세요.

## 관련 링크

[Blockly 레퍼런스](https://developers.google.com/blockly/reference/overview)

[Blockly github](https://github.com/google/blockly)

[scratch-blocks github](https://github.com/LLK/scratch-blocks)
