$(document).ready(function(){
	'use strict';

	var minefield = document.getElementById("minefield");
	var timerSpan = document.getElementById("timerSpan");
	var bombsLeftSpan = document.getElementById("bombsLeftSpan");
	var numBombs;
	var bombsLeft;
	var minePatternArr = [];
	
	var timer = 0;
	var timerId;
	
	var pressingShift;
	var gameOn;
	
	var highScores = JSON.parse(localStorage.getItem('highScores'))
			|| {"easy" : {"name" : "", "time" : 0}, 
				"medium" : {"name" : "", "time" : 0}, 
				"hard" : {"name" : "", "time" : 0}};
	
	$(document).keydown(function(e){
		if(e.which == 16){
			pressingShift = true;
		}
	});
	$(document).keyup(function(e){
		if(e.which == 16){
			pressingShift = false;
		}
	});
	
	//  JQuery function to toggle "flag" AKA ".noClick" class
	(function($){
		$.fn.toggleFlag = function() {
			if(this.hasClass("noClick")){
				this.removeClass("noClick");
				bombsLeft++;
			} else {
				this.addClass("noClick");
				bombsLeft --;
			}
			bombsLeftSpan.textContent = bombsLeft + " bombs left.";
			return this;
		};
	})(jQuery);
	
	//  Set up buttons to begin an Easy, Medium, or Hard game.
	$("#easy").click(function(){
		newGame(8,8,10);
        $("#minefield button").css("width", "12.5%");
        $("#minefield button").css("height", "33px");
	});
	$("#medium").click(function(){
		newGame(16,16,40);
        $("#minefield button").css("width", "6.25%");
        $("#minefield button").css("height", "33px");
	});
	$("#hard").click(function(){
		newGame(16,30,99);
        $("#minefield button").css("width", "3.33%");
        $("#minefield button").css("height", "29px");
	});
	
	$("#resetTimes").click(function(){
		highScores = {"easy" : {"name" : "", "time" : 0}, 
					"medium" : {"name" : "", "time" : 0}, 
					"hard" : {"name" : "", "time" : 0}};
		localStorage.setItem('highScores', JSON.stringify(highScores));
		setScoreboard();
	});
	
	
	
	
	//  Function to fill array with bomb pattern
	function newGame(rows, cols, bombs){
		gameOn = true;
		pressingShift = false;
		numBombs = bombs;
		bombsLeft = bombs;
		bombsLeftSpan.textContent = bombsLeft + " bombs left.";
		timer = 0;
		clearInterval(timerId);
		timerId = setInterval(function(){
			timerSpan.textContent = "Time " + formatTime(timer);
			timer++;
		},1000);
		minefield.innerHTML = "";
		
		//  Create 2 dimensional array with randomly created pattern of bombs.
		minePatternArr = [];
		for (var i = 0; i< rows; i++){
			minePatternArr[i] = [];
			for(var j = 0; j < cols; j++){
				minePatternArr[i][j] = 0;
			}
		}
		while(bombs > 0){
			var r = Math.floor(Math.random() * rows);
			var c = Math.floor(Math.random() * cols);
			if(minePatternArr[r][c] != "B"){
				minePatternArr[r][c] = "B";
			bombs--;
			}
		}
		
		//  Create Button elements, set up appropriate event handlers for each button,
		//  and attach append elements to "#minefield" Div.
		for (var i = 0; i < rows; i++){
			var newDiv = document.createElement("div");
			minefield.appendChild(newDiv);
			for(var j = 0; j < cols; j++){
				var newButton = document.createElement("button");
				//  Format Button as a bomb if it corresponds to a bomb in the pattern array.
				if(minePatternArr[i][j] == "B"){
					$(newButton).addClass("bomb");
					$(newButton).click(bombClick);
				} 
				//  Format Button with number of bombs surrounding the square.
				else {
					var surroundingSquares = new gridObject(i,j);
					var bombCount = 0;
					for (var index = 0; index < 8; index++){
						if(checkSquare(surroundingSquares[index])){
							bombCount++;
						}
					}
					minePatternArr[i][j] = bombCount;
					$(newButton).addClass("b" + bombCount);
					$(newButton).click(clearSquareClick);
				}
				newDiv.appendChild(newButton);
				var newText = document.createTextNode(minePatternArr[i][j]);
				newButton.appendChild(newText);
			}
		}	
	}
	
	//  Start an Easy game on page load.
	newGame(8, 8, 10);
	setScoreboard();
	
	//  Constructor to facilitate checking every square surrounding the input indeces.
	function gridObject(i,j){
		this[0] = [i-1,j-1];
	  	this[1] = [i-1,j];
	  	this[2] = [i-1,j+1];
	  	this[3] = [i,j-1];
	  	this[4] = [i,j+1];
	  	this[5] = [i+1,j-1];
	  	this[6] = [i+1,j];
	  	this[7] = [i+1,j+1];
	};

	function checkSquare(arr){
		var i = arr[0];
	  	var j = arr[1];
	  	if(minePatternArr[i]){
			if(minePatternArr[i][j]){
				if(minePatternArr[i][j] == "B"){
					return true;
				}
			}
	  	}
	}
	
	//  Onclick behavior for a bomb Button
	function bombClick(){
		if(gameOn){
			if(pressingShift){
				$(this).toggleFlag();
				if(checkForWin()){
					checkHighScores();
				};
			} else {
				if(!$(this).hasClass("noClick")){
					gameOver();
				}
			}
		}
	}
	
	//  Onclick behavior for a clear Button
	function clearSquareClick(){
		if(gameOn){
			if(pressingShift){
				$(this).toggleFlag();
			} else {
				if(!$(this).hasClass("noClick")){
					$(this).addClass("clicked");
				}
			}
			if(checkForWin()){
				checkHighScores();
			}
		}
	}
	
	//  Function to check if all bombs have been "flagged"
	//  or if all squares without bombs have been cleared.
	function checkForWin(){
		var allBombs = $("#minefield").find(".bomb");
		var notFlagged = allBombs.filter(function(){
			return !$(this).hasClass("noClick");
		});
		if(notFlagged.length == 0){
			return true;
		}
		var unclickedCount = 0;
		$("#minefield").children().each(function(){
			$(this).children().each(function(){
				if(!$(this).hasClass("clicked")){
					unclickedCount++;
				}
			});
		});
		if(unclickedCount == numBombs){
			notFlagged.toggleFlag();
			bombsLeftSpan.textContent = "0 bombs left.";
			clearInterval(timerId);
			return true;
		}
	}
	
	//  End game when a bomb has been clicked.
	function gameOver(){
		gameOn = false;
		alert("Game over!");
		clearInterval(timerId);
	}
	
	//  After game has been won, show record times and check if current game has beat a record.
	function checkHighScores(){
		alert("Congratulations, you win!");
		gameOn = false;
		clearInterval(timerId);
		var finalTime = timer;
		timerSpan.textContent = "Time " + formatTime(finalTime);
		if(numBombs == 10){
			if(finalTime < highScores.easy.time || highScores.easy.time == 0){
				highScores.easy.time = finalTime;
				highScores.easy.name = prompt("You solved the puzzle in record time!" +
						"\nEnter your name:");
				setScoreboard();
				localStorage.setItem('highScores', JSON.stringify(highScores));
			}
		} else if(numBombs == 40){ 
			if(finalTime < highScores.medium.time || highScores.medium.time == 0){
				highScores.medium.time = finalTime;
				highScores.medium.name = prompt("You solved the puzzle in record time!" +
						"\nEnter your name:");
				setScoreboard();
				localStorage.setItem('highScores', JSON.stringify(highScores));
			}
		} else if (numBombs == 99){
			if(finalTime < highScores.hard.time || highScores.hard.time == 0){
				highScores.hard.time = finalTime;
				highScores.hard.name = prompt("You solved the puzzle in record time!" +
						"\nEnter your name:");
				setScoreboard();
				localStorage.setItem('highScores', JSON.stringify(highScores));
			}
		}
	}
	
	function setScoreboard(){
		$("#easyChamp").text(highScores.easy.name); 
		$("#easyBestTime").text(formatTime(highScores.easy.time));
		$("#mediumChamp").text(highScores.medium.name);
		$("#mediumBestTime").text(formatTime(highScores.medium.time));
		$("#hardChamp").text(highScores.hard.name);
		$("#hardBestTime").text(formatTime(highScores.hard.time));
	}
	
	//  Return time in seconds to a formatted string in minutes and seconds.
	function formatTime(t){
		var minutes = Math.floor(t / 60);
		var seconds = (t % 60).toString();
		if(seconds.length == 1){
			seconds = "0" + seconds;
		}
		return minutes + ":" + seconds;
	}
});




















