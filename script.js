//DAY1 AND DAY 2 FUNTIONALITY
document.addEventListener('DOMContentLoaded', function () {
    // Initially hide day2 events
    document.querySelectorAll('.timeline__event.day2').forEach(event => {
        event.classList.add('hidden');
    });
});

function showDay(day) {
    // Hide all events
    document.querySelectorAll('.timeline__event').forEach(event => {
        event.classList.add('hidden');
    });

    // Show events for the selected day
    document.querySelectorAll(`.timeline__event.${day}`).forEach(event => {
        event.classList.remove('hidden');
    });
}

//POP UP FUNCTIONALITY
function showpopup(num) {
    document.getElementById(`overlay${num}`).style.display="flex";
}

function closepopup(num) {
    document.getElementById(`overlay${num}`).style.display="none";
}


//BACKGROUND
'use strict';

// shim creates 2d context
const c = a.getContext("2d");

// constants (will be auto replace in minified)
const WIDTH = 1366;
const HEIGHT = 720;

const TYPE_Explosion        = -1;
const TYPE_Bullet           = 0;
const TYPE_Player           = 1;
const TYPE_Enemy            = 3;
const TYPE_Enemy_Pawn       = 3;
const TYPE_Enemy_Scout      = 4;
const TYPE_Enemy_Fighter    = 5;
const TYPE_Enemy_Battleship = 6;
const TYPE_Enemy_Mothership = 7;
const TYPE_Enemy_Cthulhu    = 8;

// variables (remove from minified)
let i, frame, seed, globalSeed, player, spawnPool, spawnWait, wave, enemyCount, spawnCount, objects, Rand, MakeObject;

// get seeded random value between 0 and max
Rand = (max=1)=> Math.sin(++seed)**2 * 1e5 % 1 * max;

// spawn object
MakeObject =
(
    t,        // type
    x, y,     // position
    r,        // radius
    v, w,     // velocity
    e,        // team (0==player, 1==enemy)
    h=1,      // hit points
)=> {
    if (t >= TYPE_Enemy_Pawn && t <= TYPE_Enemy_Cthulhu && e && e < 2) {
        if (Rand() < 0.5) {
            return;
        }
    }objects.push({t, x, y, r, v, w, e, h, s:h});};

// init and spawn player
objects = [];
MakeObject(TYPE_Player, 0, -72, 15, 0, 0, 0); // create player

// init and spawn player
let Reset=_=>
{
    objects = [];
    MakeObject(TYPE_Player, 0, -72, 15, 0, 0, 0); // create player
    player = objects[frame = globalSeed = wave = spawnCount = enemyCount = 0];
}
Reset();
document.addEventListener('keydown', (e) => {
    if (e.key === 'r') {
        Reset();
    }
});

const gameUpdate=_=> // main game loop
{
    // update frame
    frame += enemyCount ? 1 : wave;



    // spawn new enemies
    seed = wave*spawnCount;             // set seed for this enemy spawn
    spawnCount ?                        // if enemies left to spawn
        player.y < 0 ||                 // wait for player to move (not in 1k build)
        (--spawnWait <= 0)&&                // and not waiting to spawn
            MakeObject(                                                                     // spawn enemy
                i = wave < 10 ? TYPE_Enemy + spawnPool[Rand(wave)|0] : TYPE_Player,         // enemy type
                Rand(WIDTH,--spawnCount), -72,                                              // x, y pos, decrement spawn count
                5*i + 4,                                                                    // radius
                Rand(2)-1,                                                                  // x speed
                Rand()+(i<TYPE_Enemy_Scout ? 3 : i>TYPE_Enemy_Scout & i<TYPE_Enemy_Mothership ? 2 : 1), // y speed
                wave < 10,                                                                  // team
                1 + (i-TYPE_Enemy)**2,                                                      // hitpoints
                spawnWait = wave < 10 ? (i - TYPE_Enemy + 2 )**2*5 : 9)                     // set spawn wait time
    :
    enemyCount || (spawnCount = ++wave+19, spawnWait = 200);      // go to next wave when no enemies are left

    // set canvas size and clear to black
    c.fillRect(enemyCount = 0, 0, a.width = WIDTH, a.height = HEIGHT); // clear enemy count

    // stars display
    for(i=seed=400; i--; c.fillStyle = `#fff`) 
        c.fillRect(Rand(WIDTH), Rand(frame)%HEIGHT, Rand(), Rand(5)); // starfield
   
};

let lastTimeStamp = 0;
let timeBuffer = 0;
let FPS = 120;

const loop=timeStamp=>
{
    requestAnimationFrame(loop);
  
    // fit canvas to window
    const aspect = WIDTH / HEIGHT;
    const width = aspect > innerWidth / innerHeight ? 
      innerWidth : innerHeight * aspect;
    a.style.width = width + 'px';
    
    // maintain framerate
    let delta = timeStamp - lastTimeStamp;
    lastTimeStamp = timeStamp;
    timeBuffer += delta;
    const frameDelta = 1e3 / FPS;
    if (timeBuffer > frameDelta*4)
        timeBuffer = frameDelta*4;
    while(timeBuffer > 0)
    {
        timeBuffer -= frameDelta;
        gameUpdate();
    }
}

loop(0);

