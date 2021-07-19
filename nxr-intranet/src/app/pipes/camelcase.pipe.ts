import { Pipe, PipeTransform } from '@angular/core';
import { validateConfig } from '@angular/router/src/config';

@Pipe({
  name: 'camelcase'
})
export class CamelcasePipe implements PipeTransform {

  transform(value: string, args?: any): string {
    if(value) {
      value = value.toLowerCase();
      let words = value.split(' ');
      
      for( let i in words) {
        words[i] = words[i][0].toUpperCase() + words[i].substr(1);
      }
  
      return words.join(' ');
    } else return null;
  }

}
