import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'firstname'
})
export class FirstnamePipe implements PipeTransform {

  transform(value: string, args?: any): string {
    if( value ) {
      let names = value.split(' ');
    return names[0];
    }
    else return null;
  }

}
