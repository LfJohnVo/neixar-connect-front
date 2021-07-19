import { NgModule } from '@angular/core';
import { FirstnamePipe } from './firstname.pipe';
import { CamelcasePipe } from './camelcase.pipe';
import { ImagePipe } from './image.pipe';

@NgModule({
  imports: [ ],
  declarations: [ 
    FirstnamePipe, 
    CamelcasePipe,
    ImagePipe
  ],
  exports: [
    FirstnamePipe,
    CamelcasePipe,
    ImagePipe
  ]
})
export class PipesModule { }
