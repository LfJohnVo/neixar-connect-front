import { Injectable } from '@angular/core';
import { GLOBAL } from '../../config';

@Injectable({
  providedIn: 'root'
})
export class UploadImageService {

  constructor() { }

  subirArchivo( archivo: File, id: string ){

    return new Promise( (resolve, reject) =>{
      let formData = new FormData();
      let xhr = new XMLHttpRequest();

      formData.append( 'imagen', archivo, archivo.name );

      xhr.onreadystatechange = function() {

        if(xhr.readyState === 4) {

          if(xhr.status === 200) {
            // Imagen subida exitosamente
            resolve( xhr.response );
          } else {
            // Error al subir imagen
            reject( xhr.response );
          }
        }
      };

      let url = GLOBAL.urlAPI + 'uploadImage/' + id;

      xhr.open('PUT', url, true);
      xhr.send( formData );
    });

  }

}
