import { AdmobService } from './providers/admob.service';
import { Component } from '@angular/core';

import { Platform, ToastController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { FcmService } from './providers/fcm.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  public appPages = [
    {
      title: 'Home',
      url: '/home',
      icon: 'home'
    }
  ];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private admobService: AdmobService,
    private fcm: FcmService,
    private toaster: ToastController
  ) {
    this.initializeApp();
    this.initFCM();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.admobService.bannerAd();
    });
  }

  initFCM(){
    this.platform.ready().then(() => {
      // Get a FCM token
      this.fcm.getToken()
      // Listen to incoming messages
      this.fcm.listenToNotifications().pipe(
        tap(msg => {
          // show a toast
          this.showNotificationToast(msg);
        })
      )
      .subscribe()
    });
  }

  async showNotificationToast(msg:any) {
    const toast = await this.toaster.create({
      message: msg.body,
      duration: 5000
    });
    toast.present();
  }
}
