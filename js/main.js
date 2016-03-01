
var WOF = (function() {

    Array.prototype.randomize = function() {
        this.sort(function(a, b) {
            return Math.round(Math.random());
        });
    };
    var prefix = (function() {
        if (document.body.style.MozTransform !== undefined) {
            return "MozTransform";
        }
        else if (document.body.style.WebkitTransform !== undefined) {
            return "WebkitTransform";
        }
        else if (document.body.style.OTransform !== undefined) {
            return "OTransform";
        }
        else {
            return "";
            return "-ms-transform";
        }
    }()),
        degToRad = function(deg) {
            return deg / (Math.PI * 180);
        },
        rotateElement = function(element, degrees) {
            var val = "rotate(-" + degrees + "deg)";
            if (element.style[prefix] != undefined) element.style[prefix] = val;
            var rad = degToRad(degrees % 360),
                filter = "progid:DXImageTransform.Microsoft.Matrix(sizingMethod='auto expand', M11=" + rad + ", M12=-" + rad + ", M21=" + rad + ", M22=" + rad + ")";
            if (element.style["filter"] != undefined) element.style["filter"] = filter;
            element.setAttribute("data-rotation", degrees);
        },
        oc = function(a) { //object converter (changes array to an object)
            var o = {};
            for (var i = 0; i < a.length; i++) {
                o[a[i]] = '';
            }
            return o;
        },
        GAMECLASS = (function() {

            //static int
            var round = 0,
                //in the future this could be from an external server
                puzzles = [
                    "KULLABERG NATURE RESERVE",
                    "KULLABERG NATURUM",
                    "HARBOR PORPOISE",
                    "PEREGRINE FALCON",
                    "SWEDEN", "GATEWAY TO NATURE",
                    "NATURE IS AROUND THE CORNER",
                    "GO GREEN THINK TWICE"
                    ],
                vowels = ['A', 'E', 'I', 'O', 'U'],
                cards = [5000, 600, 500, 300, 500, 800, 550, 400, 300, 900, 500, 300, 900, 0, 600, 400, 300, -2, 800, 350, 450, 700, 300, 600],
                //br = 0, free spin = -1, lat = -2
                currentMoney = 0,
                spinWheel = document.getElementById('spin'),
                spinWheel2 = document.getElementById('spin2'),                
                buyVowel = document.getElementById('vowel'),
                buyVowel2 = document.getElementById('vowel2'),                
                displayArea = document.getElementById('display'),
                wheel = document.getElementById('wheel'),
                newButton = document.getElementById('newpuzzle'),
                newButton2 = document.getElementById('newpuzzle2'),
                money = document.getElementById('money'),
                solve = document.getElementById('solve'),
                solve2 = document.getElementById('solve2'),                
                spinTimeout = false,
                spinModifier = function() {
                    return Math.random() * 10 + 20;
                },
                modifier = spinModifier(),
                slowdownSpeed = 0.5;

            return function GAME() {
                puzzles.randomize();

                var currentPuzzleArray = [],
                    lettersInPuzzle = [],
                    guessedArray = [],
                    puzzleSolved = false,
                    createBoard = function(currentPuzzle) {
                        guessedArray = [];
                        lettersInPuzzle = [];
                        lettersGuessed = 0;
                        puzzleSolved = false;
                        currentPuzzleArray = currentPuzzle.split("");
                        var word = document.createElement('div');
                        displayArea.appendChild(word);
                        word.className = "word";
                        for (var i = 0; i < currentPuzzleArray.length; ++i) {
                            var span = document.createElement('div');
                            span.className = "wordLetter ";

                            if (currentPuzzleArray[i] != " ") {
                                span.className += "letter";
                                if (!(currentPuzzleArray[i] in oc(lettersInPuzzle))) {
                                    lettersInPuzzle.push(currentPuzzleArray[i]);
                                }
                                word.appendChild(span);
                            }
                            else {
                                span.className += "space"
                                word = document.createElement('div');
                                displayArea.appendChild(word);
                                word.className = "word";
                                word.appendChild(span);
                                word = document.createElement('div');
                                displayArea.appendChild(word);
                                word.className = "word";
                            }

                            span.id = "letter" + i;
                        }

                        var clear = document.createElement('div');
                        displayArea.appendChild(clear);
                        clear.className = "clear";
                    },
                    solvePuzzle = function() {
                        if (!puzzleSolved && !createGuessPromt("SOLVE THE PUZZLE?", null, true)) {
                          
                            Materialize.toast("Puzzle NOT solved...", 4000);
                        }
                    },
                    guessLetter = function(guess, isVowel, solvingPuzzle) {
                        var timesFound = 0;
                        isVowel = isVowel == undefined ? false : true;
                        solvingPuzzle = solvingPuzzle == undefined ? false : true;
                        //find it:
                        if (guess.length && !puzzleSolved) {
                            if ((guess in oc(vowels)) && !isVowel && !solvingPuzzle) {
                            
                                Materialize.toast("Cannot guess a vowel right now!", 4000);

                                return false;
                            }
                            if (isVowel && !(guess in oc(vowels)) && !solvingPuzzle) {
                              
                                Materialize.toast("Cannot guess a vowel right now!", 4000);
                                return false;
                            }
                            for (var i = 0; i < currentPuzzleArray.length; ++i) {
                                if (guess == currentPuzzleArray[i]) {
                                    var span = document.getElementById("letter" + i);
                                    if (span.innerHTML != guess) {
                                        //found it
                                        ++timesFound;
                                    }
                                    span.innerHTML = guess;
                                    if (guess in oc(lettersInPuzzle) && !(guess in oc(guessedArray))) {
                                        guessedArray.push(guess);
                                    }
                                }
                            }

                            if (guessedArray.length == lettersInPuzzle.length) {
                             
                                Materialize.toast("PUZZLE SOLVED!", 4000);
                                puzzleSolved = true;
                            }

                            return timesFound;
                        }
                        return false;
                    },
                    nextRound = function() {
                        ++round;
                        if (round < puzzles.length) {
                            while (displayArea.hasChildNodes()) { //remove old puzzle
                                displayArea.removeChild(displayArea.firstChild);
                            }
                            createBoard(puzzles[round]);
                            Materialize.toast("Spin the Kullaberg Wheel!", 4000);
                        }
                        else 
                        Materialize.toast("No more puzzles!", 4000);
                    },
                    updateMoney = function() {
                        money.innerHTML = currentMoney;
                    },
                    spinWheelfn = function(amt) {
                        clearTimeout(spinTimeout);

                        if (!puzzleSolved) {
                            modifier -= slowdownSpeed;
                            if (amt == undefined) {
                                amt = parseInt(wheel.getAttribute('data-rotation'));
                            }
                            rotateElement(wheel, amt);
                            if (modifier > 0) {
                                spinTimeout = setTimeout(function() {
                                    spinWheelfn(amt + modifier);
                                }, 1000 / 5);
                            }
                            else {
                                modifier = spinModifier();
                                var card = cards[Math.floor(Math.round(parseInt(wheel.getAttribute('data-rotation')) % 360) / 15)];
                                switch (parseInt(card)) {
                                case 0:
                      
                                    Materialize.toast("BANKRUPT!", 4000);
                                    currentMoney = 0;
                                    break;
                                case -1:
                      
                                    Materialize.toast("FREE SPIN!", 4000);
                                    break;
                                case -2:
                      
                                    Materialize.toast("LOSE A TURN", 4000);
                                    break;
                                default:
                                    Materialize.toast("YOU SPUN A " + card, 4000);
                                    var timesFound = createGuessPromt("YOU SPUN A " + card + " PLEASE ENTER A LETTER");
                                    
                                    currentMoney += (parseInt(card) * timesFound);
                                }

                                updateMoney();
                            }
                        }
                    },
                    guessTimes = 0,
                    createGuessPromt = function(msg, isVowel, solvingPuzzle) {
                        solvingPuzzle = solvingPuzzle == undefined ? false : true;
                        if (!puzzleSolved) {
                            var letter = prompt(msg, "");
                            if (letter) {
                                var guess = '';
                                if (!solvingPuzzle) {
                                    guess = letter.toUpperCase().charAt(0)
                                }
                                else {
                                    guess = letter.toUpperCase().split("");

                                    function arrays_equal(a, b) {
                                        return !(a < b || b < a);
                                    };
                                    if (arrays_equal(guess, currentPuzzleArray)) {
                                        for (var i = 0; i < guess.length; ++i) {
                                            guessLetter(guess[i], isVowel, solvingPuzzle);
                                        }
                                    }
                                    return puzzleSolved;
                                }
                                var timesFound = guessLetter(guess, isVowel, solvingPuzzle);
                                if (timesFound === false) {
                                    ++guessTimes;
                                    if (guessTimes < 5) {
                                        return createGuessPromt(msg, isVowel, solvingPuzzle);
                                    }
                                }
                                guessTimes = 0;
                                return timesFound;
                            }
                            else {
                                ++guessTimes;
                                if (guessTimes < 5) {
                                    return createGuessPromt(msg, isVowel, solvingPuzzle);
                                }
                            }
                        }
                        return false;
                    };

                //CLICK EVENTS

                function bindEvent(el, eventName, eventHandler) {
                    if (el.addEventListener) {
                        el.addEventListener(eventName, eventHandler, false);
                    } else if (el.attachEvent) {
                        el.attachEvent('on' + eventName, eventHandler);
                    }
                }

                bindEvent(buyVowel, "click", function() {
                    if (currentMoney > 200) {
                        if (createGuessPromt("PLEASE ENTER A VOWEL", true) !== false) currentMoney -= 200;
                    }
                    else {
                      
                        Materialize.toast("You need more than 200 to buy a vowel", 4000)
                    }

                    updateMoney();
                });
                bindEvent(buyVowel2, "click", function() {
                    if (currentMoney > 200) {
                        if (createGuessPromt("PLEASE ENTER A VOWEL", true) !== false) currentMoney -= 200;
                    }
                    else {
                      
                        Materialize.toast("You need more than 200 to buy a vowel", 4000)
                    }

                    updateMoney();
                });                
                bindEvent(newButton, "click", nextRound);
                bindEvent(newButton2, "click", nextRound);
                bindEvent(spinWheel, "click", function() {
                    spinWheelfn();
                    Materialize.toast("Round and round it goes...", 4000);
                    Materialize.toast("Where it stops, no one knows!", 4000);
                });
                bindEvent(spinWheel2, "click", function() {
                    spinWheelfn();
                        Materialize.toast("Round and round it goes...", 4000);
                        Materialize.toast("Where it stops, no one knows!", 4000);
                });                
                bindEvent(wheel, "click", function() {
                    spinWheelfn();
                });
                bindEvent(solve, "click", function() {
                    solvePuzzle();
                });
                bindEvent(solve2, "click", function() {
                    solvePuzzle();
                });                

                this.start = function() {
                    createBoard(puzzles[round]);
                };
            }
        })(),
        game = new GAMECLASS;

    return game;

})();
WOF.start();
Materialize.toast("Welcome to the Kullaberg Wheel!", 4000);

// requestAnimationFrame() shim by Paul Irish
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function() {
	return  window.requestAnimationFrame       || 
			window.webkitRequestAnimationFrame || 
			window.mozRequestAnimationFrame    || 
			window.oRequestAnimationFrame      || 
			window.msRequestAnimationFrame     || 
			function(/* function */ callback, /* DOMElement */ element){
				window.setTimeout(callback, 1000 / 60);
			};
})();