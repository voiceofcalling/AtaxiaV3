var canvas, ctx, flag = false,
            leftObjective = [10, 150, 50, 50],
            rightObjective = [1140, 150, 50, 50],
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
            ended = false;


            var OptimalY = 0;


        var x = "black",
            y = 2;
        
        function reset() {
            canvas, ctx, flag = false,
            leftObjective = [10, 150, 50, 50],
            rightObjective = [1140, 150, 50, 50],
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
            ctx = canvas.getContext("2d");
            ctx.clearRect(0,0,canvas.width,canvas.height);
            w = canvas.width;
            h = canvas.height;
            ctx.fillStyle = "#FF0000";
            ctx.fillRect(leftObjective[0], leftObjective[1], leftObjective[2], leftObjective[3]);
            ctx.fillRect(rightObjective[0], rightObjective[1], rightObjective[2], rightObjective[3]);
            //init();
            document.getElementById("discontinuities").innerHTML = "Discontinuities: "+total.toString();
            document.getElementById("off").innerHTML = "Off-By-20: "+off.toString();
            document.getElementById("reverses").innerHTML ="Reverses: "+reverse.toString();
            
            OptimalY = 0;
        }
        function discontinue()
        {
            if(started)
                total+=1;
            document.getElementById("discontinuities").innerHTML = "Discontinuities: "+total.toString();
        }
        function beforeStartMisses()
        {
            pretotal += 1;
            fails+=1;
            document.getElementById("misses").innerHTML = "Start fails: "+pretotal.toString(); 
            document.getElementById("fails").innerHTML="Total Fails: "+fails.toString();
        }
        function outOfCanvas()
        {
            if(started)
            {
                out+=1;
                fails+=1;
                document.getElementById("outofcanvas").innerHTML = "OutOfCanvas: "+out.toString();
                document.getElementById("fails").innerHTML="Total Fails: "+fails.toString();
                reset();
            }
        }
        function offBy20()
        {
            if(started&&Math.abs(currY-OptimalY)>20&&curOff==false)
            {
                curOff = true;
                off+=1;
                document.getElementById("off").innerHTML = "Off-By-20: "+off.toString();
            }
            if(curOff==true&&Math.abs(currY-OptimalY)<=20)
            {
                curOff=false;
            }
        }
        function reversef()
        {
           // reset();
            if(currX>prevX)
            {
                reverseStart = false;
            }
            else if(reverseStart==false&&currX<prevX)
            {
                reverseStart = true;
                reverse+=1;
                document.getElementById("reverses").innerHTML ="Reverses: "+reverse.toString();
            }
        }

        function init() {
            canvas = document.getElementById('can');
            ctx = canvas.getContext("2d");
            w = canvas.width;
            h = canvas.height;
            ctx.fillStyle = "#FF0000";
            ctx.fillRect(leftObjective[0], leftObjective[1], leftObjective[2], leftObjective[3]);
            ctx.fillRect(rightObjective[0], rightObjective[1], rightObjective[2], rightObjective[3]);
            canvas.addEventListener("mousemove", function (e) {
                findxy('move', e)
            }, false);
            canvas.addEventListener("mousedown", function (e) {
                findxy('down', e)
            }, false);
            canvas.addEventListener("mouseup", function (e) {
                findxy('up', e)
            }, false);
            canvas.addEventListener("mouseout", function (e) {
                findxy('out', e)
            }, false);
        }
        

        function displayList(){
            var e = "";
            e += " Size: " + listX.length+" "+listY.length+ "<br/>";
            for(var i = 0; i < listX.length; i++){
                e += " " + listX[i] + " " + listY[i] + "<br/>";
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
        function findxy(res, e) {
            if(ended)
                return;

            // If Mouse Held Down
            if (res == 'down') {
                prevX = currX;
                prevY = currY;
                currX = e.clientX - canvas.offsetLeft;
                currY = e.clientY - canvas.offsetTop;
                /*
                10,150
                10,200
                60,150
                60,200
                */

                //10, 150, 50, 50

                // If Not Started
                if (!started){
                    // If Click Button
                    if (currX >= leftObjective[0] && currX <= (leftObjective[0] + leftObjective[2]) && currY >= leftObjective[1] && currY <= (leftObjective[1] + leftObjective[3])) {
                        started = true;
                        OptimalY = currY;
                        ctx.fillStyle = "#00FF00";
                        ctx.fillRect(leftObjective[0], leftObjective[1], leftObjective[2], leftObjective[3]);
                        
                    }

                    else {
                        beforeStartMisses();
                        listX.push(currX);
                        listY.push(currY);
                        displayList();
                        return;
                        // Push Failed Attempts/Coords to List
                    }

                }
                offBy20();
                if(curOff==true&&started&&Math.abs(currY-OptimalY)<=20)
                {
                    curOff=false;
                }
                listX.push(currX);
                listY.push(currY);
                displayList();
                flag = true;
                dot_flag = true;
                if (dot_flag) {
                    ctx.beginPath();
                    ctx.fillStyle = x;
                    ctx.fillRect(currX, currY, 2, 2);
                    ctx.closePath();
                    dot_flag = false;
                }
            }

            // If Mouse Not Held Down
            if (res == 'up') {
                flag = false;
                discontinue();
            }
            if(res=='out')
            {
                flag = false;
                outOfCanvas();
            }

            // If Mouse Moves
            if (res == 'move' && started) {
                if (flag) {
                    prevX = currX;
                    prevY = currY;
                    currX = e.clientX - canvas.offsetLeft;
                    currY = e.clientY - canvas.offsetTop;


                    listX.push(currX);
                    listY.push(currY);
                    displayList();
                    
                    // If End Checkpoint is Reached
                    if (currX >= rightObjective[0] && currX <= (rightObjective[0] + rightObjective[2]) && currY >= rightObjective[1] && currY <= (rightObjective[1] + rightObjective[3])) {
                        ctx.fillStyle = "#00FF00";
                        ctx.fillRect(rightObjective[0], rightObjective[1], rightObjective[2], rightObjective[3]);
                        ended = true;

                    }
                    draw();
                    offBy20();
                    reversef();
                }
            }
        }
        //Testing for Branch