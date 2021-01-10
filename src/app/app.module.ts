import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

/* Core module */
import { CoreModule } from './core/core.module';

/* Shared across modules */
import { SharedModule } from './shared/shared.module';

/* Maze game */
import { MazeModule } from './maze/maze.module';

/* Common */
import { AppComponent } from './app.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  // Shell
  { path: '', component: AppComponent, data: { title: '', breadcrumb: '' },
    // App
    children: [
      { path: '',
        loadChildren: () => import('./maze/maze.module').then(m => m.MazeModule),
      }
    ]
  },
];

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    CoreModule,
    SharedModule,
    MazeModule,
    RouterModule.forRoot(routes),
  ],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule { }
