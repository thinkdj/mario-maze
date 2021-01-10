# Mario Maze

### Objective

Collect all the collectibles on the game board using the minimum number of steps

*Collectible points:*

 * Coin : +1
 * Red Mushroom / Super : +2
 * Green Mushroom / 1Up : +3

### Optimizations
 * Lazy Loaded modules
 * Prefetch of game sprites and assets

### XP Enhancements
 * Original Mario sound effects and music for retro-feel
 * Mario's sprite responds to direction of motion
 * Moves count and Points always displayed on HUD

### Caveats
The code has been optimized more for readability versus for performance

```
E.g: this.gameSprites.findIndex(e => e.name === 'Red Mushroom') 
instead of fixed indexes
```

##### Development Info
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 10.1.4.
###### Development server
Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.
###### Build
Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.
###### Running unit tests
Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

