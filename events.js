var canvas = document.getElementById('screen');

canvasResize();

window.onresize = canvasResize;
canvas.addEventListener('mousedown', onClick);
canvas.addEventListener('wheel', onScroll, {passive:true});
canvas.addEventListener("mouseup", onRelease);
canvas.addEventListener('mouseleave', onMouseLeave);
canvas.addEventListener('mousemove', onMouseMove);
document.addEventListener('keydown', (event) => {
    const keyName = event.key;
    switch(keyName){
        case 'Control':
            return;
        case 'm':
            mousemode+=1;
            if(mousemode>2){
                mousemode=0;
            }
            return;
        case 'Escape':

            return;
        case ' ':
            pause = !pause;
            return;
    }
}, false);


function onClick(event){
    mouseDownX = event.pageX;
    mouseDownY = event.pageY;
    click = true;
}

function onScroll(event){
    for(let i = 0; i<SCROLLAMT; i++){
        spawnPoint(event.pageX*SCALE, event.pageY*SCALE, 150, SCROLLAMT*15);
    }
}

function onRelease(event){
    spawnPoint(mouseDownX*SCALE, mouseDownY*SCALE, 300, 0, 
        5*SCALE*(event.pageX-mouseDownX)/Math.min(canvas.width,canvas.height),
        5*SCALE*(event.pageY-mouseDownY)/Math.min(canvas.width,canvas.height));
    click = false;
}

function onMouseMove(event){
    mouseX = event.pageX;
    mouseY = event.pageY;
}

function onMouseLeave(event){
    click = false;
}

function canvasResize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    canvW = SCALE*canvas.width;
    canvH = SCALE*canvas.height;
}