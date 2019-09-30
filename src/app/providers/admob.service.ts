import { Injectable } from '@angular/core';
import { AdMobPro } from '@ionic-native/admob-pro/ngx';
import { environment } from 'src/environments/environment';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AdmobService {

  bannerAdId;
  interstatialAdId;
  constructor(private admob: AdMobPro, private platform: Platform) {
  if(this.platform.is('android')) {
    this.bannerAdId = environment.bannerAdAndroid;
    this.interstatialAdId = environment.interstatialAdAnroid;
  } else if (this.platform.is('ios')) {
    this.bannerAdId = environment.bannerAdiOS;
    this.interstatialAdId = environment.interstatialiOS;
  }
  }

  bannerAd(){
    const bannerConfig: any = {
      adId: this.bannerAdId,
      isTesting: true,
      autoShow: true
     };

    this.admob.createBanner(bannerConfig)
    .then(() => { });
  }

  interstatialAd(){
    const interstatialConfig:any = {
      adId: this.interstatialAdId,
      isTesting: true,
      autoShow: true
     };
     this.admob.prepareInterstitial(interstatialConfig)
    .then(() => { this.admob.showInterstitial(); });
  }
}
