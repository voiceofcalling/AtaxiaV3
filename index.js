const MAX_HEIGHT = 600;
const MAX_WIDTH = 900;

/** @type {Array.<number>} */
let points = [];
let deviations = [];

/** @type {HTMLCanvasElement} */
let canvas = null;
/** @type {CanvasRenderingContext2D} */
let ctx = null;

/**
 * Whether the test has been completed or not. 
 */
let finished = false;
/**
 * Whether we've clicked on the left box or not.
 */
let started = false;
let leftGreen = false;
let rightGreen = false;

let patientName = null;
let patientID = -1;

let pointerX = -1;
let pointerY = -1;

const LEFT = 0,
    RIGHT = 1,
    NEITHER = 2;

// The time that the current patient first touched the screen . 
let startTime = -1;

// The sign of the direction 
let directionY = -1,
    directionX = -1;

// Deviation threshold. Used to off-by-X
let deviationThreshold = 0;

// List of events and statistics
let deviationAreas = 0,
    reverses = 0,
    discontinuities = 0,
    turns = 0,
    oob = 0,
    startfails = 0,

    number_of_points = 0,

    // Note: we will recalculate this often because the user may change the points. 
    offByCurrent = 0;

// XXX: hack
let update_darea = () => { };
let stats = {
    get deviationAreas() { return deviationAreas; },
    set deviationAreas(a) { deviationAreas = a; update_darea(); },
    get y_turns() { return reverses; },
    set y_turns(a) { reverses = a; document.getElementById("verrev").innerHTML = a; },
    get discontinuities() { return discontinuities; },
    set discontinuities(a) { discontinuities = a; document.getElementById("discon").innerHTML = a; },
    get oob() { return oob; },
    set oob(a) { oob = a; document.getElementById("oob").innerHTML = a; },
    get x_turns() { return turns; },
    set x_turns(a) { turns = a; document.getElementById("turns").innerHTML = a; },
    get offByCurrent() { return offByCurrent; },
    set offByCurrent(a) { offByCurrent = a; document.getElementById("offby").innerHTML = a; },
    get startFails() { return startfails; },
    set startFails(a) { startfails = a; document.getElementById("sfail").innerHTML = a; },
};

let cg = ConfettiGenerator({
    width: MAX_WIDTH,
    height: MAX_HEIGHT
});

/** @type {Array.<Array<number>>} */
let historical_stats = [];

class Box {
    /**
     * @param {number} x 
     * @param {number} y 
     * @param {number} w 
     * @param {number} h 
     */
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    draw(a) {
        ctx.fillRect(this.x, this.y, this.w, this.h);

        const FONT_SIZE = 30;
        ctx.fillStyle = "white";
        ctx.font = FONT_SIZE + "px serif";
        let t = ctx.measureText(a);

        ctx.fillText(a, this.x + this.w / 2 - t.width / 2, this.y + this.h - FONT_SIZE / 2);
    }

    inBounds(x, y) {
        // FAST way to check if this.x <= x <= this.x + width
        return ((x - this.x) >>> 0) <= this.w &&
            ((y - this.y) >>> 0) <= this.h;
    }

    centroidX() {
        return this.x + (this.w >> 1);
    }
    centroidY() {
        return this.y + (this.h >> 1);
    }
}

/**
 * @abstract
 */
class Test {
    constructor() {
        /** @type {[Box, Box]} */
        this.boxes = [];
    }
    getSEBox() {
        throw "implement abstract method";
    }

    /**
     * Get deviation from our ideal line. 
     * @param {number} x 
     * @param {number} y 
     */
    getDeviationFromLine(x, y) {
        let x1 = this.boxes[0].centroidX(),
            x2 = this.boxes[1].centroidX(),
            y1 = this.boxes[0].centroidY(),
            y2 = this.boxes[1].centroidY();

        // Special case if horizontal: check horizontal distance. 
        if (x2 === x1) {
            return Math.abs(x - x1);
        }

        // Determine the slope
        let m = (y2 - y1) / (x2 - x1);

        // https://brilliant.org/wiki/distance-between-point-and-line/
        // https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line#Line_defined_by_two_points 
        {
            let x0 = x;
            let y0 = y;

            let x2_minus_x1 = x2 - x1;
            let y2_minus_y1 = y2 - y1;
            let distance = Math.abs(x2_minus_x1 * (y1 - y0) - (x1 - x0) * y2_minus_y1)
                / Math.sqrt(
                    (x2_minus_x1 * x2_minus_x1) +
                    (y2_minus_y1 * y2_minus_y1)
                );

            return distance;
        }
    }

    direction() {
        return this.boxes[0].x < this.boxes[1].x ? RIGHT : LEFT;
    }
}

class HorizontalTest extends Test {
    constructor() {
        super();

        this.boxes = [new Box(10, MAX_HEIGHT / 2 - 50, 50, 50), new Box(MAX_WIDTH - 60, MAX_HEIGHT / 2 - 50, 50, 50)];
    }
    getSEBox() {
        return this.boxes;
    }

    getLeftBox() { return this.boxes[0]; }
    getRightBox() { return this.boxes[1]; }
}
class VerticalTest extends Test {
    constructor() {
        super();

        this.boxes = [new Box(MAX_WIDTH / 2 - 25, 10, 50, 50), new Box(MAX_WIDTH / 2 - 25, MAX_HEIGHT - 60, 50, 50)];
    }
    getSEBox() {
        return this.boxes;
    }

    getLeftBox() { return this.boxes[0]; }
    getRightBox() { return this.boxes[1]; }
}
class DiagonalTest1 extends Test {
    constructor() {
        super();

        this.boxes = [new Box(10, 10, 50, 50), new Box(MAX_WIDTH - 60, MAX_HEIGHT - 60, 50, 50)];
    }
    getSEBox() {
        return this.boxes;
    }

    getLeftBox() { return this.boxes[0]; }
    getRightBox() { return this.boxes[1]; }
}
class DiagonalTest2 extends Test {
    constructor() {
        super();

        this.boxes = [new Box(10, MAX_HEIGHT - 60, 50, 50), new Box(MAX_WIDTH - 60, 10, 50, 50)];
    }
    getSEBox() {
        return this.boxes;
    }

    getLeftBox() { return this.boxes[0]; }
    getRightBox() { return this.boxes[1]; }
}

let currentTest = new HorizontalTest();

function changeTest(t) {
    currentTest = t;
    reset();
    drawStartAndEnd();
}

/**
 * Draw the colored boxes. 
 */
function drawStartAndEnd() {
    let boxes = currentTest.getSEBox();
    // Draw line between them 
    ctx.strokeStyle = "#aaa";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(boxes[0].centroidX(), boxes[0].centroidY());
    ctx.lineTo(boxes[1].centroidX(), boxes[1].centroidY());
    ctx.stroke();
    ctx.closePath();

    ctx.fillStyle = leftGreen ? "green" : "red";
    boxes[0].draw("S");
    ctx.fillStyle = rightGreen ? "green" : "red";
    boxes[1].draw("E");

    ctx.fillStyle = "gray";
}

/**
 * Called to redraw all points on the canvas. Should only be done in times of extreme duress.
 */
function rerender() {
    ctx.clearRect(0, 0, MAX_WIDTH, MAX_HEIGHT);
    drawStartAndEnd(!finished);

    // Draw all lines
    for (let i = 1; i < points.length; i++) {
        if ((points[i] | points[i - 1]) < 0) continue; // don't connect lines if they've been OR'ed by 0x80000000. 
        let x1 = points[i - 1 | 0] >> 16,
            y1 = points[i - 1 | 0] & 0xFFFF,
            x2 = points[i] >> 16,
            y2 = points[i] & 0xFFFF;
        drawLine(x1, y1, x2, y2);
    }
}

function normalizeX(x) {
    return x - canvas.getBoundingClientRect().x | 0;
}
function normalizeY(y) {
    return y - canvas.getBoundingClientRect().y | 0;
}

/**
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 */
function drawLine(x1, y1, x2, y2) {
    // TODO: don't set these here every time. 
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;

    ctx.beginPath();
    // This is MUCH faster than pushing an [x, y] tuple in an array 
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
}

function calculateDeviationFromIdeal() {
    // Convert our coordinates into "pseudo-X" and "pseudo-Y" coordinates
    // First, determine our _right angle deviation_ from the line 
    let deviation = currentTest.getDeviationFromLine(pointerX, pointerY) | 0;

    // Next, determine the point where our lines would intersect

    // Add it to our list of deviations
    deviations.push(deviation);
    // Check if we've gone beyond the threshold
    if (deviation >= deviationThreshold) {
        // Check if we have a previous value that we can guard against 
        if (deviations.length > 1 && deviations[deviations.length - 2] < deviationThreshold)
            stats.offByCurrent++;
    }

    stats.deviationAreas += deviation;
}

/**
 * Called when mouse pointer/finger is tapped on the screen. 
 * @param {number} x 
 * @param {number} y 
 */
function pointerdown(x, y) {
    if (finished) return;
    // If we've not yet started the test, turn the left marker green 
    if (!started) {
        // Indiate that we touched the screen. 
        startTime = Date.now();

        // Only start the test if we've clicked inside of it
        if (currentTest.getLeftBox().inBounds(x, y)) {
            leftGreen = true;
            started = true;
            rerender();
        } else {
            // We clicked out of bounds: this is classified as a start fail
            stats.startFails++;
            return;
        }
    }
    // Start a new path
    pointerX = x;
    pointerY = y;

    calculateDeviationFromIdeal();

    points.push((pointerX << 16) | pointerY);
    number_of_points++;
    document.getElementById("text").innerHTML += "start " + x + ", " + y + "<br>";
}
function pointermove(x, y) {
    if (finished) return;
    if (pointerX !== -1) {
        // Draw a line and memoize it. 
        drawLine(pointerX, pointerY, x, y);

        // XXX: this is REALLY horrible, but it works. 
        let targetDirection = currentTest.direction();
        let oldDirectionX = directionX;
        // Don't change directionX if we haven't moved yet 
        if (x !== pointerX)
            directionX = x - pointerX > 0 ? RIGHT : LEFT;
        if (oldDirectionX !== -1 && directionX !== oldDirectionX) {
            if (targetDirection !== directionX)
                stats.x_turns++;
        }


        let oldDirectionY = directionY;
        // Don't change directionX if we haven't moved yet 
        if (y !== pointerY)
            directionY = y - pointerY > 0 ? RIGHT : LEFT;
        if (oldDirectionY !== -1 && directionY !== oldDirectionY) {
            update_y_turn_stats(y);
            stats.y_turns++;
        }

        pointerX = x;
        pointerY = y;
        calculateDeviationFromIdeal();
        points.push((x << 16) | y);
        number_of_points++;

        document.getElementById("text").innerHTML += "move " + x + ", " + y + "<br>";

        if (currentTest.getRightBox().inBounds(x, y)) {
            // Make the right box green. 
            rightGreen = true;
            rerender();

            // Finish test
            //cg.render();  //fireworks

            ctx.fillStyle = "red";
            ctx.font = "30px serif";
            let text = "Finish!";
            let params = ctx.measureText(text);
            ctx.fillText(text, MAX_WIDTH / 1.5, (MAX_HEIGHT / 2) + (250));
            halt();
        }
    }
}

let update_y_func = () => { };
let yTurns = [];
function update_y_turn_stats(y) {
    yTurns.push(y);
    update_y_func();
}

function pointerup() {
    if (!started) return;
    if (finished) return;
    // Mark it as our last location. 
    points.push(points[points.length - 1] | 0x80000000);
    // Make sure our deviation area is aligned. 
    //deviationAreas.push(-1); <-- we don't want to push -1, since the way we check off-by-X is to check the previous value, and that would make our code more complicated. 

    pointerX = -1;
    pointerY = -1;

    directionX = -1;
    directionY = -1;

    stats.discontinuities++;

    rerender();
}

function pointerleave() {
    stats.oob++;
}

// When we change the off-by value, we need to be able to recalculate. 
function recalculateOffBy() {
    stats.offByCurrent = 0;
    for (let i = 1; i < deviations.length; i++) {
        // WE only want to increment if we passed the threshold for the first time.
        if (deviations[i] >= deviationThreshold && deviations[i - 1] < deviationThreshold) stats.offByCurrent++;
    }
}

function halt() {
    finished = true;
}

function reset() {
    points.length = 0;
    stats.discontinuities = 0;
    stats.y_turns = 0;
    stats.deviationAreas = 0;
    stats.x_turns = 0;
    stats.offByCurrent = 0;
    stats.oob = 0;
    stats.startFails = 0;

    number_of_points = 0;

    leftGreen = false;
    rightGreen = false;
    pointerX = -1;
    pointerY = -1;

    finished = false;
    started = false;

    rerender();

    cg.clear();
}

function main() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    let isTouchDevice = 'ontouchstart' in document.documentElement;

    if (isTouchDevice) {
        canvas.addEventListener("touchstart", (e) => {
            let x = normalizeX(e.touches[0].clientX),
                y = normalizeX(e.touches[0].clientY);
            pointerdown(x, y);
            e.preventDefault();
        }, false);

        canvas.addEventListener("touchmove", (e) => {
            let touch = e.touches[0] || e.changedTouches[0];
            let x = normalizeX(touch.clientX),
                y = normalizeX(touch.clientY);

            // If the touch is in bounds, then accept it; otherwise, mark it as out of bounds (OOB)
            if (_isInBounds(touch))
                pointermove(x, y);
            else
                pointerleave();

            e.preventDefault();
        }, false);

        function _isInBounds(touch) {
            let c = canvas.getBoundingClientRect();
            let { left, right, top, bottom } = c;
            var touchX = touch.pageX,
                touchY = touch.pageY;

            return (touchX > left && touchX < right && touchY > top && touchY < bottom);
        };
        canvas.addEventListener("touchend", (e) => {
            pointerup();
            e.preventDefault();
        }, false);
        canvas.addEventListener("touchcancel", (e) => {
            pointerup();
            e.preventDefault();
        }, false);
    } else {
        canvas.addEventListener("pointerdown", (e) => {
            let x = normalizeX(e.clientX),
                y = normalizeY(e.clientY);
            pointerdown(x, y);
        });

        canvas.addEventListener("pointermove", (e) => {
            let x = normalizeX(e.clientX),
                y = normalizeY(e.clientY);
            pointermove(x, y);
        });
        canvas.addEventListener("pointerup", (e) => {
            pointerup();
        });
        // Only call the pointerleave method if our pointer is down (in other words, pointerX !== -1)
        canvas.addEventListener("pointerleave", (e) => { console.log(pointerX, pointerX !== -1); if (pointerX !== -1) pointerleave(); })
    }

    document.getElementById("dl-stats-csv").addEventListener("click", (e) => {
        let x = "";
        function a(b) {
            x += b + "\n";
        }

        a("Trial #,Discontinuities,Vertical Reverses, Deviation Area,Turns,Off-By-" + deviationThreshold + ",Out of Bounds, Start Fails, Elapsed Time (s)");
        let i = 0;
        for (; i < historical_stats.length; i++) {
            a(`${i + 1},${historical_stats[i].join(",")}`);
        }
        a([
            i + 1,
            stats.discontinuities,
            stats.y_turns,
            stats.deviationAreas,
            stats.x_turns,
            stats.offByCurrent,
            stats.oob,
            stats.startFails,
            ((Date.now() - startTime) / 1000).toFixed(2)
        ].join(","));
        downloadFile("text/csv", x);
    });
    document.getElementById("dl-stats-json").addEventListener("click", (e) => {
        let x = "";
        function a(b) {
            x += b + "\n";
        }

        downloadFile("text/json", JSON.stringify(
            {
                "discontinuities": stats.discontinuities,
                "reverses": stats.y_turns,
                "deviation_areas": stats.deviationAreas,
                "turns": stats.x_turns,
                "offByThreshold": deviationThreshold,
                "offBy": stats.offByCurrent,
                "outOfBounds": stats.oob
            }
        ));
    });
    document.getElementById("dl-csv").addEventListener("click", (e) => {
        let x = "";
        function a(b) {
            x += b + "\n";
        }

        a("type,x,y");
        let moving = false;
        for (let i = 0; i < points.length; i++) {
            let type = "";
            if (!moving) {
                type = "start";
            } else {
                if (points[i] < 0) { type = "end"; moving = false; }
                else type = "move";
            }
            a(`${type},${points[i] >>> 16 & 0x7FFF},${points[i] & 0xFFFF}`);
            moving = true;
        }
        downloadFile("text/csv", x);
    });

    document.getElementById("dl-json").addEventListener("click", (e) => {
        let touches = [];
        let currentTouch = {
            start: [],
            points: [],
            end: []
        };
        touches.push(currentTouch);
        let moving = false;
        for (let i = 0; i < points.length; i++) {
            let type = "";
            let x = points[i] & 0xFFFF;
            let y = points[i] >>> 16 & 0x7FFF;
            if (!moving) {
                type = "start";
                currentTouch.start = [x, y];
            } else {
                if (points[i] < 0) {
                    type = "end";
                    currentTouch.end = [x, y];

                    // create a new one
                    currentTouch = {
                        start: [],
                        points: [],
                        end: []
                    };
                    touches.push(currentTouch);
                } else {
                    type = "move";
                    currentTouch.points.push([x, y]);
                }
            }
            moving = true;
        }
        downloadFile("text/json", JSON.stringify(touches.filter((v) => v.start.length !== 0)));
    });

    document.getElementById("reset").addEventListener("click", () => {
        // Save old stats, but don't save them if we've double-clicked on the reset button
        if ((stats.discontinuities |
            stats.deviationAreas |
            stats.offByCurrent |
            stats.oob |
            stats.y_turns |
            stats.startFails |
            stats.x_turns) !== 0) {
            historical_stats.push([
                stats.discontinuities,
                stats.y_turns,
                stats.deviationAreas,
                stats.x_turns,
                stats.offByCurrent,
                stats.oob,
                stats.startFails,
                ((Date.now() - startTime) / 1000).toFixed(2)
            ]);
            console.log(historical_stats);
        }
        reset();
    });

    document.getElementById("new-patient").addEventListener("click", () => {
        $("#exampleModalCenter").modal("show");
    });

    document.getElementById("set-patient-name").addEventListener("click", () => {
        // This function is called when the "OK" button on the set patient name/ID dialog is clicked. 
        // I'm not exactly sure on what to do here. 
        patientName = document.getElementById("patient-name").value;
        patientID = document.getElementById("patient-id").value;

        historical_stats = [];
    });

    let testTypeList = [
        new HorizontalTest(),
        new DiagonalTest1(),
        new DiagonalTest2(),
        new VerticalTest()
    ];

    let testTypeElement = document.getElementById("test-type");
    testTypeElement.addEventListener("change", () => {
        let v = parseInt(testTypeElement.value);
        changeTest(testTypeList[v]);
    });
    changeTest(testTypeList[parseInt(testTypeElement.value)])


    /** @type {HTMLInputElement} */
    let offbySel = document.getElementById("offby-sel");
    offbySel.addEventListener("change", () => {
        deviationThreshold = parseInt(offbySel.value) | 0;
        // This is called when the user changes the off-by slider to a different value, e.g. off-by-20 to off-by-15. 
        recalculateOffBy();
    });
    deviationThreshold = parseInt(offbySel.value) | 0;

    let texts = ["Deviation Area (pixels<sup>2</sup>)",
        "Average deviation area (pixels/point)"];
    let dev_sel = document.getElementById("dev-sel");
    let status = 1;
    dev_sel.innerHTML = texts[status];
    dev_sel.addEventListener("click", (e) => {
        dev_sel.innerHTML = texts[status ^= 1];
        update_darea();
    });

    // so we can have access to the status variable 
    update_darea = () => {
        let val = 0;
        if (status === 0) {
            val = stats.deviationAreas;
        } else {
            if (number_of_points === 0) val = 0;
            else val = (stats.deviationAreas / number_of_points).toFixed(2);
        }
        document.getElementById("darea").innerHTML = val;
    }

    let texts_y_turn = ["Average turn height", "Maximum turn height", "Minimum turn height"];
    let y_turn_status = 0;
    let y_sel = document.getElementById("y-sel");
    y_sel.innerHTML = texts_y_turn[y_turn_status];
    y_sel.addEventListener("click", (e) => {
        y_turn_status++;
        if (y_turn_status === 3) y_turn_status = 0;
        y_sel.innerHTML = texts_y_turn[y_turn_status];
        update_y_func();
    });

    update_y_func = () => {
        let val = 0;
        switch (y_turn_status) {
            case 0: {
                let sum = 0;
                for (let i = 0; i < yTurns.length; i++) sum += yTurns[i];
                if (yTurns.length === 0) { val = 0; } else { val = (sum / yTurns.length).toFixed(2); }
                break;
            }
            case 1: val = Math.max.apply(null, yTurns); break;
            case 2: val = Math.min.apply(null, yTurns); break;
        }

        document.getElementById("yturns").innerHTML = val;
    };

    rerender();
}

/**
 * Returns today's date.
 */
function date() {
    let date = new Date();

    return `${date.getFullYear()}.${date.getMonth()}.${date.getDate()}_${date.getHours()}${date.getMinutes()}`;
}

function downloadFile(mime, text) {
    let extension = mime === "text/csv" ? ".csv" : ".json";
    let filename;
    if (patientName !== null)
        filename = `${patientName.replace(/ /g, "_")}_${patientID}_${date()}`;
    else
        filename = `data_${date()}`;
    filename += extension;


    let element = document.createElement('a');
    element.setAttribute('href', `data:${mime};charset=utf-8,${encodeURIComponent(text)}`);
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

window.onload = () => main();