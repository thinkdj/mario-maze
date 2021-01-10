import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { MazeComponent } from './maze/maze.component';

const routes: Routes = [
  { path: '', component: MazeComponent, data: { title: '', breadcrumb: '' } }
];

@NgModule({
  declarations: [
    MazeComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    MazeComponent,
    RouterModule
  ]
})

export class MazeModule { }
