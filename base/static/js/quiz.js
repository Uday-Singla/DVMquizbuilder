var questionNo= 0;


// ------------------- Timer and Instructions --------------------



function getTime(){
    var data = $.ajax( {
        type: 'GET',
        url: `/get_time_remaining`,
        data: {
        },
        success: function(data){   
           var obj = JSON.parse;
           var time = data.time_remaining;
           var minutes = parseInt(time/60);
           var seconds = parseInt(time%60);
           setTimer(minutes,seconds);
        }
    });    
}

getTime();

//-----------------------------------------------------------------
function getQuestionStatus(){
    var data = $.ajax( {
        type: 'GET',
        url: `/gqs`,
        data: {
        },
        
        success: function(data){
            var buttons = document.querySelectorAll(".question-wrapper .questions-container div");
            // console.log(data);
            // console.log(data.attemptedQues);
            for(var i=0; i< data.attemptedQues.length ; i++){
                // console.log("ds");
                // console.log(data.attemptedQues[i]);
                attempted(data.attemptedQues[i]);
            } 
            for(var i=0; i< data.unattemptedQues.length ; i++){
                //console.log("ds");
                //console.log(data.attemptedQues[i]);
                unattempted(data.unattemptedQues[i]);
            }
            for(var i=0; i< data.reviewQues.length ; i++){
                //console.log("ds");
                //console.log(data.attemptedQues[i]);
                markForReview(data.reviewQues[i]);
            }
            for(var i=0; i< data.reviewAttemptedQues.length ; i++){
                //console.log("ds");
                //console.log(data.attemptedQues[i]);
                attempted_review(data.reviewAttemptedQues[i]);
            } 
            // console.log(data);
            attempted_unattempted();

        }
    });    
}
getQuestionStatus();
//--------------------------------------------------------------

function setTimer(maxtime_min, secondsLeft){
    var timer= document.getElementById("timer");
    var minutesLeft = maxtime_min;
    if(secondsLeft<10)
    timer.innerHTML = `${minutesLeft} : 0${secondsLeft}`   
    else
    timer.innerHTML = `${minutesLeft} : ${secondsLeft}`;
    setInterval(function(){
        if(secondsLeft == 0){
            minutesLeft -= 1;
            secondsLeft = 60;
        }
        secondsLeft-=1;
        if(secondsLeft<10)
        timer.innerHTML = `${minutesLeft} : 0${secondsLeft}`   
        else
        timer.innerHTML = `${minutesLeft} : ${secondsLeft}`;
    
     },1000);
}
// ---------------------------------------------------

function questionDisplay(content){
    var newElement = document.createElement("div");
    newElement.className = "questions";
    var questionsContainer = document.getElementsByClassName("questions-container")[0];
    newElement.innerHTML= content;
    newElement.setAttribute("onclick", "navQues("+(content-1)+")");
    questionsContainer.appendChild(newElement);
}
function incrementQuestionNo(){
    //code for ruuning closed loop for question number;
}

var numOfQuestions = 20;
for(var i= 1; i<=numOfQuestions ; i++){
    questionDisplay(i);
}

function navQues(quesNo)
{
    if(window.innerWidth <= 500)
    {
        closeNav();
    }
    questionNo = quesNo;
    document.getElementsByClassName("radio_button")[0].innerHTML="";
    document.getElementsByClassName("question-text")[0].innerHTML="";
    getQuestion(quesNo);
}

function getQuestion(quesNo){   
    var data = $.ajax( {
        type: 'GET',
        url: `/get_question/${quesNo}`,
        data: {
        },
        success: function(data) {
           var obj = JSON.parse;
           var question_view = document.querySelectorAll(".questionsView .question-text")[0];
           question_view.innerHTML = `${data.question}`;
           console.log(data);
           var no_of_options = data.answers.length;
           var form = document.querySelectorAll(".questionsView .form .radio_button")[0];
           for(var i = 0; i< no_of_options;i++){
               var radioButton = document.createElement("input");
               radioButton.setAttribute("type","radio");
               radioButton.setAttribute("name","answer");
               radioButton.setAttribute("onclick","buttonDisplay()");
               radioButton.setAttribute("key",`${data.keys[i]}`);
               if(data.keys[i] == data.marked_answer){
                   console.log(radioButton);
                   // new Discovery 
                   radioButton.setAttribute("checked", "checked");
               }
               var radioHolder = document.createElement("div");
               radioHolder.append(radioButton);
               radioHolder.innerHTML+=`${data.answers[i]}`;
               form.appendChild(radioHolder);
            }
            buttonDisplay();            
        }
    });
     
}
getQuestion(questionNo);

window.addEventListener("resize", function (){
    if(window.innerWidth <= 670){
        
    }
});
function sendAnswer(quesNo,key){
    var data = $.ajax( {
        type: 'POST',
        url: `/store_response`,
        data: {
            "queskey" : quesNo,
            "anskey" : key
        },
        success: function(data) {             
        }
    
    });
}
var checkedKey;
function SaveAndNext(){
    var form = document.querySelectorAll(".questionsView .form .radio_button .div ,input");
    var checked_radio;
    for(var i=0; i<form.length ;i++){
        if(form[i].checked){
            checked_radio =  form[i];
            checkedKey = i;
        }
    }
    var post_key = checked_radio.getAttribute("key");
    return post_key;
}

var saveAndNext = document.querySelectorAll(".footer-buttons #save-next")[0];

saveAndNext.addEventListener("click",function(){
var key = SaveAndNext();
sendAnswer(questionNo , key);
attempted(questionNo);
doNext();
});


var saveAndReview = document.querySelectorAll(".footer-buttons #save-review")[0];
saveAndReview.addEventListener("click",function(){
    var key = SaveAndNext();
    sendAnswer(questionNo , key);
    sendAnswer_Review(questionNo , key);
    attempted_review(questionNo);
    doNext();
    });


var review = document.querySelectorAll(".footer-buttons #review")[0];
review.addEventListener("click",function(){
    sendReview(questionNo);
    markForReview(questionNo);
});

function attempted(questionNo){
    var buttons = document.querySelectorAll(".question-wrapper .questions-container div");
    buttons[questionNo].className = "items attempted";
    sendAttempted(questionNo);
}

function attempted_review(questionNo){
    var buttons = document.querySelectorAll(".question-wrapper .questions-container div");
    buttons[questionNo].className = "items attempted-review";
}

function unattempted(questionNo){
    var buttons = document.querySelectorAll(".question-wrapper .questions-container div");
    buttons[questionNo].className = "items not-attempted";
    sendUnattempted(questionNo);
}

function markForReview(questionNo){
    var buttons = document.querySelectorAll(".question-wrapper .questions-container div");
    buttons[questionNo].className = "items to-be-reviewed";
    sendReview(questionNo);
}

function sendAnswer_Review(quesNo, key){
    var data = $.ajax( {
        type: 'POST',
        url: '/atar',
        data: {
            "queskey" : quesNo,
            "anskey" : key
        },
        success: function(data) {  
            console.log("sent");           
        }
    });
}
function sendReview(quesNo){
    var data = $.ajax( {
        type: 'POST',
        url: '/atr',
        data: {
            "queskey" : quesNo
        },
        success: function(data) {             
        }
    });
}
function sendAttempted(quesNo){
    var data = $.ajax( {
        type: 'POST',
        url: '/ata',
        data: {
            "queskey" : quesNo
        },
        success: function(data) {             
        }       
    });
}
function sendUnattempted(quesNo){
    var data = $.ajax( {
        type: 'POST',
        url: '/atna',
        data: {
            "queskey" : quesNo
        },
        success: function(data) {             
        }
    });
}

var next = document.querySelectorAll(".footer-buttons #next")[0];
next.addEventListener("click", nextques);
function nextques(){
    var buttons = document.querySelectorAll(".question-wrapper .questions-container div");
    if(buttons[questionNo].className != "items attempted" && buttons[questionNo].className != "items to-be-reviewed"){
        unattempted(questionNo);
    }
    doNext();
}
function doNext(){
    questionNo++;
    document.getElementsByClassName("radio_button")[0].innerHTML="";
    document.getElementsByClassName("question-text")[0].innerHTML="";
    getQuestion(questionNo);
    attempted_unattempted();
}

var prev = document.querySelectorAll(".footer-buttons #prev")[0];
prev.addEventListener("click", prevques);

function prevques(){
    var buttons = document.querySelectorAll(".question-wrapper .questions-container div");
    if(buttons[questionNo].className != "items attempted" && buttons[questionNo].className != "items to-be-reviewed"){
        unattempted(questionNo);
    }
    doPrev();
}
function doPrev(){
    questionNo--;
    document.getElementsByClassName("radio_button")[0].innerHTML="";
    document.getElementsByClassName("question-text")[0].innerHTML="";
    getQuestion(questionNo);
}

// ------------------  Ham-menu handler  --------------------
const nav = document.querySelector(".question-wrapper");
var navCount = 0;
document.querySelector(".ham").addEventListener("click", () => {
    if(navCount == 0){
        openNav();
    }
    else {
        closeNav();
    }
});

function openNav() {
    nav.style.left = "0";
    navCount = 1;
    // var imgURL = '../images/cancel.png';
    // document.getElementsByClassName("ham")[0].style.background = "url('../images/cancel.png')";
}

function closeNav() {
    nav.style.left = "-80%";
    navCount = 0;
    // var imgURL = '../images/menu.png';
    // document.getElementsByClassName("ham")[0].style.background = "url('../images/menu.png')";
}
// --------------------------------------------------------
// hard refresh 




function buttonDisplay(){
    var prevBtn = document.getElementById("prev");
    var save_nextBtn = document.getElementById("save-next");
    var nextBtn = document.getElementById("next");
    var reviewBtn = document.getElementById("review");
    var save_reviewBtn = document.getElementById("save-review");
    var submitBtn = document.getElementById("submit");
    var clearBtn = document.getElementById("clear");
    var form = document.querySelectorAll(".questionsView .form .radio_button .div ,input");
    var attempted = false;
    for(var i=0; i<form.length ;i++){
        if(form[i].checked){
            attempted = true;
        }
    }

    if(questionNo == numOfQuestions-1){
        nextBtn.style.display = "none";
        save_nextBtn.style.display = "none";
        reviewBtn.style.display = "inline";
        save_reviewBtn.style.display = "none";
        submitBtn.style.display = "none";

        if(attempted){
            nextBtn.style.display = "none";
            reviewBtn.style.display = "none";
            save_nextBtn.style.display = "none";
            save_reviewBtn.style.display = "none";
            clearBtn.style.display = "inline";
            submitBtn.style.display = "inline";
        }
        else{
            save_nextBtn.style.display = "none";
            save_reviewBtn.style.display = "none";
            nextBtn.style.display = "none";
            reviewBtn.style.display = "inline";
            clearBtn.style.display = "none";
            submitBtn.style.display = "none";
        }
    }
    else{
        nextBtn.style.display = "inline";
        save_nextBtn.style.display = "inline";
        reviewBtn.style.display = "inline";
        save_reviewBtn.style.display = "inline";
        submitBtn.style.display = "none";

        if(attempted){
            nextBtn.style.display = "none";
            reviewBtn.style.display = "none";
            save_nextBtn.style.display = "inline";
            save_reviewBtn.style.display = "inline";
            clearBtn.style.display = "inline";
        }
        else{
            save_nextBtn.style.display = "none";
            save_reviewBtn.style.display = "none";
            nextBtn.style.display = "inline";
            reviewBtn.style.display = "inline";
            clearBtn.style.display = "none";
        }
    }
    if(questionNo == 0)
        prevBtn.style.display = "none";
    else
        prevBtn.style.display = "inline";
}
var clear = document.querySelectorAll(".footer-buttons #clear")[0];
clear.addEventListener("click", clear_response);
function clear_response(){
    console.log("run");
    var form = document.querySelectorAll(".questionsView .form .radio_button .div ,input");
    for(var i=0; i<form.length ;i++){
        form[i].checked = false;
    }
    unattempted(questionNo);
    buttonDisplay();
    sendClearResponse(questionNo);
}


function sendClearResponse(quesNo){
    var data = $.ajax( {
        type: 'POST',
        url: '/delete_response',
        data: {
            "queskey" : quesNo
        },
        success: function(data) {             
        }
    });
}

function attempted_unattempted(){
    var noAttempt = document.getElementById("attempted");
    var noUnattempt = document.getElementById("unattempted");
    var data = $.ajax( {
        type: 'GET',
        url: `/gqs`,
        data: {
        },
        
        success: function(data){
            var atmpt = data.attemptedQues.length + data.reviewAttemptedQues.length;
            noAttempt.innerHTML = "ATTEMPTED: " + atmpt;
            noUnattempt.innerHTML = "UNATTEMPTED: " + (numOfQuestions - atmpt);
        }
    });
}
attempted_unattempted();