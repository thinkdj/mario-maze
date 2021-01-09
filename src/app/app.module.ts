import { NgModule } from '@angular/core';

/* Core module */
import { CoreModule } from './core/core.module';

/* Shared across modules */
import { SharedModule } from './shared/shared.module';

/* Maze game */
import { MazeModule } from './maze/maze.module';

/* Common */
import { AppComponent } from './app.component';
import { RouterModule, Routes } from '@angular/router';
import { MazeComponent } from './maze/maze/maze.component';


const routes: Routes = [
  // Shell
  { path: '', component: AppComponent, data: { title: '', breadcrumb: '' },
    // App
    children: [
      { path: '', component: MazeComponent, data: { title: '', breadcrumb: '' } }
    ]
  },
];

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    CoreModule,
    SharedModule,
    RouterModule.forRoot(routes),
    MazeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule { }
