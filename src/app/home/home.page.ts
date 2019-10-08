import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  public appPages = [
    {
      title: 'Camera',
      url: '/editor-tool/1',
      icon: 'camera',
      image: '/assets/icon/camera.png',
      class: 'camera-menu-item'
    },
    {
      title: 'Choose Gallery',
      url: '/editor-tool/2',
      icon: 'images',
      image: '/assets/icon/gallery.png',
      class: 'gallery-menu-item'
    }
  ];

  constructor() {
  }

  ionViewDidEnter(){}
}
