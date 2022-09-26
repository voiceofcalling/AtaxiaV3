/** @author Joey */
function $(e){
	return document.getElementById(e);
}

    function getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }

var coordHandler = null;
//objective[x, y, xsize, ysize]
switch(getParameterByName("test")){
	default:
	case "horizontal":
        $("testname").innerHTML="Horizontal Test";
        $("title").innerHTML = "Ataxia | Horizontal Test";
		coordHandler = function(w, h){
			return [[10, h / 2 - 50, 50, 50], [w - 60, h / 2 - 50, 50, 50]];
		};
		break;
	case "vertical":
        $("testname").innerHTML="Vertical Test";
        $("title").innerHTML = "Ataxia | Vertical Test";
		coordHandler = function(w, h){
			return [[w / 2, 10, 50, 50], [w / 2, h - 70, 50, 50]];
		};
		break;
	case "diagonal1":
        $("testname").innerHTML="Diagonal 1 Test";
        $("title").innerHTML = "Ataxia | Diagonal 1 Test";
		coordHandler = function(w, h){
			return [[10, 10, 50, 50], [w - 60, h - 60, 50, 50]];
		};
		break;
	case "diagonal2":
        $("testname").innerHTML="Diagonal 2 Test";
        $("title").innerHTML = "Ataxia | Diagonal 2 Test";
		coordHandler = function(w, h){
			return [[10, h - 60, 50, 50],[w - 60, 10, 50, 50]];
		};
		break;
}

var canvas, ctx, flag = false,
    leftObjective = [],
    rightObjective = [],
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    listX = [],
    listY = [],
    pretotal = 0,
    total = 0,
    fails = 0,
    out = 0,
    off = 0,
    reverse = 0,
    reverseStart = false,
    curOff = false,
    started = false,
    dot_flag = false;
var ended = false;
var starttheta = 0;
var curtheta = 0;

var OptimalY = 0,
    OptimalX = 0;
var OptimalEY = 0,
    OptimalEX = 0;
var Aeq = 0,
    Beq = 0,
    Ceq = 0;
var TrueY = 0,
    TrueX = 0
    TrueprevX = 0;


var x = "black",
    y = 2;

function reset() {
    canvas,
    ctx,
    flag = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    listX = [],
    listY = [],
    total = 0,
    off = 0,
    reverse = 0,
    reverseStart = false,
    curOff = false,
    started = false,
    dot_flag = false;
    ended = false;
    x = "black";
    y = 2;
    displayList();
    canvas = document.getElementById('can');
    w = canvas.width;
    h = canvas.height;
    
    // JOEY
    var ndest = coordHandler(w | 0, h | 0);
    leftObjective = ndest[0];
    rightObjective = ndest[1];
    ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(leftObjective[0], leftObjective[1], leftObjective[2], leftObjective[3]);
    ctx.fillRect(rightObjective[0], rightObjective[1], rightObjective[2], rightObjective[3]);
    //init();
    document.getElementById("discontinuities").innerHTML = "Discontinuities: " + total.toString();
    document.getElementById("off").innerHTML = "Off-By-20: " + off.toString();
    document.getElementById("reverses").innerHTML = "Reverses: " + reverse.toString();
    document.getElementById("misses").innerHTML = "Start fails: " + pretotal.toString();
    document.getElementById("fails").innerHTML = "Total Fails: " + fails.toString();
    OptimalY = leftObjective[1]+leftObjective[3]/2;
    OptimalX = leftObjective[0]+leftObjective[2]/2;
    OptimalEY = rightObjective[1]+rightObjective[3]/2;
    OptimalEX = rightObjective[0]+rightObjective[2]/2;
    Aeq = OptimalY-OptimalEY;
    Beq = OptimalEX-OptimalX;
    Ceq = ((OptimalX*OptimalEY) - (OptimalEX*OptimalY));
}

function cartesianToPolar(xFindTheta, yFindTheta)
{
    curtheta = Math.atan2(xFindTheta,yFindTheta);
}

function discontinue() {
    if(started)
        total += 1;
    document.getElementById("discontinuities").innerHTML = "Discontinuities: " + total.toString();
}

function beforeStartMisses() {
    pretotal += 1;
    fails += 1;
    document.getElementById("misses").innerHTML = "Start fails: " + pretotal.toString();
    document.getElementById("fails").innerHTML = "Total Fails: " + fails.toString();
}

function outOfCanvas() {
    if(started) {
        out += 1;
        fails += 1;
        document.getElementById("outofcanvas").innerHTML = "OutOfCanvas: " + out.toString();
        document.getElementById("fails").innerHTML = "Total Fails: " + fails.toString();
        reset();
    }
}


function offBy20() {
    if(started && TrueY> 20 && curOff == false) {
        curOff = true;
        off += 1;
        document.getElementById("off").innerHTML = "Off-By-20: " + off.toString();
    }
    if(curOff == true && TrueY <= 20) {
        curOff = false;
    }
    /*
    switch(getParameterByName("test")){
        default:
        case "horizontal":
            if(started && Math.abs(currY - OptimalY) > 20 && curOff == false) {
                curOff = true;
                off += 1;
                document.getElementById("off").innerHTML = "Off-By-20: " + off.toString();
            }
            if(curOff == true && Math.abs(currY - OptimalY) <= 20) {
                curOff = false;
            }
            break;
        case "vertical":
            if(started && Math.abs(currX - OptimalX) > 20 && curOff == false) {
                curOff = true;
                off += 1;
                document.getElementById("off").innerHTML = "Off-By-20: " + off.toString();
            }
            if(curOff == true && Math.abs(currX - OptimalX) <= 20) {
                curOff = false;
            }
            break;
    }*/
    
}

function reversef() {
    // reset();
    if(TrueX > TrueprevX) {
        reverseStart = false;
    } else if(reverseStart == false && TrueX < TrueprevX) {
        reverseStart = true;
        reverse += 1;
        document.getElementById("reverses").innerHTML = "Reverses: " + reverse.toString();
    }
}
var isTouchDevice = 'ontouchstart' in document.documentElement;
var globalX = 0,
    globalY = 0,
    pos0;

function _toGlobalPosition(e) {
    globalX = e.clientX - pos0.x | 0;
    globalY = e.clientY - pos0.y | 0;
}

function _oob_detect() {
    return (globalX <= pos0.width) && (globalY <= pos0.height);
}


function init() {
    reset();
    pos0 = canvas.getBoundingClientRect();
    if(!isTouchDevice) {
        document.addEventListener("mousemove", function(e) {
            _toGlobalPosition(e);
            findxy('move')
        }, false);
        document.addEventListener("mousedown", function(e) {
            _toGlobalPosition(e);
            findxy('down')
        }, false);
        document.addEventListener("mouseup", function(e) {
            _toGlobalPosition(e);
            findxy('up')
        }, false);
        document.addEventListener("mouseout", function(e) {
            _toGlobalPosition(e);
            findxy('out')
        }, false);
    } else {
        var elt = document.getElementById("global");
        canvas.addEventListener("touchstart", function(e) {
            _toGlobalPosition(e.touches[0]);
            findxy('down');
            e.preventDefault();
        }, false);
        var $this = canvas;
        canvas.addEventListener("touchmove", function(e) {
            _toGlobalPosition(e.touches[0]);
            var touch = e.touches[0] || e.changedTouches[0];
            if(!_isInBounds(touch, pos0, pos0.width, pos0.height)) {
                _toGlobalPosition(e);
                alert("fail");
                findxy('out');
            } else

                findxy('move');
            e.preventDefault();
        }, false);

        function _isInBounds(touch, elemposition, width, height) {
            var left = elemposition.left,
                right = left + width,
                top = elemposition.top,
                bottom = top + height,
                touchX = touch.pageX,
                touchY = touch.pageY;

            return (touchX > left && touchX < right && touchY > top && touchY < bottom);
        };
        canvas.addEventListener("touchend", function(e) {
            findxy('up');
            e.preventDefault();
        }, false);
    }
}


function displayList() {
    var e = "";
    e+="A: "+Aeq+", "+"B: "+Beq+", C: "+Ceq+", Start: "+OptimalX+" "+OptimalY+", End: "+OptimalEX+" "+OptimalEY+ "<br/>";
    e += " Size: " + listX.length + " " + listY.length + "<br/>";

    for(var i = 0; i < listX.length; i++) {
        e += " " + listX[i] + " " + listY[i] +", TrueY:"+TrueY+ ", TrueX:" + TrueX+", TruePrevX:"+TrueprevX+"<br/>";
    }
    document.getElementById("list").innerHTML = e;
}

function draw() {
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = x;
    ctx.lineWidth = y;
    ctx.stroke();
    ctx.closePath();
}

function findxy(res) {
    if(ended)
        return;

    // If Mouse Held Down
    switch (res) {
        case "down":
            prevX = currX;
            prevY = currY;
            currX = globalX;
            currY = globalY;
            var x1 = (Beq*(Beq*currX-Aeq*currY)-Aeq*Ceq)/(Aeq*Aeq+Beq*Beq);
            var y1 = (Aeq*(-1*Beq*currX+Aeq*currY)-Beq*Ceq)/(Aeq*Aeq+Beq*Beq);
            TrueprevX = TrueX;
            TrueY = Math.sqrt(Math.pow(currX-x1,2)+Math.pow(currY-y1,2));
            TrueX = Math.sqrt(Math.pow(OptimalX-x1,2)+Math.pow(OptimalY-y1,2));
            //TrueY = Math.abs(Aeq*currX+Beq*currY+Ceq)/(Math.sqrt(Math.pow(Aeq,2)+Math.pow(Beq,2)));
            //TrueX = Math.sqrt((Math.pow(currX-OptimalX,2))+Math.pow(currY-OptimalY,2)-Math.pow(TrueY,2));
            /*
            10,150
            10,200
            60,150
            60,200
            */

            //10, 150, 50, 50

            // If Not Started
            if(!started) {
                // If Click Button
                if(currX >= leftObjective[0] && currX <= (leftObjective[0] + leftObjective[2]) && currY >= leftObjective[1] && currY <= (leftObjective[1] + leftObjective[3])) {
                    started = true;
                    
                    ctx.fillStyle = "#00FF00";
                    ctx.fillRect(leftObjective[0], leftObjective[1], leftObjective[2], leftObjective[3]);

                } else {
                    if(currX>=0&&currX<=864&&currY>=0&&currY<=576)
                        beforeStartMisses();
                    listX.push(currX);
                    listY.push(currY);
                    displayList();
                    return;
                    // Push Failed Attempts/Coords to List
                }

            }
            
            if(currX>=0&&currX<=864&&currY>=0&&currY<=576)
                offBy20();
            if(curOff == true && started && TrueY <= 20) {//(OptimalY-currY)<=20
                curOff = false;
            }
            
            listX.push(currX);
            listY.push(currY);
            displayList();
            flag = true;
            dot_flag = true;
            if(dot_flag) {
                ctx.beginPath();
                ctx.fillStyle = x;
                ctx.fillRect(currX, currY, 2, 2);
                ctx.closePath();
                dot_flag = false;
            }
            break;
        case "up":
            flag = false;
            if(currX>=0&&currX<=864&&currY>=0&&currY<=576)
                discontinue();
            break;
        case "out":
            if(!flag) break;
            flag = false;
            outOfCanvas();
            break;
        case "move":
            if(!started) break;
            if(flag) {
                prevX = currX;
                prevY = currY;
                currX = globalX;
                currY = globalY;
                var x1 = (Beq*(Beq*currX-Aeq*currY)-Aeq*Ceq)/(Aeq*Aeq+Beq*Beq);
                var y1 = (Aeq*(-1*Beq*currX+Aeq*currY)-Beq*Ceq)/(Aeq*Aeq+Beq*Beq);
                TrueprevX = TrueX;
                TrueY = Math.sqrt(Math.pow(currX-x1,2)+Math.pow(currY-y1,2));
                TrueX = Math.sqrt(Math.pow(OptimalX-x1,2)+Math.pow(OptimalY-y1,2));
                //TrueY = Math.abs(Aeq*currX+Beq*currY+Ceq)/(Math.sqrt(Math.pow(Aeq,2)+Math.pow(Beq,2)));
                //TrueX = Math.sqrt((Math.pow(currX-OptimalX,2))+Math.pow(currY-OptimalY,2)-Math.pow(TrueY,2));

                listX.push(currX);
                listY.push(currY);
                displayList();

                // If End Checkpoint is Reached
                if(currX >= rightObjective[0] && currX <= (rightObjective[0] + rightObjective[2]) && currY >= rightObjective[1] && currY <= (rightObjective[1] + rightObjective[3])) {
                    ctx.fillStyle = "#00FF00";
                    ctx.fillRect(rightObjective[0], rightObjective[1], rightObjective[2], rightObjective[3]);
                    ended = true;

                }
                draw();
                if(currX>=0&&currX<=864&&currY>=0&&currY<=576)
                    offBy20();
                if(currX>=0&&currX<=864&&currY>=0&&currY<=576)
                    reversef();
            }
    }
}
//Testing for Branch
