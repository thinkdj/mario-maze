import { MarioMazeGame } from './game';
import './styles.css';

// Initialize the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('app');

  if (appContainer) {
    const game = new MarioMazeGame(appContainer);
    game.init();
  } else {
    console.error('App container not found!');
  }
});
