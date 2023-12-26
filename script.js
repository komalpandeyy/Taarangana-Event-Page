
document.addEventListener('DOMContentLoaded', function () {
    // Initially hide all events
    document.querySelectorAll('.timeline__event').forEach(event => {
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



'use strict';

// shim creates 2d context
const c = a.getContext("2d");

// constants (will be auto replace in minified)
const WIDTH = 1360;
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
        // Limit the number of pink enemies (adjust the threshold as needed)
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

    // player shoot
    frame%9 || player.r && enemyCount && MakeObject(TYPE_Bullet, player.x, player.y, 19, Math.sin(frame*frame)/3, -7, 0);
    
    // create sorted list of enemy types for this wave
    seed = wave*wave;                               // set seed
    spawnPool = [];                                 // clear spawn pool
    for(i=wave; i--;                                // how many enemy types at once
        spawnPool.push(Rand(Math.min(6, wave))|0))  // max enemy type
    {
        onmousemove = e=>   // set mouse move here to save space
        {
            // movement control
            let rect = a.getBoundingClientRect();
            player.x = WIDTH * (e.x - rect.left) / rect.width;
            player.y = HEIGHT * (e.y - rect.top) / rect.height;

            player.x = Math.max(0, Math.min(WIDTH, player.x));
            player.y = Math.max(0, Math.min(HEIGHT, player.y));
        }
    }

    // spawn new enemies
    seed = wave*spawnCount;             // set seed for this enemy spawn
    spawnCount ?                        // if enemies left to spawn
        player.y < 0 ||                 // wait for player to move (not in 1k build)
        --spawnWait ||                  // and not waiting to spawn
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
    //c.font = '6em"';c.fillText(wave, 9, HEIGHT-9);  // HUD

    // update objects
    objects.map(o=>
    {
        // update physics
        o.x += o.v;
        o.y += o.w;

        // set global seed
        seed = ++globalSeed;

        if (o.t > TYPE_Player) // enemy update
        {
            // increment enemy count
            ++enemyCount;

            // enemy shoot
            o.t > TYPE_Enemy_Pawn &                                   // check if shooty enemy
                Rand(99) < 1 && MakeObject(                           // spawn bullet
                    o.t < TYPE_Enemy_Mothership? TYPE_Bullet : o.t-5, // projectile type
                    o.x, o.y, o.r/3,                                  // position, size
                    o.t > TYPE_Enemy_Scout? 2*Math.sin(frame) : 0,    // x speed
                    o.t &1? 2*Math.sin(frame+11) : 3,                 // y speed
                    31                                                // team ( projectile color)
                );
            
            // extra motion
            o.t & 1 ? 0 : o.v += Math.sin(frame/30)/30;
            
            // bottom wrap
            if (o.y > HEIGHT+100 & o.e < 2) // only for big enemies
            {
                // move to top
                o.y = -72;
                o.x = Rand(WIDTH);

                // restore health
                o.h = o.s;
            }
        }

        // draw object
        for(i = o.t > TYPE_Bullet ? 16 : 1; i--;
        
            // draw the object
            c.beginPath(c.fill(
                o.t > 0 ?  c.ellipse(                                       // is complex type?
                    o.x + o.r*(Rand(2)-1)*(i%2*2-1),                        // x pos with reflection
                    o.y + o.r*(Rand(2)-1),                                  // y pos
                    Rand(o.r), Rand(o.r/3),                                 // width, height
                    (Rand(9) + Math.sin((frame+o.x+o.y)/30)/3)*(i%2*2-1),   // angle & animation
                    0, 9)                                                   // full ellipse angles
                :
                // simple shape (bullet or explosion), make player have thin bullets
                c.ellipse(o.x, o.y, o.e ? o.r : 5, o.r, 0, 0, 9)
             ))
        )
        {
            // set seed for this iteration
            seed = (i/2+9|0)*o.t*9;

            // set color
            c.fillStyle = `hsl(${o.e*(160+o.t*89+o.r)+61+Rand(99)+99*o.h/o.s} 128%${50+(i>>1)*9}%`;
        }

        o.t < TYPE_Bullet ? --o.r :                    // make explosions get smaller over time
            o.e || objects.map( p=>                    // remove dead objects
                o.t != p.t &                           // not same type (prevent projectile collisons)
                Math.hypot(o.x-p.x, o.y-p.y) < p.r*2 & // overlapping
                p.e &&                                 // is enemy
                MakeObject(TYPE_Explosion, o.x, o.y, 25, 0, o.r = 0, 4, --p.h     // bullet hit effect, damage enemy
                || MakeObject(TYPE_Explosion, p.x, p.y, p.r*2, 0, p.r = 0, 2 ))   // make explosion, kill enemy
            );
        //c.beginPath(c.strokeStyle='red',c.arc(o.x,o.y,o.r,0,9),c.stroke()); // show hit box
    });

    // show title until mouse is moved (not in 1k build)
    // for(i=9; player.y<0 && i--;)
    // {
    //     c.font='8em"';c.textAlign='center';c.lineWidth=6;
    //     c.strokeStyle=`hsl(${frame+i*29} 100%${50}%`;c.fillStyle=`#000`;
    //     let x = WIDTH/2+Math.sin(frame/30+i*Math.PI+i)*i*2;
    //     let y = 200+Math.cos(frame/30+i*Math.PI+i*i)*i*2;
    //     c.fillText('バタフライコ',x,y);
    //     c.strokeText('バタフライコ',x,y);
    // }

    // remove dead or off screen objects
    objects = objects.filter(o=>o.r > 0 & Math.hypot(o.x-WIDTH/2, o.y-HEIGHT) < WIDTH);
   // console.log(objects.length);
};

let lastTimeStamp = 0;
let timeBuffer = 0;
let FPS = 120;

const loop=timeStamp=>
{
    requestAnimationFrame(loop);
  
    // enhance, hide cursor when player is alive
    a.style.cursor = player.r ? 'none' : '';
  
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


