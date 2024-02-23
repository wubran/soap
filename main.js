canvascolor = "rgba(19, 23, 26, 1)";
var canvas = document.getElementById('screen');
var ctx = canvas.getContext('2d');

var click = false
var mouseDownX = 0;
var mouseDownY = 0;
var mouseX = 0;
var mouseY = 0;
var pause = false;

const MASS_CONST = 5;
const DISTMAX = 30; // radius that decides what is an edge or not
const SQRTDISTMAX = Math.sqrt(2)*DISTMAX;
const DISTMAXSQRED = DISTMAX*DISTMAX;
const STEEP = 0.001;
const EQDIST = 20;
const EDGEFAC = 0.09;
const SLOWDISTSQRED = DISTMAX*DISTMAX*3*3;

var friction = 0.95;

const SCALE = 3;
var canvW = SCALE*canvas.width;
var canvH = SCALE*canvas.height;

const BORDERWIDTH = 100; //0 to 300 or so, default 125
const BORDERSTRENGTH = 0.001; //0 to 200, default 30
const BORDERSLOPE = BORDERWIDTH/BORDERSTRENGTH;

const sin23 = Math.sin(2*Math.PI/3);
const sin43 = Math.sin(4*Math.PI/3);
const cos23 = Math.cos(2*Math.PI/3);
const cos43 = Math.cos(4*Math.PI/3);

let points = [];

class Point{
    constructor(x, y, l, r, vx, vy){
        this.x = x + (Math.random()-0.5)*r;
        this.y = y + (Math.random()-0.5)*r;
        const theta = 2*Math.PI*Math.random();
        const v = 0.1*Math.random();
        this.vx = vx?vx:v*Math.cos(theta);
        this.vy = vy?vy:v*Math.sin(theta);
        this.ax = 0;
        this.ay = 0;
        this.edges = [];
        this.life = l;
        this.popChain = 0;
        this.mass = MASS_CONST;

        this.canvX = this.x/SCALE;
        this.canvY = this.y/SCALE;
    }
    calc(frametime, index){
        for(var i = index+1; i < points.length; i++){ // BOID DISTANCE CHECKING
            const that = points[i];
            const diffx = that.x-this.x;
            const diffy = that.y-this.y;
            // const absdx = Math.abs(diffx);
            // const absdy = Math.abs(diffy);
            // if(absdx>DISTMAX || absdy>DISTMAX || absdx+absdy>SQRTDISTMAX){
            //   continue;
            // }
            const distsqrd = diffx*diffx+diffy*diffy;
            if(distsqrd > DISTMAXSQRED){
                if(distsqrd < SLOWDISTSQRED){
                    // slight attraction
                    const mult = 0.005/distsqrd;
                    this.ax += diffx*mult;
                    that.ax -= diffx*mult;
                    this.ay += diffy*mult;
                    that.ay -= diffy*mult;

                    // drawEdge(this, that, "rgba(0,255,255,0.2)");
                }
                continue;
            }

            this.edges.push(that);
            that.edges.push(this);
            drawEdge(this, that, "rgba(255, 255, 0, 0.15)");

            const dist = Math.sqrt(distsqrd);
            // const mult = STEEP*(dist-EQDIST)/dist;
            const mult = 0.00001*(dist-EQDIST)*(dist+EQDIST)/dist;
      
            this.ax += diffx*mult;
            that.ax -= diffx*mult;
            this.ay += diffy*mult;
            that.ay -= diffy*mult;
        }
    }
    calcEdges(frametime, index){
        for(let i = 0; i<this.edges.length; i++){
            for(let j = i+1; j<this.edges.length; j++){
                const thi = this.edges[i];
                const tha = this.edges[j];
                const diffx = tha.x-thi.x;
                const diffy = tha.y-thi.y;

                const distsqrd = diffx*diffx+diffy*diffy;
                // const dist = Math.sqrt(diffx*diffx+diffy*diffy);
                const mult = -EDGEFAC/(distsqrd+1);
          
                thi.ax += diffx*mult;
                tha.ax -= diffx*mult;
                thi.ay += diffy*mult;
                tha.ay -= diffy*mult;

                drawEdge(thi, tha, "rgba(255,0,255,0.1)");

            }
        }
    }
    update(frametime, index){
        // update velocities and positions and life and edges
        var windx = 0;
        var windy = 0;
        if(BORDERWIDTH>=this.x){
          windx = -this.x/BORDERSLOPE+BORDERSTRENGTH;
        } else if(this.x>=canvW-BORDERWIDTH) {
          windx = -(this.x-canvW)/BORDERSLOPE-BORDERSTRENGTH;
        }
        if(BORDERWIDTH>=this.y){
          windy = -this.y/BORDERSLOPE+BORDERSTRENGTH;
        } else if(this.y>=canvH-BORDERWIDTH) {
          windy = -(this.y-canvH)/BORDERSLOPE-BORDERSTRENGTH;
        }

        this.vx += (this.ax + windx)*frametime;
        this.vy += (this.ay + windy)*frametime;
        this.vx *= friction;
        this.vy *= friction;
        this.x += this.vx*frametime;
        this.y += this.vy*frametime;
        this.canvX = this.x/SCALE;
        this.canvY = this.y/SCALE;
        this.ax = 0;
        this.ay = 0;

        this.edges = [];
    }
    updateLife(frametime, index){
        if(this.edges.length == 0){
            this.life-=Math.random()*frametime/2;
        }else if(this.edges.length == 1){
            this.life-=Math.random()*frametime/6;
        }else{
            this.life = Math.min(100, this.life+Math.random()*frametime);
        }
        this.life -= this.popChain;
        this.popChain = 0;
    }
    draw(){
        // const sinfacing = Math.sin(this.facing);
        // const cosfacing = Math.cos(this.facing);
    
        // var red = this.r * 1.3 * (sinfacing) + 180;
        // var green = this.g * 1.3 * (sinfacing*cos23+cosfacing*sin23) + 180;
        // var blue = this.b * 1.3 * (sinfacing*cos43+cosfacing*sin43) + 180;
        const SQUARESIDE = this.edges.length>3?3:1;
        const N = 0.5*SQUARESIDE/Math.sqrt(this.vx*this.vx+this.vy*this.vy);
        const red = 127+100*this.vx;
        const green = 127+100*this.vy;
        const blue = 255-2*this.life;

        var color = 'rgba('+(red)+', '+(green)+', '+(blue)+', '+1+')';
        if(this.edges.length>3){
            color = 'red';
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = SQUARESIDE;
        ctx.lineJoin = 'miter';
        ctx.beginPath();
        ctx.moveTo(this.canvX+this.vx*N+20*this.vx, this.canvY+this.vy*N+20*this.vy)
        ctx.lineTo(this.canvX-this.vx*N-20*this.vx, this.canvY-this.vy*N-20*this.vy);
        ctx.stroke();
    }
}

function spawnPoint(x, y, l=100, r=1, vx=0, vy=0){
    points.push(new Point(x, y, l, r, vx, vy));
}

function drawEdge(thi, tha, color = "white"){
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.lineJoin = 'miter';
    ctx.beginPath();
    ctx.moveTo(thi.canvX, thi.canvY);
    ctx.lineTo(tha.canvX, tha.canvY);
    ctx.stroke();
}

function fillscreen(){
    ctx.fillStyle = canvascolor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(255, 245, 80, 1)";
    ctx.font = canvas.width / 30 + "px Arial";
    if(pause){
        ctx.fillText("paused", 35*canvas.width/40, 19*canvas.height/20);
    }
    ctx.fillText("points: "+points.length, 32*canvas.width/40, 1*canvas.height/20);
}

let oldTime = 0;
let death = false;
const tpf = 8; // bigger --> smaller timesteps
const timeFac = 2; // bigger --> faster (and bigger timesteps)
function loop(timestamp){
    for(let tick = 0; tick < tpf; tick++){
        const tickT = timeFac * (timestamp - oldTime)/tpf;
        if(!pause){

            for(var i = 0; i < points.length; i++){
                points[i].calc(tickT, i);
                
            }
            for(var i = 0; i < points.length; i++){
                points[i].calcEdges(tickT, i);
                
            }
            for(var i = 0; i < points.length; i++){
                points[i].updateLife(tickT, i);
            }
            if(tick == 0){
                fillscreen();
                for(var i = 0; i < points.length; i++){
                    points[i].draw();
                }
            }
            for(var i = 0; i < points.length; i++){
                if(death && points[i].life <= 0){
                    for(let each of points[i].edges){
                        each.popChain = 95;
                    }
                    points.splice(i, 1);
                    i++;
                }else{
                    points[i].update(tickT, i);
                }
            }
        }
    }

    oldTime = timestamp;
    requestAnimationFrame(loop)
}

requestAnimationFrame(loop);