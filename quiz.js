// The Question function is the parent for all other question objects;
// All question objects will inherit from this Question constructor

function Question(theQuestion, theChoices, theCorrectAnswer) {
   // Initialize the instance properties
   this.question = theQuestion;
   this.choices = theChoices;
   this.correctAnswer = theCorrectAnswer;
   this.userAnswer = "";

   // private properties: these cannot be changed by instances
   var newDate = new Date(),
   // Constant variable: available to all instances through the instance method below. This is also a private property.
       QUIZ_CREATED_DATE = newDate.toLocaleDateString();

// This is the only way to access the private QUIZ_CREATED_DATE variable
// This is an example of a privilege method: it can access private properties and it can be called publicly
   this.getQuizDate = function () {
       return QUIZ_CREATED_DATE;
   };

// A confirmation message that the question was created
    console.log("Quiz Created On: " + this.getQuizDate());
}


// Define the prototype methods that will be inherited​
Question.prototype.getCorrectAnswer = function () {
   return  this.correctAnswer;
};

Question.prototype.getUserAnswer = function () {
  return this.userAnswer;
};

Question.prototype.displayQuestion = function () {
   var questionToDisplay = "<h3>Question</h3><div class='radio'><div class='question'>" + this.question + "</div><ul>";
       choiceCounter = 0;

   this.choices.forEach(function (eachChoice)  {
       questionToDisplay += '<li><input type="radio" name="choice" id ="' + choiceCounter + '" value="' + choiceCounter + '"><label for="' + choiceCounter + '">' + eachChoice + '</label></li>';
       choiceCounter++;
   });
   questionToDisplay += "</ul></div>";

   return questionToDisplay;
};


function MultipleChoiceQuestion(theQuestion, theChoices, theCorrectAnswer){
  Question.call(this, theQuestion, theChoices, theCorrectAnswer);
}

MultipleChoiceQuestion.prototype = Object.create(Question.prototype);

var quiz;

$(document).ready(function(){
  //User presses button to start quiz
  $("#start").on('click',function(){
    quiz = new Quiz();
    quiz.start();
    quiz.showQuestion();
    $("#start").hide();
  });
});

// QUESTION: Should I have to create a handler for each button

//set user answer on answer selection
$("#showQuestion").on("click","input", function() {
  quiz.getQuestion().userAnswer = $("input:checked").val();
  if(!$("#submit").length) {
    var submit = $('<button id="submit">Submit Answer</button>');
    $('#showQuestion').append(submit);
  }
});

//User presses the next button
$("#showQuestion").on("click","#next", function() {
  $("#next").prop('disabled', true);
  quiz.showQuestion();
});

//User presses back button
$("#showQuestion").on("click","#prev", function() {
  $("#prev").prop('disabled', true);
  quiz.prev();
  quiz.showQuestion();
});


//User presses show score button
$("#showQuestion").on("click","#score", function() {
    quiz.showScore();
    $("#start").show();
    $("#start").text("Try Again!!");
});

//Users presses the submit button
$("#showQuestion").on("click","#submit", function() {
  quiz.submit();
  $("#submit").prop('disabled', true);
  $("#submit").hide();
  if(quiz.nextQuestion()) { // checks if there is a next question
    var next = $('<button id="next">Next Question</button>');
    $('#showQuestion').append(next);
  } else {
    var score = $('<button id="score">Show Score</button>');
    $('#showQuestion').append(score); //score is html
  }
});

var Quiz = function() {
  var curr = 0;
  var correct = 0;
  var answers = [];
  var allQuestions = [];
  /* var allQuestions = [new MultipleChoiceQuestion("Who is Prime Minister of England?", ["Obama", "Blair", "Brown", "Cameron"], 3),
                     new MultipleChoiceQuestion("What is the Capital of Brazil?", ["São Paulo", "Rio de Janeiro", "Brasília"], 2),
                     new MultipleChoiceQuestion("What is the population of Japan?", ["130mil", "150mil", "170mil","200mil"], 0)]; */

  $.getJSON("https://api.myjson.com/bins/19tof", function(data) {
    $.each( data, function(key, val) {
      val.forEach(function(elem) {
        allQuestions.push(new MultipleChoiceQuestion(elem.question, elem.answers, elem.correct));
      });
    });
  });

  this.start = function() {
    curr = 0; // resets the current index
  };

  this.nextQuestion = function() {
    curr++;
    return curr < allQuestions.length;
  };

  this.prev = function() {
    curr--;
  };

  this.firstQuestion = function() {
    return curr === 0 ? true : false;
  };

  this.showQuestion = function () {
    $('#showQuestion').fadeOut('slow', complete);
    // $('#showQuestion').hide();
    function complete() {
      $('#showQuestion').html(quiz.getQuestion().displayQuestion());
      $('#showQuestion').fadeIn();
      if(!quiz.firstQuestion()) {
        var prev = $('<button id="prev"><< Back</button>');
        $('#showQuestion').append(prev);
      }
      if(answers[curr]){
        $('#'+ answers[curr]).prop('checked', true);
        var submit = $('<button id="submit">Submit Answer</button>');
        $('#showQuestion').append(submit);
      }
    }
  };

  this.getQuestion = function() {
    return allQuestions[curr];
  };

  this.submit = function() {
    answers[curr] = (quiz.getQuestion().getUserAnswer());
    correct += quiz.getQuestion().getUserAnswer() == quiz.getQuestion().getCorrectAnswer() ? 1 : 0;
  };

  this.showScore = function() {
    $('#showQuestion').html('<div id="scoreDis"> OMG!! You got correct ' + correct + ' answers out of ' + allQuestions.length + ' questions.</div>');
  };
};
