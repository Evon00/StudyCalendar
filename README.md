# StudyCalendar
<p align = center>
<image src = "https://github.com/Evon00/StudyCalendar/assets/123055298/b9cb05e2-c669-4745-b9fc-1617deab54fa">
</p>

**StudyCalendar**는 자신만의 공부 계획을 작성하고, 이를 남들과 공유하며 학업에 성취감을 부여하고자 만들어진 웹사이트입니다.

## Getting Started / 어떻게 시작하나요?

1. main 브랜치에서 프로젝트를 받아오세요.
     ```
     git clone -b master --single-branch https://github.com/SWE-CTF/front.git
     ```
2. 코드가 있는 폴더로 이동을 합니다.
   ```
   cd studycalendar
   ```
4. node_modules를 다운 받습니다.
   ```
   npm install
   ```
5. 설치가 완료되면 현재 위치에서 다음 코드를 실행하여 시작합니다.
   ```
   nodemon server.js
   ```
6. 서버가 켜지고 다음 주소로 접속하면 됩니다.
   ```
   https://localhost:8080
   ```

## Prerequisites / 선행 조건

아래 사항들이 설치가 되어있어야합니다.

```
Node 18.13.0 이상, mongoDB, Visual Studio Code
```

### Caution / 주의 사항
+ 해당 프로젝트를 받아서 열었을 때, 메인 페이지에서 Calendar가 나타나지 않을 경우 Calendar의 ajax의 URL을 수정해주세요.
+ mongoDB를 회원가입하시고 관련 DB정보를 server.js에서 작성해주어야 합니다.


## Function / 기능
+ 로그인
+ 로그아웃
+ 회원가입
+ 마이 페이지
+ 공부 내용 기록
+ 다른 사용자 공부 내용 확인
+ 다른 사용자 프로필 확인
+ 달력 (Calendar) 일정 등록 [관리자 전용]

## Front-End Technology / 프론트 기술
+ NodeJS axios 통신
+ ejs 웹페이지 구성
+ full Calendar api 이용 캘린더 구성

## Back-End Technology / 백엔드 기술
+ mongoDB
+ passport 라이브러리를 이용한 세션 인증

## Dependencies / 관련 라이브러리 버전
+ body-parser : 1.20.1
+ bootstrap-icons : 1.10.3
+ connect-flash : 0.1.1
+ ejs : 3.1.8
+ express : 4.18.2
+ express-session : 1.17.3
+ method-override : 3.0.0
+ moment : 2.29.4
+ mongodb : 3.6.4
+ multer : 1.4.5-lts.1
+ nodemon : 2.0.20
+ passport : 0.6.0
+ passport-local : 1.0.0

## Reference / 참고사항
코딩애플 [https://codingapple.com/course/node-express-mongodb-server/]

full Calendar [https://fullcalendar.io/]
