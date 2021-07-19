import { Pipe, PipeTransform } from '@angular/core';
import { GLOBAL } from '../config';

@Pipe({
  name: 'image'
})
export class ImagePipe implements PipeTransform {

  transform( img: String ): any {

    //Generar URL para usar el API de obtener imagen
    let url = GLOBAL.urlAPI + '/image';

    if( !img ){
      // Si no mandan imagen solícitar una inexistente que regresará la imagen por defecto
      return url + '/image_no_found';
    }

    url += '/' + img;

    return url;
  }

}
