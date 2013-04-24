/**************************************************************************

       program : life.js
   description : The classic conway's game of life implementation with nodejs.
       version : 0.0.1
        author : gxy
     copyright : free
   repositorie : git@github.com:guoxiangyang/lifeOfNode.git
   last update : 2013-4-24

usage :

node life <daysOfLife> <maxX> <maxY> <maxZ> <Interval> <random rate> <printStep>

  <daysOfLife> : how many days to run, 0 = infinity
     <maxXYZ>> : the dimension of the world, z is no use now.
    <Interval> : the interval of each day in ms
 <random rate> : 0-1
   <printStep> : how many step life will print the world.


When world is larget than screen, you can move the window across the world.

control keys: 
             i : up
             k : down
             j : left
             l : right
             - : zoom out
             + : zoom in
         C - c : exit

**************************************************************************/
'use strict';

if (process.argv.length !== 9) {
    console.log('Usage : node life <daysOfLife> <max X> <max Y> <max Z> <Interval> <random rate> <printStep>');
    console.log('');
    console.log("Let's try: node life 0 39 160 1 40 0.5 1");
    process.exit();
}

var world         = [[], []];
var worldActivate = [];

var daysOfLife = parseInt(process.argv[2], 10);
var worldY     = parseInt(process.argv[3], 10);
var worldX     = parseInt(process.argv[4], 10);
var worldZ     = parseInt(process.argv[5], 10);
var interval   = parseInt(process.argv[6], 10);
var randomRate = parseFloat(process.argv[7]);
var printStep  = parseInt(process.argv[8], 10);

var curSide    = 0;
var otherSide  = 1;
var lifeCnt    = 0;
var daysCnt    = 0;
var cmdInput   = [];
var winWidth   = 159;
var winHeight  = 39;
var windowRect = {left   : 0,
                  top    : 0,
                  width  : winWidth,
                  height : winHeight,
                  zIndex : 0};
var printStepCount = 0;
var lastDayTime = 0;

var everyDayCount  = [];

console.log('\u0033[2J');

function printWorld() {
    var x, y, fromX, fromY, toX, toY, zIndex, outStr;
    printStepCount = (printStepCount + 1) % printStep;
    if (printStepCount !== 0) {
	    return;
    }
    fromX  = Math.max(windowRect.left, 0);
    fromY  = Math.max(windowRect.top,  0);
    toX    = Math.min(windowRect.width  + windowRect.left, worldX);
    toY    = Math.min(windowRect.height + windowRect.top,  worldY);
    zIndex = windowRect.zIndex;

    //var outStr = '\033[2J[';
    outStr = '\u0033[0;0H[';   //\033[y;xH 
    for (y = fromY; y < toY; y = y + 1) {
	    for (x = fromX; x < toX; x = x + 1) {
	        if (world[curSide][zIndex][x][y] === 1) {
		        outStr = outStr + '*';
	        } else {
		        outStr = outStr + ' ';
	        }
	    }
	    outStr += ']\n[';
    }
    //outStr=outStr.substring(0, outStr.length - 2);
    outStr.replace(/..$/, '');
    console.log(outStr);
    console.log('The %dth day: cost %dms. %d beings alive ... [x=%d y=%d z=%d] cmd:%s '+JSON.stringify(windowRect), 
		        daysCnt, lastDayTime, lifeCnt, worldX, worldY, worldZ);
}

function initWorld() {
    var t1, t2, x, y, z, side, i;
    t1 = new Date();
    world[0].length = worldX;
    world[1].length = worldX;
    for (side = 0; side < 2; side = side + 1) {
	    for (z = 0; z < worldZ; z = z + 1) {
	        world[side][z] = [];
	        for (x = 0; x < worldX; x = x + 1) {
		        world[side][z].push([]);
		        for (y = 0; y < worldY; y = y + 1) {
		            i = Math.random() > randomRate ? 1 : 0;
		            lifeCnt += i;
		            world[side][z][x].push(i);
		        }
	        }
	    }
    }
    t2 = new Date();
    console.log('init: %dms', t2.getTime() - t1.getTime());
    printWorld();
}

function runOneDay() {
    var  x, y, z, xL, xR, yU, yD, neighbours, dayCnt;
    lifeCnt = 0;
    for (z = 0; z < worldZ; z = z + 1) {
	    for (x = 0; x < worldX; x = x + 1) {
	        for (y = 0; y < worldY; y = y + 1) {
		        xL = (x + worldX - 1) % worldX;   // left  1 column
		        xR = (x + 1) % worldX;          // right 1 column
		        yU = (y + worldY - 1) % worldY;   // upper 1 column
		        yD = (y + 1) % worldY;          // down  1 column
		        neighbours =
                    world[curSide][z][xL][y]
		            + world[curSide][z][xR][y]
		            + world[curSide][z][x][yU]
		            + world[curSide][z][x][yD]
		            + world[curSide][z][xL][yU]
		            + world[curSide][z][xL][yD]
		            + world[curSide][z][xR][yU]
		            + world[curSide][z][xR][yD];

		        if (world[curSide][z][x][y] === 1) {
		            if (neighbours <= 1 || neighbours >= 4) {
			            world[otherSide][z][x][y] = 0;
		            } else {
			            world[otherSide][z][x][y] = 1;
			            lifeCnt = lifeCnt + 1;
		            }
		        } else {
		            if (neighbours === 3) {
			            world[otherSide][z][x][y] = 1;
			            lifeCnt = lifeCnt + 1;
		            } else {
			            world[otherSide][z][x][y] = 0;
		            }
		        }
	        }
	    }
    }
    curSide   = otherSide;
    otherSide = (curSide + 1) % 2;
    daysCnt = dayCnt + 1;
}

function run() {
    var t1, t2, len;

    if (((daysOfLife !== 0) && (daysCnt >= daysOfLife)) || (lifeCnt === 0)) {
	    console.log('\nThe final world!!!');
	    printWorld();
	    process.exit();
	    // end of program.
    }
    
    printWorld();
    t1 = new Date();
    runOneDay();
    t2 = new Date();
    lastDayTime = t2.getTime() - t1.getTime();
    everyDayCount.push({"livings": lifeCnt});
    len = everyDayCount.length - 1;
    if (len > 5) {
	    if (Math.abs((everyDayCount[len].livings - everyDayCount[len - 1].livings)) < 3
	        && Math.abs(everyDayCount[len - 1].livings - everyDayCount[len - 2].livings) < 3
	        && Math.abs(everyDayCount[len - 2].livings - everyDayCount[len - 3].livings) < 3
	        && Math.abs(everyDayCount[len - 3].livings - everyDayCount[len - 4].livings) < 3 ){
	        process.exit();
	    }
    }

    if (interval === 0) {
	    process.nextTick(run);
    } else {
	    setTimeout(run, interval);
    }
}

initWorld();

var stdin = process.stdin;
stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf8');
stdin.on('data', function (key) {
    if ( key === '\u0003' ) {  // ctrl-c ( end of text )
	    process.exit();
    } else if (key === '-') {
	    windowRect.width  = windowRect.width  - 2;
	    windowRect.height = windowRect.height - 1;
    } else if (key === '+') {
	    windowRect.width  = windowRect.width  + 2;
	    windowRect.height = windowRect.height + 1;
    } else if (key === 'j') {
	    windowRect.left = Math.max(windowRect.left - 8, 0);
    } else if (key === 'l') {
	    windowRect.left = Math.min(windowRect.left + 8, worldX - winWidth);
    } else if (key === 'i') {
	    windowRect.top = Math.max(windowRect.top - 4, 0);
    } else if (key === 'k') {
	    windowRect.top = Math.min(windowRect.top + 4, worldY - winHeight);
    }
    cmdInput.push(key);
});


run();


