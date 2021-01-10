import { Component, OnInit, Input, Output } from '@angular/core';

export interface GameSprite {
  id: number;
  type: 'collectible' | 'player';
  name: string;
  assetUrl: string;
  audioUrl: string;
  points: number;
}

export interface BlockMeta {
  id: number;
  row: number;
  column: number;
  uid: string;
  traversed: number;
  element: null | GameSprite;
}

@Component({
  selector: 'app-maze',
  templateUrl: './maze.component.html',
  styleUrls: ['./maze.component.scss']
})

export class MazeComponent implements OnInit {

  constructor() { }

  /* Rows and Cols */
  @Input() rows = 10;
  @Input() columns = 10;

  /* Configurations */
  cellSize = 52; // X px * X px

  /* Internal variables */
  lastKeyPressed = '';
  gameStatus: 'pending'|'playing'|'ended' = 'pending';
  mazeData: any = {
    meta: {
      moves: 0,
      points: 0,
    },
    rows: [],
    blocks: [],
  };

  gameSprites: GameSprite[] = [
    {
      id: 0,
      type: 'player',
      name: 'Mario',
      assetUrl: 'assets/smb/m.png',
      audioUrl: null,
      points: 0
    },
    {
      id: 1,
      type: 'collectible',
      name: 'Coin',
      assetUrl: 'assets/smb/mcoin.png',
      audioUrl: 'assets/smb/smb_coin.wav',
      points: 1
    },
    {
      id: 2,
      type: 'collectible',
      name: 'Red Mushroom',
      assetUrl: 'assets/smb/shroom-red.png',
      audioUrl: 'assets/smb/smb_power_up.mp3',
      points: 2
    },
    {
      id: 3,
      type: 'collectible',
      name: 'Green Mushroom',
      assetUrl: 'assets/smb/shroom-green.png',
      audioUrl: 'assets/smb/smb_1up.wav',
      points: 3
    },
  ];

  ngOnInit(): void {
    this.getInput();
    this.initMaze();
  }

  // Using JS prompt for input to avoid the overhead of a UI library / Modal system just for this
  getInput(): void {
    const min = 4;
    const max = 40;
    this.columns = +(prompt(`Maze Board Size (>=${min} && <=${max})`));
    // this.rows = +(prompt('Maze Rows (>2)'));
    if (!this.columns || this.columns < min || this.columns > max ) { this.getInput(); }
    this.rows = this.columns;
  }
  initMaze(): void {
    for (let r = 1; r <= this.rows; r++) {
      this.mazeData.rows.push(r);
      for (let c = 1; c <= this.rows; c++) {
        const block: BlockMeta = {
          id: r * c,
          uid: 'r' + r + 'c' + c,
          row: r,
          column: c,
          traversed : 0,
          element: null
        };
        this.mazeData.blocks.push(block);
      }
    }
    this.generateRandomSprites();
    this.placePlayer();
  }

  getRandomBlock(): number {
    // "~~" for a closest "int"
    // tslint:disable-next-line:no-bitwise
    const randomId = this.mazeData.blocks[~~(this.mazeData.blocks.length * Math.random())].id;
    return this.mazeData.blocks.findIndex( e => e.id === randomId );
  }

  generateRandomSprites(): void {
    const max = this.rows > this.columns ? this.columns : this.rows;
    for (let i = 0; i < max; i++) {
      switch (i) {
        case 0 : this.mazeData.blocks[ this.getRandomBlock() ].element = this.gameSprites[this.gameSprites.findIndex(e => e.name === 'Red Mushroom')];
                 break;
        case 1: this.mazeData.blocks[ this.getRandomBlock() ].element = this.gameSprites[this.gameSprites.findIndex(e => e.name === 'Green Mushroom')];
                break;
        default: this.mazeData.blocks[ this.getRandomBlock() ].element = this.gameSprites[this.gameSprites.findIndex(e => e.name === 'Coin')];
                 break;
      }
    }
  }

  placePlayer(): void {
    const idx: string = 'r' + String(~~(this.rows / 2)) + 'c' + String(~~(this.columns / 2));
    this.mazeData.blocks[ this.mazeData.blocks.findIndex(b => b.uid === idx) ].element =
      this.gameSprites[this.gameSprites.findIndex(e => e.type === 'player')];
    this.mazeData.meta.collectibles = this.mazeData.blocks.filter( e => e.element && e.element.type === 'collectible').length;
  }
  movePlayer(uidFrom, uidTo): void {
    console.log(uidFrom,uidTo);
    const playerBlock = this.gameSprites.find( el => el.type === 'player' );
    let blockFrom = this.mazeData.blocks.find( e => e.uid === uidFrom );
    let blockTo = this.mazeData.blocks.find( e => e.uid === uidTo );
    /* To block has some sprite */
    if (blockTo.element && blockTo.element.id) {
      this.mazeData.meta.points += blockTo.element.points;
      this.mazeData.meta.collectibles -= 1;
      if (blockTo.element.audioUrl) {
        const audioEl = new Audio(blockTo.element.audioUrl);
        audioEl.play();
      }
    }
    blockFrom.element = null;
    blockTo.traversed = 1;
    blockTo.element = playerBlock;
    this.mazeData.meta.moves += 1;
    if (!this.mazeData.meta.collectibles) {
      this.bgm(true);
      this.gameStatus = 'ended';
    }
  }

  handleKeypress(key): void {
    if ('ended' === this.gameStatus) return;
    const playerBlock = this.mazeData.blocks.find( el => el.element && el.element.type === 'player' );
    switch (key) {
      case 'w':
      case 'ArrowUp':
        (playerBlock.row === 1) ? this.noop() :
        this.movePlayer('r' + playerBlock.row + 'c' + playerBlock.column, 'r' + (playerBlock.row - 1) + 'c' + playerBlock.column );
        break;
      case 's':
      case 'ArrowDown':
        ( playerBlock.row >= this.rows) ? this.noop() :
          this.movePlayer('r' + playerBlock.row + 'c' + playerBlock.column, 'r' + (playerBlock.row + 1) + 'c' + playerBlock.column );
        break;
      case 'a':
      case 'ArrowLeft':
        (playerBlock.column === 1) ? this.noop() :
          this.movePlayer('r' + playerBlock.row + 'c' + playerBlock.column, 'r' + (playerBlock.row) + 'c' + (playerBlock.column - 1) );
        break;
      case 'd':
      case 'ArrowRight':
        (playerBlock.column >= this.columns) ? this.noop() :
          this.movePlayer('r' + playerBlock.row + 'c' + playerBlock.column, 'r' + (playerBlock.row) + 'c' + (playerBlock.column + 1) );
        break;
    }
    if(1 === this.mazeData.meta.moves) this.bgm();
    this.lastKeyPressed = key;
  }

  /* No Operation */
  noop(): void { }
  /* Start the music */
  audioEl = null;
  bgm(end = false): void {
    this.audioEl ? this.audioEl.pause() : this.noop();
    this.audioEl = new Audio(end ? 'assets/smb/smb_stage_clear.wav' : 'assets/smb/smb-start.mp3');
    this.audioEl.volume = 0.360;
    this.audioEl.loop = !end;
    this.audioEl.play();
  }


}
