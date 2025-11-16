/**
 * Mario Maze Game - Vanilla TypeScript Implementation
 * Migrated from Angular to vanilla TS for better performance and simplicity
 */

export interface GameSprite {
  id: number;
  type: 'collectible' | 'player';
  name: string;
  assetUrl: string;
  audioUrl: string | null;
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

export interface MazeData {
  meta: {
    moves: number;
    points: number;
    collectibles?: number;
  };
  rows: number[];
  blocks: BlockMeta[];
}

export class MarioMazeGame {
  private rows = 10;
  private columns = 10;
  private cellSize = 52;
  private lastKeyPressed = '';
  private gameStatus: 'pending' | 'playing' | 'ended' = 'pending';
  private audioEl: HTMLAudioElement | null = null;

  private mazeData: MazeData = {
    meta: {
      moves: 0,
      points: 0,
    },
    rows: [],
    blocks: [],
  };

  private gameSprites: GameSprite[] = [
    {
      id: 0,
      type: 'player',
      name: 'Mario',
      assetUrl: '/smb/m.png',
      audioUrl: null,
      points: 0
    },
    {
      id: 1,
      type: 'collectible',
      name: 'Coin',
      assetUrl: '/smb/mcoin.png',
      audioUrl: '/smb/smb_coin.wav',
      points: 1
    },
    {
      id: 2,
      type: 'collectible',
      name: 'Red Mushroom',
      assetUrl: '/smb/shroom-red.png',
      audioUrl: '/smb/smb_power_up.mp3',
      points: 2
    },
    {
      id: 3,
      type: 'collectible',
      name: 'Green Mushroom',
      assetUrl: '/smb/shroom-green.png',
      audioUrl: '/smb/smb_1up.wav',
      points: 3
    },
  ];

  constructor(private container: HTMLElement) {
    this.setupKeyboardListeners();
  }

  public init(): void {
    this.getInput();
    this.initMaze();
    this.render();
  }

  private getInput(): void {
    const min = 4;
    const max = 40;
    const input = prompt(`Maze Board Size (>=${min} && <=${max})`);
    this.columns = Number(input);

    if (!this.columns || this.columns < min || this.columns > max) {
      this.getInput();
      return;
    }
    this.rows = this.columns;
  }

  private initMaze(): void {
    for (let r = 1; r <= this.rows; r++) {
      this.mazeData.rows.push(r);
      for (let c = 1; c <= this.rows; c++) {
        const block: BlockMeta = {
          id: r * c,
          uid: 'r' + r + 'c' + c,
          row: r,
          column: c,
          traversed: 0,
          element: null
        };
        this.mazeData.blocks.push(block);
      }
    }
    this.generateRandomSprites();
    this.placePlayer();
  }

  private getRandomBlock(): number {
    const randomBlock = this.mazeData.blocks[~~(this.mazeData.blocks.length * Math.random())];
    const idxPlayer: string = 'r' + String(~~(this.rows / 2)) + 'c' + String(~~(this.columns / 2));

    if (randomBlock.element || randomBlock.uid === idxPlayer) {
      return this.getRandomBlock();
    }
    return this.mazeData.blocks.findIndex(e => e.uid === randomBlock.uid);
  }

  private generateRandomSprites(): void {
    const max = this.rows > this.columns ? this.columns : this.rows;
    for (let i = 0; i < max; i++) {
      switch (i) {
        case 0:
          this.mazeData.blocks[this.getRandomBlock()].element =
            this.gameSprites[this.gameSprites.findIndex(e => e.name === 'Red Mushroom')];
          break;
        case 1:
          this.mazeData.blocks[this.getRandomBlock()].element =
            this.gameSprites[this.gameSprites.findIndex(e => e.name === 'Green Mushroom')];
          break;
        default:
          this.mazeData.blocks[this.getRandomBlock()].element =
            this.gameSprites[this.gameSprites.findIndex(e => e.name === 'Coin')];
          break;
      }
    }
  }

  private placePlayer(): void {
    const idxPlayer: string = 'r' + String(~~(this.rows / 2)) + 'c' + String(~~(this.columns / 2));
    this.mazeData.blocks[this.mazeData.blocks.findIndex(b => b.uid === idxPlayer)].element =
      this.gameSprites[this.gameSprites.findIndex(e => e.type === 'player')];
    this.mazeData.meta.collectibles = this.mazeData.blocks.filter(e => e.element && e.element.type === 'collectible').length;
  }

  private movePlayer(uidFrom: string, uidTo: string): void {
    console.log(uidFrom, uidTo);
    const playerBlock = this.gameSprites.find(el => el.type === 'player');
    const blockFrom = this.mazeData.blocks.find(e => e.uid === uidFrom);
    const blockTo = this.mazeData.blocks.find(e => e.uid === uidTo);

    if (!blockFrom || !blockTo || !playerBlock) return;

    if (blockTo.element && blockTo.element.id) {
      this.mazeData.meta.points += blockTo.element.points;
      this.mazeData.meta.collectibles! -= 1;
      if (blockTo.element.audioUrl) {
        const audioEl = new Audio(blockTo.element.audioUrl);
        audioEl.play();
      }
    }

    blockFrom.element = null;
    blockTo.traversed = 1;
    blockTo.element = playerBlock;
    this.mazeData.meta.moves += 1;

    this.updateUI();

    if (!this.mazeData.meta.collectibles) {
      this.bgm(true);
      this.gameStatus = 'ended';
      this.showWinMessage();
    }
  }

  private handleKeypress(key: string): void {
    if (this.gameStatus === 'ended') return;

    const playerBlock = this.mazeData.blocks.find(el => el.element && el.element.type === 'player');
    if (!playerBlock) return;

    switch (key) {
      case 'w':
      case 'ArrowUp':
        if (playerBlock.row !== 1) {
          this.movePlayer('r' + playerBlock.row + 'c' + playerBlock.column, 'r' + (playerBlock.row - 1) + 'c' + playerBlock.column);
        }
        break;
      case 's':
      case 'ArrowDown':
        if (playerBlock.row < this.rows) {
          this.movePlayer('r' + playerBlock.row + 'c' + playerBlock.column, 'r' + (playerBlock.row + 1) + 'c' + playerBlock.column);
        }
        break;
      case 'a':
      case 'ArrowLeft':
        if (playerBlock.column !== 1) {
          this.movePlayer('r' + playerBlock.row + 'c' + playerBlock.column, 'r' + (playerBlock.row) + 'c' + (playerBlock.column - 1));
        }
        break;
      case 'd':
      case 'ArrowRight':
        if (playerBlock.column < this.columns) {
          this.movePlayer('r' + playerBlock.row + 'c' + playerBlock.column, 'r' + (playerBlock.row) + 'c' + (playerBlock.column + 1));
        }
        break;
    }

    if (this.mazeData.meta.moves === 1) this.bgm();
    this.lastKeyPressed = key;
  }

  private setupKeyboardListeners(): void {
    window.addEventListener('keyup', (e: KeyboardEvent) => {
      const targetEl = e.target as Element;

      // Omit input elements
      if (['input', 'button', 'select', 'option'].includes(targetEl.tagName.toLowerCase())) {
        return;
      }

      this.handleKeypress(e.key);
    });
  }

  private bgm(end = false): void {
    if (this.audioEl) this.audioEl.pause();
    this.audioEl = new Audio(end ? '/smb/smb_stage_clear.wav' : '/smb/smb-start.mp3');
    this.audioEl.volume = 0.360;
    this.audioEl.loop = !end;
    this.audioEl.play();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="app-maze">
        <div class="app-header">
          <div class="app-logo">
            <img src="/logo.png" alt="Mario Maze" />
          </div>
          <div class="app-extras">
            <span class="extra">
              Moves: <span class="serif" id="moves-count">0</span>
            </span>
            <span class="extra">
              Points: <span class="serif" id="points-count">0</span>
            </span>
            <span class="extra">
              <a href="javascript:location.reload()">Restart Game</a>
            </span>
            <span class="extra">
              <a class="github-button" href="https://github.com/thinkdj/mario-maze" data-size="large" aria-label="Download thinkdj/mario-maze on GitHub" target="_blank">Download</a>
            </span>
          </div>
        </div>

        <div class="app-maze-game">
          <div class="app-maze-grid" id="maze-grid" style="grid-template-columns: repeat(${this.columns}, 1fr); width: ${this.columns * this.cellSize}px;">
            ${this.renderGrid()}
          </div>
          <div class="app-maze-message" id="win-message" style="display: none;">
            <h2>Congratulations!</h2>
            <span>You have completed the game in <span class="serif" id="final-moves">0</span> moves.</span>
          </div>
        </div>
      </div>
    `;
  }

  private renderGrid(): string {
    let html = '';
    for (const r of this.mazeData.rows) {
      for (const b of this.mazeData.blocks) {
        if (r === b.row) {
          const element = b.element;
          const imageHtml = element && element.assetUrl
            ? `<img src="${element.assetUrl}" class="grid-image ${element.type === 'player' && this.lastKeyPressed === 'ArrowRight' ? 'flip-horizontally' : ''}" alt="${element.type === 'player' ? '[*]' : '[$]'}" />`
            : '';
          html += `<div class="grid-block" id="${b.uid}">${imageHtml}</div>`;
        }
      }
    }
    return html;
  }

  private updateUI(): void {
    const movesEl = document.getElementById('moves-count');
    const pointsEl = document.getElementById('points-count');

    if (movesEl) movesEl.textContent = String(this.mazeData.meta.moves);
    if (pointsEl) pointsEl.textContent = String(this.mazeData.meta.points);

    // Re-render the grid to update positions
    const gridEl = document.getElementById('maze-grid');
    if (gridEl) {
      gridEl.innerHTML = this.renderGrid();
    }
  }

  private showWinMessage(): void {
    const winMessageEl = document.getElementById('win-message');
    const finalMovesEl = document.getElementById('final-moves');

    if (winMessageEl) winMessageEl.style.display = 'flex';
    if (finalMovesEl) finalMovesEl.textContent = String(this.mazeData.meta.moves);
  }
}
