//document.addEventListener('DOMContentLoaded '//fires when the initial html document has been loaded and parsed. But it doesn't wait for css and images    )
//load is the correct thing



document.addEventListener('DOMContentLoaded', function(){//benefit of using an anonymous function
    //a function without a name is anonymous function
    //we can sepearte our scope of the game from a global scope 

const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');// this is the instance of built in canvas 2D api that holds all drawing methods and properties we need to animate our game
canvas.width = 1280;
canvas.height = 720;
let enemies = [];
let gameOver= false;
let score = 0;
const fullScreenButton = document.getElementById('fullScreenButton');//bringing JavaScript's full screen api

class InputHandler{//puts event listeners  to keyboard events and holds arrays of all active keys
    constructor(){
        this.keys = [];//array helps to add and remove key presses
        this.touchY=''; //initial startign coorodinates
        this.touchTreshold=30;//to make sure only longer swipes are detected

        window.addEventListener('keydown', e => {
            //console.log(e.key);
            if((
                e.key === 'ArrowDown' || 
                e.key ==='ArrowUp' || 
                e.key=== 'ArrowLeft' || 
                e.key === 'ArrowRight')
             && this.keys.indexOf(e.key) === -1){// this means this.key which is arrow donwn is not present in the array
                this.keys.push(e.key);
                console.log('key push activated')
            }else if (e.key ==='Enter' && gameOver)
                restartGame();
            
        });
            
            //console.log(e.key, this.keys);  
            //ES6 arrow functions don't bind their own 'this' but
            // they inherit the one from their parent scope this
            // this is called lexical scoping
        window.addEventListener('keyup', e => {
                //console.log(e.key);
                if(e.key === 'ArrowDown' ||
                        e.key ==='ArrowUp'    || 
                        e.key=== 'ArrowLeft'  || 
                        e.key === 'ArrowRight'
                     ){// this means this.key which is arrow donwn is not present in the array
                            console.log('splice activated')
                            this.keys.splice(this.keys.indexOf(e.key),1);//if key that was RELEASED was arrow down we want to remove it from htre array
                
                //splice takes 2 arguments index of key that needs to be removed
                // and how many elements starting from that index we want to remove
                //1 means to remove 1 element from tthat array
                }
               // console.log(e.key, this.keys);  
              
            });
    
        window.addEventListener('touchstart', e=> {
                //console.log(e.changedTouches[0].pageY);
                this.touchY = e.changedTouches[0].pageY;
            });
    
        window.addEventListener('touchmove', e=> {
                const swipeDistance =  e.changedTouches[0].pageY- this.touchY;
                if(swipeDistance < -this.touchTreshold && this.keys.indexOf('swipe up') === -1){//checks whether user swiped up// at the same time we want to check if swipe up is NOT in the keys array
                    this.keys.push('swipe up');
                }
                else if(swipeDistance> this.touchTreshold &&  this.keys.indexOf('swipe down') === -1 ){
                    this.keys.push('swipe down');
                    if(gameOver){restartGame();}
                }
            });
    
        window.addEventListener('touchend', e=> {
                //console.log(e.changedTouches[0].pageY);
                
                this.keys.splice(this.keys.indexOf('swipe up'), 1);
                this.keys.splice(this.keys.indexOf('swipe down'), 1);
                
            });

        
    
        
    }
}

class Player{
    //player class will react to these keys
    constructor(gameWidth, gameHeight){//player object needs to be aware of game boundaries hence we are adding width and height to it
        this.gameWidth=gameWidth;
        this.gameHeight=gameHeight;
        this.width = 200;//200px in sprite sheet
        this.height = 200;//
        this.x=10;
        this.y=this.gameHeight- this.height;
        this.image = document.getElementById('playerImage');
        this.frameX = 0;
        this.frameY = 0;
        this.speed=0;
        this.vy =0; //velocity in y axis meaning jump
        this.weight = 2;
        this.maxFrame=8;
        this.fps=20;
        this.frameTimer=0;//counts from 0 to frame interval
        this.frameInterval=1000/this.fps;//its a value of how many second each frame last
        //this.speed =Math.random()* 8;

    }
    restart(){
        this.x=100;
        this.y = this.gameHeight- this.height;
        this.maxFrame=8;
        this.frameY=0;

    }
    draw(context){
        //context.strokeStyle= 'white';
        //context.strokeRect(this.x, this.y, this.width, this.height);
        //context.beginPath();
        //context.arc(this.x+this.width/2, this.y+this.height/2, this.width/2, 0, Math.PI*2);
        //context.stroke();
        //context.fillStyle='white';
        //context.fillRect(this.x, this.y, this.width, this.height);
        context.drawImage(this.image,this.frameX  *this.width,this.frameY *this.height,this.width, this.height, this.x, this.y, this.width, this.height);
        


    }
    update(input, deltaTime, enemeies){
        //collision detections
        enemies.forEach(enemy => {
            //collision detection betn player circle hitbox and enemy circlehitbox
                const dx = (enemy.x  +enemy.width/2 -20) - (this.x+ this.width/2);// to fix collision the distance on the horizontal x axis between two center points needs to be offset by half of enemy and half of player width)

                const dy = (enemy.y+enemy.height/2) - (this.y+this.height/2  + 20);
                
                const distance = Math.sqrt(dx*dx+dy*dy);//dy is adjacent
                //dx is the horizontal triangle side
                //hypotenisu is distance
                //if distance  between center point of player circle and center point of enemy circle is less than the  radius of enemy circle then there is a collisoin
                if(distance<enemy.width/3 + this.width/3){
                    gameOver=true;
                }

        });
        // //sprite animating
        if(this.frameTimer> this.frameInterval){
            if(this.frameX >= this.maxFrame)this.frameX=0;
            else this.frameX++;
            this.frameTimer=0;
        }
        else{
            this.frameTimer+=deltaTime;
        }
        
        
       

        //controls
        if((input.keys.indexOf('ArrowRight') > -1) ){
            this.speed =5;
        }else if(input.keys.indexOf('ArrowLeft') > -1){
            this.speed=-5;
        }
        else if((input.keys.indexOf('ArrowUp') > -1 || input.keys.indexOf('swipe up')  > -1) && this.onGround() ){
           this.vy-=32;
            
        }   
        else{
            //this.vy=0;
            this.speed=0;
           
        }


        //horizontal movement

        this.x+=this.speed;

        if(this.x< 0){
            this.x=0;
        }
        else if (this.x > (this.gameWidth - this.width)){
            this.x = this.gameWidth -this.width;
        }
        //vertical movement
        this.y+= this.vy;
        if(!this.onGround()){//if player is in the air
            this.vy+=this.weight;
            this.maxFrame=5
            //this.vy+=this.weight;
            this.frameY=1;//changes animation of dog


        }else{
            this.vy=0;
            this.maxFrame=8;
            this.frameY=0;
        }
        if(this.y > (this.gameHeight-this.height)){
            this.y=(this.gameHeight-this.height);
        }
    }
    onGround(){
        return this.y >= this.gameHeight-this.height;// if this is true
        //we know player is on ground
    }
}

class Background{
    //seperate class to handle scrolling backgrounds 
    constructor(gameWidth, gameHeight){
        this.gameWidth= gameWidth;
        this.gameHeight= gameHeight;
        this.image=document.getElementById('backgroundImage');
        this.x=0;
        this.y=0;
        this.width = 2400;
        this.height = 720;
        this.speed=7;
    }
    draw(context){
        context.drawImage(this.image, this.x, this.y,this.width, this.height);
        context.drawImage(this.image, this.x + this.width-this.speed, this.y,this.width, this.height);//drawing two images because to make animation smoother
    }
    update(){
        this.x-=this.speed;
        if(this. x<0 - this.width){
            this.x=0;
        }

    }
    restart(){
        this.x=0;
    }
}

class Enemy{
//contains enemy properties
    constructor(gameWidth, gameHeight){
        this.gameWidth=gameWidth;
        this.gameHeight= gameHeight;
        this.width=160;
        this.height=119;
        this.image= document.getElementById('enemyImage');
        this.x=this.gameWidth;
        this.y=this.gameHeight- this.height;
        this.frameX=0;
        this.frameY=0;
        this.maxFrame=5;
        
        //to time frame rate with delta time we need 3 helper variuables
        this.fps=20;
        this.frameTimer=0;//counts from 0 to frame interval
        this.frameInterval=1000/this.fps;//its a value of how many second each frame last
        this.speed =Math.random()* 8;
        this.markedForDeletion=false;

    }
    draw(context){
        //context.strokeStyle= 'white';
        //context.strokeRect(this.x, this.y, this.width, this.height);
        //context.beginPath();
        //context.arc(this.x+this.width/2 -20, this.y+this.height/2, this.width/3, 0, Math.PI*2);
        //context.stroke();
        context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height,this.x, this.y, this.width, this.height);//we call built in draw image method
    }   
    update(deltaTime){
        if(this.frameTimer> this.frameInterval){
            if(this.frameX >= this.maxFrame)this.frameX=0;
            this.frameX++;
            this.frameTimer=0;
        }
        else{
            this.frameTimer+=deltaTime;
        }
        this.x-=this.speed;
        if(this.x<0 - this.width){this.markedForDeletion=true;
        score++;
        }
    }

}


function handleEnemies(deltaTime){
    //seperate function to handle enemies,
    //like adding and removing enemies
    if(enemyTimer>enemyInterval){
        enemies.push(new Enemy(canvas.width, canvas.height));
        enemyTimer=0;
        console.log(enemies);

    }else{
        enemyTimer+= deltaTime;
    }
    
    enemies.forEach(enemy =>{
        enemy.draw(ctx);
        enemy.update(deltaTime);

    });
    enemies=enemies.filter(enemy=> !enemy.markedForDeletion);
}

function displayStatusText(context){//gonna display the score

    //display score and lives
    context.fillStyle='black';
    context.font= '40px Helvetica';
    context.fillText('Score: '+ score, 25,50)//fillText(text, x, y)
    //second one used for shadow effect
    context.fillStyle='white';
    context.font= '40px Helvetica';
    context.fillText('Score: '+ score, 27,52)//fillText(text, x, y)
    if(gameOver){
        context.textAlign = 'center';
        context.fillStyle = 'red';
        context.fillText('GAME OVER hahahah! Press Enter', (canvas.width/2 -2), (canvas.height/2 -2));
        context.fillStyle = 'black';
        context.fillText('GAME OVER hahahah! Press Enter', (canvas.width/2 ), (canvas.height/2 ));
    }
}

const input = new InputHandler();
const player = new Player(canvas.width, canvas.height);
const background = new Background(canvas.width, canvas.height); 
const enemy1 = new Enemy(canvas.width, canvas.height);

function restartGame(){
    player.restart(); 
    background.restart();
    enemies=[];
    score=0; 
    gameOver=false;
    animate(0);

     
}

function toggleFullScreen(){
        if(!document.fullscreenElement){// is  a builtin read only property on document object that turns the lement that is currently being rpesented in full screen mode, if ti's null it means full dscreen is not active
            canvas.requestFullscreen().catch(err=>{
                alert(`error, can't enable fullscreen: ${err.message}`);
            });//requestFullscreen is an asynchronous method. it returns a promise
        }else{
            document.exitFullscreen();
        }
}
fullScreenButton.addEventListener('click', toggleFullScreen);

let lastTime=0;
let enemyTimer=0;
let enemyInterval = 2000;//every thousand milisecs
let randomEnemyInterval = Math.random()* 1000+500;


function animate(timeStamp){
    //UPDATES    and draws enemeies over and over
    const deltaTime = timeStamp - lastTime;
    lastTime= timeStamp;
    ctx.clearRect(0,0, canvas.width, canvas.height);
    background.draw(ctx);
    background.update();
    player.draw(ctx);
    player.update(input, deltaTime, enemies);//adding enemies as parameter for collision detections
    handleEnemies(deltaTime);
    //enemy1.draw(ctx);
    //enemy1.update();
    //
    displayStatusText(ctx);
    if(!gameOver){ requestAnimationFrame(animate);}
   
}
animate(0);

});