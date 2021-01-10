import { Component, OnInit, Input, Output } from '@angular/core';

@Component({
  selector: 'app-maze',
  templateUrl: './maze.component.html',
  styleUrls: ['./maze.component.scss']
})

export class MazeComponent implements OnInit {

  constructor() { }

  /* Rows and Col */
  @Input() rows = 4;
  @Input() columns = 4;
  /* Steps taken */
  @Output() steps = 0;

  /* Configurations */
  cellSize = 86; // X px * X px

  /* Internal variables */
  mazeData: any = {};

  ngOnInit(): void {
    this.rows = +(prompt('Maze Rows?'));
    this.columns = +(prompt('Maze Columns?'));
    this.initMaze();
  }

  initMaze(): void {
    this.mazeData.rows = [];
    for (let r = 1; r <= this.rows; r++) {
      for (let c = 1; c <= this.rows; c++) {
        this.mazeData.rows.push(c);
      }
    }
  }


}
