import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeypressDirective } from './keypress/keypress.directive';

@NgModule({
  declarations: [
    KeypressDirective,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    KeypressDirective,
  ]
})

export class SharedModule { }
