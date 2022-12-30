console.log('Flappy Bird em Javascript!');

let frames = 0;
let highscore = 0;
let medal = 3;
const HIT_SOUND = new Audio();
HIT_SOUND.src = './assets/audio/hit.wav';

const FLIGHT_SOUND = new Audio();
FLIGHT_SOUND.src = './assets/audio/flight.wav';

const POINT_SOUND = new Audio();
POINT_SOUND.src = './assets/audio/point.wav';

const sprites = new Image();
sprites.src = './assets/img/sprites.png';

const canvas = document.querySelector('canvas');
const canvasContext = canvas.getContext('2d');
const global = {};

function createGround() {
    const ground = {
        spriteSrcX: 0,
        spriteSrcY: 610,
        spriteCanvasX: 0,
        spriteCanvasY: canvas.height - 112,
        spriteWidth: 224,
        spriteHeight: 112,
        update() {
            const groundMovement = 1;
            const repeating = ground.spriteWidth / 2;
            const move = ground.spriteCanvasX - groundMovement;

            // console.log('[ground x]', ground.spriteCanvasX);
            // console.log('[repeating]', repeating);
            // console.log('[move]', move % repeating);

            ground.spriteCanvasX = move % repeating;
        },
        draw() {
            canvasContext.drawImage(
                sprites,
                ground.spriteSrcX, ground.spriteSrcY,
                ground.spriteWidth, ground.spriteHeight,
                ground.spriteCanvasX, ground.spriteCanvasY,
                ground.spriteWidth, ground.spriteHeight
            );

            canvasContext.drawImage(
                sprites,
                ground.spriteSrcX, ground.spriteSrcY,
                ground.spriteWidth, ground.spriteHeight,
                ground.spriteCanvasX + ground.spriteWidth, ground.spriteCanvasY,
                ground.spriteWidth, ground.spriteHeight
            );
        }
    };

    return ground;
}

function createPipes() {
    const pipes = {
        spriteWidth: 52,
        spriteHeight: 400,
        bottom: {
            spriteSrcX: 0,
            spriteSrcY: 169,
        },
        top: {
            spriteSrcX: 52,
            spriteSrcY: 169
        },
        space: 80,
        draw() {
            pipes.pairs.forEach(function (pair) {
                const yRandom = pair.y;
                const spaceBetweenPipes = 90;

                // Top pipe
                const topPipeX = pair.x;
                const topPipeY = yRandom;
                canvasContext.drawImage(
                    sprites,
                    pipes.top.spriteSrcX, pipes.top.spriteSrcY,
                    pipes.spriteWidth, pipes.spriteHeight,
                    topPipeX, topPipeY,
                    pipes.spriteWidth, pipes.spriteHeight
                );

                // Bottom pipe
                const bottomPipeX = pair.x;
                const bottomPipeY = pipes.spriteHeight + spaceBetweenPipes + yRandom;
                canvasContext.drawImage(
                    sprites,
                    pipes.bottom.spriteSrcX, pipes.bottom.spriteSrcY,
                    pipes.spriteWidth, pipes.spriteHeight,
                    bottomPipeX, bottomPipeY,
                    pipes.spriteWidth, pipes.spriteHeight
                );

                pair.topPipe = {
                    x: topPipeX,
                    y: pipes.spriteHeight + topPipeY,
                };

                pair.bottomPipe = {
                    x: bottomPipeX,
                    y: bottomPipeY,
                };
            });
        },
        flappyBirdCollision(pair) {
            const flappyBirdHead = global.flappyBird.spriteCanvasY;
            const flappyBirdBelly = global.flappyBird.spriteCanvasY + global.flappyBird.spriteHeight;

            if (global.flappyBird.spriteCanvasX + global.flappyBird.spriteWidth >= pair.x
                && global.flappyBird.spriteCanvasX <= pair.x + pipes.spriteWidth) {
                if (flappyBirdHead <= pair.topPipe.y) {
                    return true;
                }

                if (flappyBirdBelly >= pair.bottomPipe.y) {
                    return true;
                }
            }
            return false;
        },
        scored(pair) {
            const flappyBirdCenter = global.flappyBird.spriteCanvasX + (global.flappyBird.spriteWidth / 2);
            if (flappyBirdCenter >= pair.x && flappyBirdCenter <= pair.x + 1) {
                return true;
            }
            return false;
        },
        pairs: [],
        update() {
            const passed100Frames = frames % 100 === 0;
            if (passed100Frames) {
                pipes.pairs.push(
                    {
                        x: canvas.width,
                        y: -150 * (Math.random() + 1),
                    },
                )
            }

            pipes.pairs.forEach(function (pair) {
                pair.x = pair.x - 2;

                if (pipes.flappyBirdCollision(pair)) {
                    HIT_SOUND.play();
                    changeScreen(Screens.GAME_OVER);
                }

                if (pipes.scored(pair)) {
                    POINT_SOUND.play();
                    pipes.score++;
                }

                if (pair.x + pipes.spriteWidth <= 0) {
                    pipes.pairs.shift();
                }
            });

            const percentageScore = (pipes.score * 100) / highscore;
            if (pipes.score >= highscore) {
                highscore = pipes.score;
                if(highscore == 0){
                    medal = 0;
                } else {
                    medal = 3;
                }
            } else {
                if (percentageScore <= 20) {
                    medal = 0;
                } else if (percentageScore > 20 && percentageScore <= 50) {
                    medal = 1;
                } else {
                    medal = 2;
                }
            }
        },
        score: 0,
        drawScoreboard() {
            canvasContext.font = '40px "VT323"';
            canvasContext.textAlign = 'right';
            canvasContext.fillStyle = 'white';
            canvasContext.fillText(`${pipes.score}`, canvas.width - 15, 45);
        },
    };

    return pipes;
}

const background = {
    spriteSrcX: 390,
    spriteSrcY: 0,
    spriteCanvasX: 0,
    spriteCanvasY: canvas.height - 204,
    spriteWidth: 275,
    spriteHeight: 204,
    draw() {
        canvasContext.fillStyle = '#70C5CE';
        canvasContext.fillRect(0, 0, canvas.width, canvas.height)

        canvasContext.drawImage(
            sprites,
            background.spriteSrcX, background.spriteSrcY,
            background.spriteWidth, background.spriteHeight,
            background.spriteCanvasX, background.spriteCanvasY,
            background.spriteWidth, background.spriteHeight
        );

        canvasContext.drawImage(
            sprites,
            background.spriteSrcX, background.spriteSrcY,
            background.spriteWidth, background.spriteHeight,
            background.spriteCanvasX + background.spriteWidth, background.spriteCanvasY,
            background.spriteWidth, background.spriteHeight
        );
    }
};

function groundCollision(flappyBird, ground) {
    const flappyBirdY = flappyBird.spriteCanvasY + flappyBird.spriteHeight;
    const groundY = ground.spriteCanvasY;

    if (flappyBirdY >= groundY) {
        return true;
    }

    return false;
}

function createFlappyBird() {
    const flappyBird = {
        spriteCanvasX: 100,
        spriteCanvasY: 210,
        spriteWidth: 34,
        spriteHeight: 24,
        gravity: 0.25,
        speed: 0,
        flight: 4,
        update() {
            if (groundCollision(flappyBird, global.ground)) {
                HIT_SOUND.play();
                changeScreen(Screens.GAME_OVER);
                return;
            }
            flappyBird.speed += flappyBird.gravity;
            flappyBird.spriteCanvasY += flappyBird.speed;
        },
        movements: [
            { spriteSrcX: 0, spriteSrcY: 0 }, // wing up
            { spriteSrcX: 0, spriteSrcY: 26 }, // wing middle
            { spriteSrcX: 0, spriteSrcY: 52 }, // wing down
            { spriteSrcX: 0, spriteSrcY: 26 }, // wing middle
        ],
        currentFrame: 0,
        updateCurrentFrame() {
            const framesInterval = 10;
            const passedFramesInterval = frames % framesInterval === 0;

            if (passedFramesInterval) {
                const incrementBase = 1;
                const increment = incrementBase + flappyBird.currentFrame;
                const repeatBase = flappyBird.movements.length;
                flappyBird.currentFrame = increment % repeatBase;
            }
        },
        draw() {
            if (activeScreen === Screens.GAME || activeScreen === Screens.START) {
                flappyBird.updateCurrentFrame();
            }
            const { spriteSrcX, spriteSrcY } = flappyBird.movements[flappyBird.currentFrame];
            canvasContext.drawImage(
                sprites,
                spriteSrcX, spriteSrcY,
                flappyBird.spriteWidth, flappyBird.spriteHeight,
                flappyBird.spriteCanvasX, flappyBird.spriteCanvasY,
                flappyBird.spriteWidth, flappyBird.spriteHeight
            );
        },
        fly() {
            flappyBird.spriteCanvasY -= flappyBird.flight;
            flappyBird.speed = -flappyBird.flight;
        }
    };

    return flappyBird;
};

const title = {
    spriteSrcX: 134,
    spriteSrcY: 0,
    spriteCanvasX: (canvas.width / 2) - (174 / 2),
    spriteCanvasY: 100,
    spriteWidth: 174,
    spriteHeight: 152,
    draw() {
        canvasContext.drawImage(
            sprites,
            title.spriteSrcX, title.spriteSrcY,
            title.spriteWidth, title.spriteHeight,
            title.spriteCanvasX, title.spriteCanvasY,
            title.spriteWidth, title.spriteHeight
        );
    }
};

const gameOver = {
    spriteSrcX: 134,
    spriteSrcY: 153,
    spriteCanvasX: (canvas.width / 2) - (226 / 2),
    spriteCanvasY: 100,
    spriteWidth: 226,
    spriteHeight: 200,
    spriteMedalCanvasX: 73,
    spriteMedalCanvasY: 186,
    spriteMedalWidth: 44,
    spriteMedalHeight: 44,
    medals: [
        { spriteMedalSrcX: 0, spriteMedalSrcY: 78 }, // iron medal
        { spriteMedalSrcX: 48, spriteMedalSrcY: 124 }, // bronze medal
        { spriteMedalSrcX: 48, spriteMedalSrcY: 78 }, // silver medal
        { spriteMedalSrcX: 0, spriteMedalSrcY: 124 }, // gold medal
    ],
    draw() {
        canvasContext.drawImage(
            sprites,
            gameOver.spriteSrcX, gameOver.spriteSrcY,
            gameOver.spriteWidth, gameOver.spriteHeight,
            gameOver.spriteCanvasX, gameOver.spriteCanvasY,
            gameOver.spriteWidth, gameOver.spriteHeight
        );

        const { spriteMedalSrcX, spriteMedalSrcY } = gameOver.medals[medal];
        canvasContext.drawImage(
            sprites,
            spriteMedalSrcX, spriteMedalSrcY,
            gameOver.spriteMedalWidth, gameOver.spriteMedalHeight,
            gameOver.spriteMedalCanvasX, gameOver.spriteMedalCanvasY,
            gameOver.spriteMedalWidth, gameOver.spriteMedalHeight
        );

        canvasContext.font = '30px "VT323"';
        canvasContext.textAlign = 'right';
        canvasContext.fillStyle = '#D7A84C';
        canvasContext.fillText(`${global.pipes.score}`, canvas.width - 67, 197);

        canvasContext.font = '30px "VT323"';
        canvasContext.textAlign = 'right';
        canvasContext.fillStyle = '#D7A84C';
        canvasContext.fillText(`${highscore}`, canvas.width - 67, 239);
    }
};

let activeScreen = {};
function changeScreen(newScreen) {
    activeScreen = newScreen;
    if (activeScreen.starting) {
        activeScreen.starting();
    }
}

const Screens = {
    START: {
        starting() {
            global.flappyBird = createFlappyBird();
            global.ground = createGround();
            global.pipes = createPipes();
        },
        draw() {
            background.draw();
            global.ground.draw();
            global.flappyBird.draw();
            title.draw();
        },
        click() {
            changeScreen(Screens.GAME);
        },
        update() {
            global.ground.update();
        }
    },

    GAME: {
        draw() {
            background.draw();
            global.pipes.draw();
            global.ground.draw();
            global.flappyBird.draw();
            global.pipes.drawScoreboard();
        },
        click() {
            global.flappyBird.fly();
            FLIGHT_SOUND.play();
        },
        update() {
            global.flappyBird.update();
            global.ground.update();
            global.pipes.update();
        }
    },

    GAME_OVER: {
        draw() {
            background.draw();
            global.pipes.draw();
            global.ground.draw();
            global.flappyBird.draw();
            gameOver.draw();
        },
        click() {
            changeScreen(Screens.START);
        },
        update() {

        }
    }
};

function loop() {
    activeScreen.draw();
    activeScreen.update();

    frames++;
    requestAnimationFrame(loop);
};

window.addEventListener('keydown', (event) => {
    if (activeScreen.click && event.key == ' ') {
        activeScreen.click();
    }
});
changeScreen(Screens.START);
loop();