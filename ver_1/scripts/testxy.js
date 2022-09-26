var canvas, ctx, flag = false,
            prevX = 0,
            currX = 0,
            prevY = 0,
            currY = 0,
            listX = [],
            listY = [],
            dot_flag = false;


        var x = "black",
            y = 2;
        
        function reset() {
            canvas, ctx, flag = false,
            prevX = 0,
            currX = 0,
            prevY = 0,
            currY = 0,
            listX = [],
            listY = [],
            dot_flag = false;
            x = "black";
            y = 2;
            displayList();
            canvas = document.getElementById('can');
            ctx = canvas.getContext("2d");
            ctx.clearRect(0,0,canvas.width,canvas.height);
            w = canvas.width;
            h = canvas.height;
            //init();
        }
        function displayList(){
            var e = "";
            e += " Size: " + listX.length+" "+listY.length+ "<br/>";
            for(var i = 0; i < listX.length; i++){
                e += " " + listX[i] + " " + listY[i] + "<br/>";
            }
            document.getElementById("list").innerHTML = e;
        }
        function init() {
            canvas = document.getElementById('can');
            ctx = canvas.getContext("2d");
            w = canvas.width;
            h = canvas.height;
            canvas.addEventListener("ontouchmove",function(e){
                touchxy('move',e);
            },false);
            canvas.addEventListener("ontouchstart",function(e){
                touchxy('start',e);
            },false);
            canvas.addEventListener("ontouchend",function(e){
                touchxy('end',e);
            },false);
            
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
        function draw(prevX,prevY,currX,currY) {
            ctx.beginPath();
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(currX, currY);
            ctx.strokeStyle = x;
            ctx.lineWidth = y;
            ctx.stroke();
            ctx.closePath();
        }
        function touchxy(res,e){
            if(res=="start")
            {
                prevX = currX;
                prevY = currY;
                currX = e.touches[0].clientX - canvas.offsetLeft;
                currY = e.touches[0].clientY - canvas.offsetTop;
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
            if (res == 'end') {
                flag = false;
            }

            // If Mouse Moves
            if (res == 'move') {
                if (flag) {
                    prevX = currX;
                    prevY = currY;
                    currX = e.touches[0].clientX - canvas.offsetLeft;
                    currY = e.touches[0].clientY - canvas.offsetTop;


                    listX.push(currX);
                    listY.push(currY);
                    displayList();
                    
                    draw(prevX,prevY,currX,currY);
                }
            }

        }
        function findxy(res, e) {

            // If Mouse Held Down
            if (res == 'down') {
                prevX = currX;
                prevY = currY;
                currX = e.clientX - canvas.offsetLeft;
                currY = e.clientY - canvas.offsetTop;
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
            }

            // If Mouse Moves
            if (res == 'move') {
                if (flag) {
                    prevX = currX;
                    prevY = currY;
                    currX = e.clientX - canvas.offsetLeft;
                    currY = e.clientY - canvas.offsetTop;


                    listX.push(currX);
                    listY.push(currY);
                    displayList();
                    
                    draw(prevX,prevY,currX,currY);
                }
            }
        }
        //Testing for Branch