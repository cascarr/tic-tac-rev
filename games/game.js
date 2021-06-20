const NO_ONE = 0;
const PLAYER1_X = 1;
const PLAYER2_O = 2;


var game;

window. onload = function() {
    var config = {
        type: Phaser.AUTO,
        width: 610,
        height: 620,
        backgroundColor: 0X000000,
        scene: [LoadScene, GameScene],
    };

    var game = new Phaser.Game(config);
}


class LoadScene extends Phaser.Scene {
    constructor() {
        super('LoadScene');
    }

    preload() {
        this.load.image('background', 'assets/grid.jpg');
        this.load.spritesheet('cross', 'assets/cross.png', 
        {frameWidth: 200, frameHeight: 173});
        this.load.spritesheet('circle', 'assets/circle.png', 
        {frameWidth: 200, frameHeight: 173});
    }

    create() {
        this.scene.start('GameScene');
    }
}


class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        let thisClass = this;
        thisClass.gameOver = false;
        thisClass.whoToPlay = PLAYER1_X; 

        thisClass.boardArray = [];

        let emptySqrSize = 100; 
        let halfEmptySqr = emptySqrSize / 2;

        let keyOnSqr = 0;
        for (let row = 0; row < 3; row++) {
            let y = halfEmptySqr + (emptySqrSize * row) + (row * 10);

            for (let col = 0; col < 3; col++) {
                let x = halfEmptySqr + (emptySqrSize * col) + (col * 10);

                let background = thisClass.add.image(x, y, 'background');

                background.iKey = keyOnSqr++;

                background.setInteractive();
                background.on('pointerdown', thisClass.clickHandler);

                thisClass.boardArray.push({
                    spaceTaken: NO_ONE,
                    spritePlayer: null,
                });

            }
        }

        thisClass.whoIsToPlayFunc();
    }

    clickHandler(e) {
        let offset = this.iKey;
        let lord = this.scene;

        if (lord.gameOver) {
            return true;
        }

        let spaceTaken = lord.boardArray[offset].spaceTaken;

        let spritePlayer;

        if (spaceTaken == NO_ONE) {
            if (lord.whoToPlay == PLAYER1_X) {
                spritePlayer = lord.add.sprite(this.x, this.y, 'cross', 1);

                spaceTaken = PLAYER1_X;
                //console.log(spaceTaken);
            } else if (lord.whoToPlay == PLAYER2_O){
                spritePlayer = lord.add.sprite(this.x, this.y, 'circle', 0);

                spaceTaken = PLAYER2_O;
                console.log(spaceTaken);
            }

            lord.boardArray[offset].spaceTaken = spaceTaken;

            lord.boardArray[offset].spritePlayer = spritePlayer;
            lord.checkWinner(lord.whoToPlay);

            if (lord.whoToPlay == PLAYER1_X) {
                lord.whoToPlay = PLAYER2_O;
            } else {
                lord.whoToPlay = PLAYER1_X;
            }
        }

        lord.whoIsToPlayFunc();
    }

    whoIsToPlayFunc() {
        let x = this.game.config.width / 2;
        let y = this.game.config.height / 2;

        let turn;
        if (this.whoToPlay == PLAYER1_X) {
            turn = 'PLAYER 1X';
        } else if (this.whoToPlay == PLAYER2_O) {
            turn = 'PLAYER 2_O';
        }

        let label = this.add.text(x, y, turn, 
            { fontSize: '72px Arial', fill: '#F00' });
        label.setOrigin(0.5, 0.5);

        this.tweens.add({
            targets: label,
            alpha: 0,
            ease: 'Power1',
            duration: 3000,
        });
    }

    checkWinner(playerID) {
        let possibleWins = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 4, 8],
            [2, 4, 6],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8]
        ];

        for (let line = 0; line < possibleWins.length; line++) {
            let winAxis = possibleWins[line];

            if ((this.boardArray[winAxis[0]].spaceTaken == playerID) && 
                (this.boardArray[winAxis[1]].spaceTaken == playerID) && 
                (this.boardArray[winAxis[2]].spaceTaken == playerID)) {
                    this.broadcastWinner(playerID, winAxis);
                    return true;
            } 
                
        }

        let movesLeft = false;
        for (let n = 0; n < this.boardArray.length; n++) {
            if (this.boardArray[n].spaceTaken == NO_ONE) {
                movesLeft = true;
            }
        }

        if (!movesLeft) {
            this.broadcastWinner(NO_ONE);
        }

        return false;
    }

    broadcastWinner(playerID, winAxis) {
        this.gameOver = true;
        this.tweens.killAll();

        let x = this.game.config.width / 2;
        let y = this.game.config.height / 2;

        let turn;

        if (playerID == PLAYER1_X) {
            turn = 'Congratulations ' + PLAYER1_X + ' WON!';
        } else if (playerID == PLAYER2_O) {
            turn = 'Congratulations ' + PLAYER2_O + ' WON!';
        } else {
            turn = 'It is a tie!'
        }

        let label = this.add.text(x, y, turn, 
            { fontSize: '104px Arial', fill: '#00F', backgroundColor: '#00F' });
        label.setOrigin(0.5, 0.5);

        label.setInteractive();

        label.on('pointerdown', function() {
            this.scene.start('PlayGameScene');
        }, this);

        label = this.add.text(x, y, turn, 
            { fontSize: '104px Arial', fill: '#0F0' });
        label.setOrigin(0.5, 0.5);

        this.tweens.add({
            targets: label,
            alpha: 0,
            ease: 'Power1',
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        if (playerID != NO_ONE) {
            for (let n = 0; n < winAxis.length; n++) {
                let sprite = this.boardArray[winAxis[n]].spritePlayer;

                this.tweens.add({
                    targets: sprite,
                    angle: 360,
                    ease: 'None',
                    duration: 1000,
                    repeat: -1
                });
            }
        }

    }

} // close GameScene