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

export interface Position {
  row: number;
  column: number;
  uid: string;
}

export interface PathSegment {
  from: Position;
  to: Position;
}

export interface MazeData {
  meta: {
    moves: number;
    points: number;
    collectibles?: number;
    basePoints?: number;
    efficiencyBonus?: number;
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

  // Path tracking
  private playerPath: Position[] = [];
  private collectiblePositions: Position[] = [];
  private optimalPath: Position[] = [];
  private optimalMoves = 0;

  private mazeData: MazeData = {
    meta: {
      moves: 0,
      points: 0,
      basePoints: 0,
      efficiencyBonus: 0,
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
    const playerBlockIndex = this.mazeData.blocks.findIndex(b => b.uid === idxPlayer);
    const playerBlock = this.mazeData.blocks[playerBlockIndex];

    playerBlock.element = this.gameSprites[this.gameSprites.findIndex(e => e.type === 'player')];
    this.mazeData.meta.collectibles = this.mazeData.blocks.filter(e => e.element && e.element.type === 'collectible').length;

    // Store initial player position
    this.playerPath = [{
      row: playerBlock.row,
      column: playerBlock.column,
      uid: playerBlock.uid
    }];

    // Store all collectible positions for optimal path calculation
    this.collectiblePositions = this.mazeData.blocks
      .filter(b => b.element && b.element.type === 'collectible')
      .map(b => ({
        row: b.row,
        column: b.column,
        uid: b.uid
      }));

    // Calculate optimal path
    this.calculateOptimalPath();
  }

  private movePlayer(uidFrom: string, uidTo: string): void {
    console.log(uidFrom, uidTo);
    const playerBlock = this.gameSprites.find(el => el.type === 'player');
    const blockFrom = this.mazeData.blocks.find(e => e.uid === uidFrom);
    const blockTo = this.mazeData.blocks.find(e => e.uid === uidTo);

    if (!blockFrom || !blockTo || !playerBlock) return;

    // Track player path
    this.playerPath.push({
      row: blockTo.row,
      column: blockTo.column,
      uid: blockTo.uid
    });

    if (blockTo.element && blockTo.element.id) {
      this.mazeData.meta.basePoints! += blockTo.element.points;
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
      this.calculateFinalScore();
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

  // BFS to find shortest path between two positions
  private findShortestPath(from: Position, to: Position): number {
    const queue: { pos: Position; dist: number }[] = [{ pos: from, dist: 0 }];
    const visited = new Set<string>();
    visited.add(from.uid);

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.pos.uid === to.uid) {
        return current.dist;
      }

      // Check all 4 directions
      const neighbors = [
        { row: current.pos.row - 1, column: current.pos.column }, // up
        { row: current.pos.row + 1, column: current.pos.column }, // down
        { row: current.pos.row, column: current.pos.column - 1 }, // left
        { row: current.pos.row, column: current.pos.column + 1 }, // right
      ];

      for (const neighbor of neighbors) {
        if (neighbor.row < 1 || neighbor.row > this.rows ||
            neighbor.column < 1 || neighbor.column > this.columns) {
          continue;
        }

        const uid = 'r' + neighbor.row + 'c' + neighbor.column;
        if (!visited.has(uid)) {
          visited.add(uid);
          queue.push({
            pos: { row: neighbor.row, column: neighbor.column, uid },
            dist: current.dist + 1
          });
        }
      }
    }

    return Infinity;
  }

  // TSP solver using dynamic programming (for small number of collectibles)
  private calculateOptimalPath(): void {
    if (this.collectiblePositions.length === 0) return;

    const startPos = this.playerPath[0];
    const n = this.collectiblePositions.length;

    // For larger grids, use nearest neighbor heuristic
    if (n > 10) {
      this.calculateOptimalPathGreedy(startPos);
      return;
    }

    // Build distance matrix
    const allPositions = [startPos, ...this.collectiblePositions];
    const dist: number[][] = Array(n + 1).fill(0).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= n; i++) {
      for (let j = 0; j <= n; j++) {
        if (i !== j) {
          dist[i][j] = this.findShortestPath(allPositions[i], allPositions[j]);
        }
      }
    }

    // DP for TSP
    const dp: number[][] = Array(1 << n).fill(0).map(() => Array(n).fill(Infinity));
    const parent: number[][] = Array(1 << n).fill(0).map(() => Array(n).fill(-1));

    // Base case: starting from position 0 (player start), visiting each collectible
    for (let i = 0; i < n; i++) {
      dp[1 << i][i] = dist[0][i + 1];
    }

    // Fill DP table
    for (let mask = 0; mask < (1 << n); mask++) {
      for (let last = 0; last < n; last++) {
        if (!(mask & (1 << last))) continue;
        if (dp[mask][last] === Infinity) continue;

        for (let next = 0; next < n; next++) {
          if (mask & (1 << next)) continue;

          const newMask = mask | (1 << next);
          const newDist = dp[mask][last] + dist[last + 1][next + 1];

          if (newDist < dp[newMask][next]) {
            dp[newMask][next] = newDist;
            parent[newMask][next] = last;
          }
        }
      }
    }

    // Find the best ending position
    const fullMask = (1 << n) - 1;
    let minDist = Infinity;
    let lastPos = -1;

    for (let i = 0; i < n; i++) {
      if (dp[fullMask][i] < minDist) {
        minDist = dp[fullMask][i];
        lastPos = i;
      }
    }

    // Reconstruct path
    const visitOrder: number[] = [];
    let mask = fullMask;
    let curr = lastPos;

    while (curr !== -1) {
      visitOrder.push(curr);
      const prev = parent[mask][curr];
      mask ^= (1 << curr);
      curr = prev;
    }

    visitOrder.reverse();

    // Build the actual path with all positions
    this.optimalPath = [startPos];
    let currentPos = startPos;

    for (const idx of visitOrder) {
      const targetPos = this.collectiblePositions[idx];
      const pathSegment = this.reconstructPath(currentPos, targetPos);
      this.optimalPath.push(...pathSegment.slice(1)); // Skip first as it's already in path
      currentPos = targetPos;
    }

    this.optimalMoves = this.optimalPath.length - 1;
  }

  // Greedy nearest neighbor for larger grids
  private calculateOptimalPathGreedy(startPos: Position): void {
    this.optimalPath = [startPos];
    const remaining = [...this.collectiblePositions];
    let currentPos = startPos;
    let totalMoves = 0;

    while (remaining.length > 0) {
      let nearest = 0;
      let minDist = Infinity;

      for (let i = 0; i < remaining.length; i++) {
        const dist = this.findShortestPath(currentPos, remaining[i]);
        if (dist < minDist) {
          minDist = dist;
          nearest = i;
        }
      }

      const nextPos = remaining[nearest];
      const pathSegment = this.reconstructPath(currentPos, nextPos);
      this.optimalPath.push(...pathSegment.slice(1));
      totalMoves += pathSegment.length - 1;

      currentPos = nextPos;
      remaining.splice(nearest, 1);
    }

    this.optimalMoves = totalMoves;
  }

  // Reconstruct actual path between two positions
  private reconstructPath(from: Position, to: Position): Position[] {
    const queue: { pos: Position; path: Position[] }[] = [{ pos: from, path: [from] }];
    const visited = new Set<string>();
    visited.add(from.uid);

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.pos.uid === to.uid) {
        return current.path;
      }

      const neighbors = [
        { row: current.pos.row - 1, column: current.pos.column },
        { row: current.pos.row + 1, column: current.pos.column },
        { row: current.pos.row, column: current.pos.column - 1 },
        { row: current.pos.row, column: current.pos.column + 1 },
      ];

      for (const neighbor of neighbors) {
        if (neighbor.row < 1 || neighbor.row > this.rows ||
            neighbor.column < 1 || neighbor.column > this.columns) {
          continue;
        }

        const uid = 'r' + neighbor.row + 'c' + neighbor.column;
        if (!visited.has(uid)) {
          visited.add(uid);
          const newPos = { row: neighbor.row, column: neighbor.column, uid };
          queue.push({
            pos: newPos,
            path: [...current.path, newPos]
          });
        }
      }
    }

    return [from, to];
  }

  private calculateFinalScore(): void {
    const userMoves = this.mazeData.meta.moves;
    const basePoints = this.mazeData.meta.basePoints!;

    // Calculate efficiency ratio
    const efficiency = this.optimalMoves / userMoves;

    // Award bonus points based on efficiency
    // 100% efficiency = 2x base points bonus
    // 50% efficiency = no bonus
    let efficiencyBonus = 0;

    if (efficiency >= 1.0) {
      // Perfect or better (shouldn't happen but just in case)
      efficiencyBonus = basePoints * 2;
    } else if (efficiency >= 0.9) {
      efficiencyBonus = Math.floor(basePoints * 1.5);
    } else if (efficiency >= 0.75) {
      efficiencyBonus = Math.floor(basePoints * 1.0);
    } else if (efficiency >= 0.6) {
      efficiencyBonus = Math.floor(basePoints * 0.5);
    } else if (efficiency >= 0.5) {
      efficiencyBonus = Math.floor(basePoints * 0.25);
    }

    this.mazeData.meta.efficiencyBonus = efficiencyBonus;
    this.mazeData.meta.points = basePoints + efficiencyBonus;
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
            <h2>🎉 Congratulations!</h2>

            <div class="stats-container">
              <div class="stat-row">
                <span class="stat-label">Your Moves:</span>
                <span class="stat-value serif" id="final-moves">0</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Optimal Moves:</span>
                <span class="stat-value serif" id="optimal-moves">0</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Efficiency:</span>
                <span class="stat-value serif" id="efficiency-percent">0%</span>
              </div>
            </div>

            <div class="scoring-container">
              <h3>Score Breakdown</h3>
              <div class="stat-row">
                <span class="stat-label">Base Points:</span>
                <span class="stat-value serif" id="base-points">0</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Efficiency Bonus:</span>
                <span class="stat-value serif bonus" id="efficiency-bonus">0</span>
              </div>
              <div class="stat-row total">
                <span class="stat-label">Total Points:</span>
                <span class="stat-value serif" id="total-points">0</span>
              </div>
            </div>

            <div class="path-controls">
              <h3>View Paths</h3>
              <button id="toggle-user-path" class="path-btn user-path-btn">Your Path</button>
              <button id="toggle-optimal-path" class="path-btn optimal-path-btn">Optimal Path</button>
            </div>

            <div class="restart-section">
              <a href="javascript:location.reload()" class="restart-btn">Play Again</a>
            </div>
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
    const optimalMovesEl = document.getElementById('optimal-moves');
    const basePointsEl = document.getElementById('base-points');
    const efficiencyBonusEl = document.getElementById('efficiency-bonus');
    const totalPointsEl = document.getElementById('total-points');
    const efficiencyPercentEl = document.getElementById('efficiency-percent');

    if (winMessageEl) winMessageEl.style.display = 'flex';
    if (finalMovesEl) finalMovesEl.textContent = String(this.mazeData.meta.moves);
    if (optimalMovesEl) optimalMovesEl.textContent = String(this.optimalMoves);
    if (basePointsEl) basePointsEl.textContent = String(this.mazeData.meta.basePoints);
    if (efficiencyBonusEl) efficiencyBonusEl.textContent = String(this.mazeData.meta.efficiencyBonus);
    if (totalPointsEl) totalPointsEl.textContent = String(this.mazeData.meta.points);

    const efficiency = ((this.optimalMoves / this.mazeData.meta.moves) * 100).toFixed(1);
    if (efficiencyPercentEl) efficiencyPercentEl.textContent = efficiency + '%';

    // Draw paths on the grid
    this.visualizePaths();
  }

  private visualizePaths(): void {
    // Clear any existing path visualizations
    document.querySelectorAll('.path-marker').forEach(el => el.remove());

    const showUserPath = () => {
      this.drawPath(this.playerPath, 'user-path');
    };

    const showOptimalPath = () => {
      this.drawPath(this.optimalPath, 'optimal-path');
    };

    // Set up toggle buttons
    const userPathBtn = document.getElementById('toggle-user-path');
    const optimalPathBtn = document.getElementById('toggle-optimal-path');

    if (userPathBtn) {
      userPathBtn.addEventListener('click', () => {
        userPathBtn.classList.toggle('active');
        if (userPathBtn.classList.contains('active')) {
          showUserPath();
        } else {
          document.querySelectorAll('.user-path').forEach(el => el.remove());
        }
      });
    }

    if (optimalPathBtn) {
      optimalPathBtn.addEventListener('click', () => {
        optimalPathBtn.classList.toggle('active');
        if (optimalPathBtn.classList.contains('active')) {
          showOptimalPath();
        } else {
          document.querySelectorAll('.optimal-path').forEach(el => el.remove());
        }
      });
    }

    // Show user path by default
    showUserPath();
    if (userPathBtn) userPathBtn.classList.add('active');
  }

  private drawPath(path: Position[], className: string): void {
    // Remove existing markers of this type
    document.querySelectorAll('.' + className).forEach(el => el.remove());

    for (let i = 0; i < path.length - 1; i++) {
      const from = path[i];
      const to = path[i + 1];

      const fromBlock = document.getElementById(from.uid);
      if (!fromBlock) continue;

      // Determine direction
      let direction = '';
      if (to.row < from.row) direction = 'up';
      else if (to.row > from.row) direction = 'down';
      else if (to.column < from.column) direction = 'left';
      else if (to.column > from.column) direction = 'right';

      // Add arrow marker
      const marker = document.createElement('div');
      marker.className = `path-marker ${className} arrow-${direction}`;
      marker.textContent = this.getArrowSymbol(direction);
      fromBlock.appendChild(marker);
    }
  }

  private getArrowSymbol(direction: string): string {
    const arrows: { [key: string]: string } = {
      'up': '↑',
      'down': '↓',
      'left': '←',
      'right': '→'
    };
    return arrows[direction] || '';
  }
}
