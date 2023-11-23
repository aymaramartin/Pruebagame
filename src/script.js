var config= {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics:{
        default:'arcade',
        arcade:{
            gravity:{y:300},
            debug: false
        }
    },
    scene: {
        preload:preload, //todo lo que carga ante de iniciar el juego
        create:create, // añadir objetos plataformas, fondos.. 
        update:update // movimientos del jugador 
    }
};
//declaramos variables para sumar puntos
var score= 0;
var scoreText;
var gameOver= false;
var game= new Phaser.Game(config);

//cargamos las imagenes 
function preload (){
    this.load.image('sky','assets/sky.png');
    this.load.image('ground','assets/platform.png');
    this.load.image('star','assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude','assets/dude.png',{frameWidth:32 , frameHeight:48}); //fotograma
    this.load.audio('gamemusic', 'music/gamemusic.mp3');
    this.load.audio('gameover', 'music/gameover.mp3');
    this.load.audio('jump', 'music/jump.mp3');
    this.load.audio('star1', 'music/star1.mp3');
 }
    

var platforms;
//creamos todos los objetos que van a interactuar en el juego
function create (){

    //sonidos
    gamemusic= this.sound.add('gamemusic');
    gameover= this.sound.add('gameover');
    jump = this.sound.add('jump');
    star1= this.sound.add('star1');

    this.add.image(400,300, 'sky'); // nuestro mundo (fondo del juego)

    platforms = this.physics.add.staticGroup();

    platforms.create(400,568, 'ground').setScale(2).refreshBody(); //escalamos para que ocupe todo el "piso" y le decimos que vuelva a cargar con refrehs

    platforms.create(600,400, 'ground');
    platforms.create(50,250, 'ground');
    platforms.create(600,200, 'ground'); 

    // creamos a nuestro player 1

    player= this.physics.add.sprite(100,450,'dude');  
    
    player.setBounce(0.2); //velocidad de caida simula un pequeño salto
    player.setCollideWorldBounds(true); // que el jugador haga contacto con las plataformas
     
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });
    
    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });
    
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    }); 

    this.physics.add.collider(player, platforms);

   cursors = this.input.keyboard.createCursorKeys(); 

    //definimos el objeto de estrellas
    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: {x:12, y:0, stepX: 70}
    });
    // los grupos de estrellas se dispersan aletoriamente
    stars.children.iterate(function(child){
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    })

    this.physics.add.collider(stars, platforms) //que posiciones sobre las plataformas
    this.physics.add.overlap(player, stars, collectStar, null, true); // simula que el jugador recoger las estrellas

    scoreText= this.add.text(16,16,'Score: 0', {fontSize:'32px', fill:'#000'});
    
    bombs = this.physics.add.group(); //creamos el grupo de bombas

    this.physics.add.collider(bombs, platforms);

    this.physics.add.collider(player, bombs, hitBomb, null, this);
 }

function update (){

    if (gameOver){
        return
    }

if (cursors.left.isDown)
{
    player.setVelocityX(-160);

    player.anims.play('left', true);
}
else if (cursors.right.isDown)
{
    player.setVelocityX(160);

    player.anims.play('right', true);
}
else
{
    player.setVelocityX(0);

    player.anims.play('turn');
}

if (cursors.up.isDown && player.body.touching.down)
{
    player.setVelocityY(-330);

    jump.play();
}

}

function collectStar(player, star){
    star.disableBody(true, true);

    score+= 10;
    scoreText.setText('Score:' + score);

    star1.play();

    if(stars.countActive(true)=== 0){
        stars.children.iterate(function(child){
            child.enableBody(true, child.x,0, true, true);
        });

    var x = (player.x < 400) ? Phaser.Math.Between(400,800): Phaser.Math.Between(0,400);

    var bomb = bombs.create(x,16,'bomb');

    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200,200), 20);
 }
}

function hitBomb(player, bomb){
    this.physics.pause();
    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver= true;
}