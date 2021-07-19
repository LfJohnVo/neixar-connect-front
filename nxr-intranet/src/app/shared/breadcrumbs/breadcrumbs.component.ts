import { Component, OnInit } from '@angular/core';
import { Router, ActivationEnd, RouterEvent } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styles: []
})
export class BreadcrumbsComponent implements OnInit {
  
  currentPageTitle;
  routes;

  constructor( private router: Router,
               private title: Title) {

    this.getDataRoute()
    .subscribe( data => {
      this.currentPageTitle = data.title;
      this.routes = data.route;
      this.title.setTitle( this.currentPageTitle[this.currentPageTitle.length - 1] )
    });
  }

  ngOnInit() {
  }

  /*
   *  Esta función permite obtener el título de la ruta en la que estamos posicionados
   *  para mostrarla en los breadcrumbs
   */
  getDataRoute() {
    return this.router.events.pipe(
      filter( routerEvent => routerEvent instanceof ActivationEnd ),
      filter( (routerEvent: ActivationEnd) => routerEvent.snapshot.firstChild === null ),
      map( (routerEvent: ActivationEnd) => routerEvent.snapshot.data)
    )
  }
}
