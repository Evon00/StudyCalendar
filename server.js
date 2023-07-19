const express = require('express'); //express 라이브러리
const app = express(); //express 라이브러리
const MongoClient = require('mongodb').MongoClient; //mongodb 사용
app.set('view engine', 'ejs'); //ejs 라이브러리 사용
const bodyParser = require('body-parser'); //bodyparser 라이브러리 사용 , req 쉽게 받아오는 용
app.use(bodyParser.urlencoded({ extended: true }));
const methodOverride = require('method-override'); //methodOverrider 라이브러리 사용 , PUT, DELETE 사용하기 위해서
app.use(methodOverride('_method'));
app.use(express.static(__dirname+'/public'));


// db 접속 과정
let db;

MongoClient.connect('mongodb+srv://몽고디비어드민계정:비밀번호@studycalendar.b7rrvbi.mongodb.net/?retryWrites=true&w=majority', function (err, client) {
    if (err) { return console.log(err); } //db 접속 실패시 오류 출력
    db = client.db('studycalendar'); //해당 폴더와 연결
    app.listen(8080, function () { //8080 포트로 접속
        console.log('listening to 8080');
    })
})

class UserModel{
    name = "";
    id = "";
    pw = "";
    purpose = "";

    constructor(name,id,pw,purpose){
        this.name = name;
        this.id = id;
        this.pw = pw;
        this.purpose = purpose;
    }

    getUserInfo(){
        let info = {
            name : this.name,
            id : this.id,
            pw : this.pw,
            purpose : this.purpose
        };
        return info;
    }
}

class UserAct extends UserModel{

    constructor(name,id,pw,purpose){
        super(name,id,pw,purpose);
    }

    register(){
        let status = 0;
        if(this.pw == ""){
            status = 2;
            return status;
        } else{
            let check = {name:this.name, id:this.id, pw:this.pw, purpose:this.purpose};
            db.collection('login').insertOne(check);
            status = 1;
            return status;
        }
    }

    login(done){
        let check = {name:this.name, id:this.id, pw:this.pw, purpose:this.purpose};
        db.collection('login').findOne({id:this.id},function(err,result){
            if(err) return done(err);
            if(!result) return done(null,false,{message:'존재하지 않는 아이디입니다.'});
            if(check.pw == result.pw){
                return done(null,result);
            } else{
                return done(null,false,{message:'비번이 틀렸습니다.'});
            }
        })
    }

    logout(req){
        req.logout(function(err){
            if(err) return next(err);
        })
        return 1;
    }
}

class Post extends UserModel{
    postContent={_id:null,title:null,detail:null,date:null,HC:"",JS:"",DB:"",SV:"",ETC:"",writer:null};

    constructor(name,id,pw,purpose){
        super(name,id,pw,purpose);
    }
    
    setPost(data){
        let check = {_id:parseInt(data.id),title:data.title,detail:data.detail,date:data.date,HC:"",JS:"",DB:"",SV:"",ETC:"",writer:this.id};
        if(data.check1 === "HC") check.HC = "HTML/CSS";
        if(data.check2 === "JS") check.JS = "JavaScript";
        if(data.check3 === "DB") check.DB = "DB";
        if(data.check4 === "SV") check.SV = "Server";
        if(data.check5 === "ETC") check.ETC = "ETC";
        this.postContent = check;
    }
    getPost(){
        let info = this.postContent;
        return info;
    }

    addPost(data){
        let check = {name:this.name, id:this.id, pw:this.pw, purpose:this.purpose};
        const dateRegex = /^\d{4}.\d{2}.\d{2}$/;
        let postData;
        if(dateRegex.test(data.date)){
            this.postContent = data;
            db.collection('counter').findOne({name:'postCount'},function(err,result){
                if(err) return console.log(err);
                var count = result.totalPost;
                postData = {_id: count+1, title:data.title, detail:data.detail, date:data.date, HC: "", JS: "", DB: "", SV: "", ETC: "",writer:check.id};
                postData._id = result.totalPost+1;
                if(data.check1 === "HC") postData.HC = "HTML/CSS";
                if(data.check2 === "JS") postData.JS = "JavaScript";
                if(data.check3 === "DB") postData.DB = "DB";
                if(data.check4 === "SV") postData.SV = "Server";
                if(data.check5 === "ETC") postData.ETC = "ETC";

                db.collection('post').insertOne(postData,function(err,result){
                    if(err) return console.log(err);
                    
                    db.collection('counter').updateOne({name:'postCount'},{$inc:{totalPost:1}},function(err,result){
                        if(err) return console.log(err);
                    })
                })

            })
            return 1;
        } else{
            return 0;
        }
    }

    deletePost(data){
        this.postContent._id = parseInt(data);
        let deleteData = {_id: this.postContent._id, writer:this.id};
        db.collection('post').deleteOne(deleteData,function(err,result){
            if(err) return console.log(err);
        });
        return 1;
    }

    editPost(){
        db.collection('post').updateOne({_id: parseInt(this.postContent._id)},{$set:this.getPost()},function(err,result){
            if(err) return console.log(err)
        })
        return 1;
    }
}

class ControlCalendar{
    calendar_content = "";
    calendar_start_date = "";
    calendar_end_date = "";

    constructor(data){
        this.calendar_content = data.calendar_content;
        this.calendar_start_date = data.calendar_start_date;
        this.calendar_end_date = data.calendar_end_date;
    }

    getCalendar(){
        let info = {title: this.calendar_content, start:this.calendar_start_date, end: this.calendar_end_date};
        return info;
    }

    addCalendar(){
        db.collection('schedule').insertOne(this.getCalendar(),function(err,result){
            if (err) return console.log(err);
        })
    }

    deleteCalendar(){
        db.collection('schedule').deleteOne(this.getCalendar(),function(err, result){
            if(err) console.log(err);
        })
    }
}

//로그인
//DB에 있는 데이터 일 경우 로그인 성공 , session-based 인증 방식 이용 = 쿠키(세션) 발행
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
app.use(session({ secret: 'secretcode', resave: true, saveUninitialized: false }))
app.use(passport.initialize());
app.use(passport.session());
// 위의 선언 - 라이브러리 기본 설정

//flash message - 로그인 실패시 출력할 내용
var flash = require('connect-flash');

app.use(flash());

//local 방식으로 인증, 실패시 /fail로 이동 , 성공시 메인페이지로 이동
app.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), function (req, res) {
    req.session.save(function () {
        res.redirect('/');
    })
})

//로그인 하는 방법 , 라이브러리 기본 형식 사용
passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw',
    session: true, //로그인후 세션 저장할지 여부
    passReqToCallback: false, // id, pw 이외에 일치 하는 정보가 더있는지 확인용
}, function (inputID, inputPW, done) {
    let user = new UserAct(null,inputID,inputPW,null);
    done = user.login(done);
    return done;
}));

//세션 저장 코드 , 라이브러리 기본 형식 사용
passport.serializeUser(function (user, done) {
    done(null, user.id)
});

//개인 페이지 접속시 작동 , 현재 접속중인 세션의 아이디와 db에 있는 아이디 비교
passport.deserializeUser(function (id, done) {
    db.collection('login').findOne({ id: id }, function (err, result) {
        if (err) { return console.log(err); }
        done(null, result) // result : db에 있는 정보
    })
});

//개인 페이지 이동시 세션 유지를 위해 로그인 코드 아래에 위치해야함
app.get('/mypage', Islogin, function (req, res) {
    let user = new UserAct(req.user.name,req.user.id,req.user.pw,req.user.purpose);
    db.collection('post').find({writer:user.id}).toArray(function(err,result){
        if(err) console.log(err);
        res.render('mypage.ejs',{posts:result,user:user.getUserInfo()});
    })
})

// 개인 페이지 이동 전 로그인 여부
function Islogin(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/');
    }
}

//회원 가입
// 회원가입시 DB에 데이터 저장후 로그인 페이지로 이동 , 아이디 중복 여부 확인
app.post('/register', function (req, res) {
    let user = new UserAct(req.body.name,req.body.id,req.body.pw,req.body.purpose);
    db.collection('login').findOne({id:user.id},function(err,result){
        if(err) console.log(err)
        if(result){
            res.send("<script>alert('이미 존재하는 아이디입니다.'); window.location.replace('/login');</script>");
        } else{
            let result = user.register();
            if(result === 1){
                res.redirect('/login');
            } else {
                res.send("<script>alert('비밀번호를 입력해주세요.'); window.location.replace('/register');</script>");
            }
        }
    })
})

//작성 기능 - 개인페이지에서 작성할수 있도록 할예정
//작성 기능의 object ID는 카운터 기능 추가 - mongodb에 없기에 구현해야함
//작성 기능에 들어갈 것 - 공부한 내용, 날짜, 공부한것들의 종류
app.post('/mypage', function (req, res) {
    let user_post = new Post(req.user.name,req.user.id,req.user.pw,req.user.purpose);
    if(user_post.addPost(req.body)==1){
        res.send("<script>alert('등록이 완료되었습니다.'); window.location.replace('/mypage');</script>");
    } else {
        res.send("<script>alert('잘못된 날짜 형식입니다.'); window.location.replace('/mypage');</script>");
    }
})

//제일 처음 화면
app.get('/', function (req, res) {
    //공부 리스트 전체 출력 , 최신순 , 8개 제한
    db.collection('post').find().sort({date: -1}).limit(8).toArray(function(err, result2){
        if(err) {console.log(err);}
        res.render('index.ejs', {user:req.user , posts:result2});
        })
})


//ajax post 사용을 위해서 사용
//일정 추가를 위해서 사용
app.post('/', function(req,res){
    if(req.body.id == 'guest'){ //ajax 통신 post
        db.collection('schedule').find().toArray(function(err,result){
            for(var i = 0; i < result.length; i++){
                delete result[i]._id;
            }
            console.log(result);
            res.json(result);
        })
    } else { //modal창 button post
        let CC = new ControlCalendar(req.body);
        if(CC.calendar_content == ""){
            res.redirect('/');
        } else if(CC.calendar_start_date == "" || CC.calendar_end_date == ""){
            res.redirect('/');
        } else if(new Date(CC.calendar_end_date) - new Date(CC.calendar_start_date) < 0){
            res.redirect('/');
        } else{
            CC.addCalendar();
            res.redirect('/');
        }
    }
})

//full calendar 일정 삭제
app.delete('/', function(req,res){
    if(req.user){
        if(req.user.id == "admin"){ //관리자만 삭제가능
            data = {calendar_content:req.body.title,calendar_start_date:req.body.start,calendar_end_date:req.body.end};
            let CC = new ControlCalendar(data);
            CC.deleteCalendar();
            res.status(200).send();
        } else{
            res.status(403).send();
        }
    } else {
        res.status(403).send();
    }
})

//register 렌더
app.get('/register', function (req, res) {
    res.render('register.ejs');
})

//로그인시 아이디나 비번 틀렸을때 임시 메세지 전달을 위해 flash 사용
app.get('/login', function (req, res) {
    var fmsg = req.flash();
    res.render('login.ejs', { fmsg });
})

//로그아웃 기능
app.get('/logout', function (req, res, next) {
    let user = new UserAct(req.user.name,req.user.id,req.user.pw,req.user.purpose);
    if(user.logout(req)==1) res.redirect('/');
});

//개인페이지에서의 리스트 - 자기가 작성한것만 보이게
// 공부한 내용이니깐 최신꺼를 제일 위로...
app.get('/list',Islogin, function (req, res) {

    let user_post = new Post(req.user.name,req.user.id,req.user.pw,req.user.purpose);

    db.collection('post').find({writer:user_post.id},{sort:{date:-1}}).toArray(function(err,result){
        if(err) console.log(err);
        res.render('list.ejs',{posts:result,name:user_post.name});
    })

})

//삭제 기능 - 버튼 클릭시 해당 db의 _id값을 가져와 해당 데이터를 삭제
app.delete('/delete', function (req, res) {
    let user_post = new Post(req.user.name,req.user.id,req.user.pw,req.user.purpose);
    if(user_post.deletePost(req.body._id)==1){
        res.status(200).send({message:'성공했습니다.'});
    }

})

//수정 기능 - 페이지
// 버튼 클릭시 해당 데이터를 수정기능 페이지에 값 이동
app.get('/edit/:id', function (req, res) {
    let user = new UserAct(req.user.name,req.user.id,req.user.pw,req.user.purpose);
    db.collection('post').findOne({ _id: parseInt(req.params.id)}, function (err, result) {
        if (err) { return console.log(err); }
        res.render('edit.ejs', { post: result , name:user.name});
    })
})

//수정 버튼 누르면 db에 있던거 업데이트
app.put('/edit', function (req, res) {
    let user_post = new Post(req.user.name,req.user.id,req.user.pw,req.user.purpose);
    user_post.setPost(req.body);
    if(user_post.editPost()==1){
        res.send("<script>alert('수정이 완료되었습니다.'); window.location.replace('/list');</script>");
    } else{
        res.send("<script>alert('수정이 실패하였습니다.'); window.location.replace('/list');</script>");
    }
});

//사용자들의 프로필 확인하는 공간....
// 사용자 목록과 글 작성 목록 같이 보내기(사용자 순으로 정렬해서) -> 카운팅 편하게 하기위해서
app.get('/profile', function(req,res){
    db.collection('login').find().toArray(function(err, result){
        if(err) return console.log(err);
        db.collection('post').find().sort({writer: -1}).toArray(function(err, result2){
            if(err) return console.log(err);
            res.render('profile.ejs',{user: req.user , posts : result2 , user_list:result});
        })
    })
})

