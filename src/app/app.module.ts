import { AdMobPro } from '@ionic-native/admob-pro/ngx';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { FcmService } from './providers/fcm.service';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { Camera } from '@ionic-native/Camera/ngx';
import { File } from '@ionic-native/file/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { SocialShareService } from './providers/social-share.service';
import { AdmobService } from './providers/admob.service';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireModule } from '@angular/fire';

const firebase = {
  apiKey: "AIzaSyAC42hr36ZuZj2apB4VZfK8y34ljBXPZXY",
  authDomain: "photoframe-editor-temp.firebaseapp.com",
  databaseURL: "https://photoframe-editor-temp.firebaseio.com",
  projectId: "photoframe-editor-temp",
  storageBucket: "photoframe-editor-temp.appspot.com",
  messagingSenderId: "232399525659",
  appId: "1:232399525659:web:9aa6bedfc3bd34efa025be"
}

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    AngularFireModule.initializeApp(firebase), 
    AngularFirestoreModule,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Camera,
    File,
    AndroidPermissions,
    SocialSharing,
    AdMobPro,
    SocialShareService,
    AdmobService,
    FirebaseX,
    FcmService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
