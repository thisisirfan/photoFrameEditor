import { Injectable } from '@angular/core';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { LoadingController, ToastController, ActionSheetController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class SocialShareService {

  constructor(
    private loader: LoadingController,
    private toaster: ToastController,
    private socialSharing: SocialSharing,
    public actionsheetCtrl: ActionSheetController
  ) { }

  async socialShareActionSheet(data) {
    const actionSheet = await this.actionsheetCtrl.create({
      header: 'Share',
      cssClass: 'social-action-sheets-basic-page',
      buttons: [
        {
          text: 'Facebook',
          role: 'destructive',
          icon: 'logo-facebook',
          cssClass: 'fbIconColor',
          handler: () => {
            this.shareImage('fb', data);
          }
        },
        {
          text: 'Twitter',
          icon: 'logo-twitter',
          cssClass: 'twIconColor',
          handler: () => {
            this.shareImage('tw', data);
          }
        },
        {
          text: 'Whatsapp',
          icon: 'logo-whatsapp',
          cssClass: 'wtIconColor',
          handler: () => {
            this.shareImage('wt', data);
          }
        },
        {
          text: 'Instagram',
          icon: 'logo-instagram',
          cssClass: 'inIconColor',
          handler: () => {
            this.shareImage('in', data);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel', // will always sort to be on the bottom
          icon: 'close',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    await actionSheet.present();
  }

  shareImage(type, data) {
    console.log(type,data);
    this.presentLoading();
    switch (type) {
      case 'fb':
        this.socialSharing.share(null,null, data.image).then(() => {
          this.closeLoading();
          this.presentToast();
        }).catch(() => {
          this.closeLoading();
        });
        break;
      case 'tw':
        this.socialSharing.shareViaTwitter(data.message, data.image, data.url).then(() => {
          this.closeLoading();
          this.presentToast();
        }).catch(() => {
          this.closeLoading();
        });
        break;
      case 'in':
        this.socialSharing.shareViaInstagram(data.message, data.image).then(() => {
          this.closeLoading();
          this.presentToast();
        }).catch(() => {
          this.closeLoading();
        });
        break;
      case 'wt':
        this.socialSharing.shareViaWhatsApp(data.message, data.image, data.url).then(() => {
          this.closeLoading();
          this.presentToast();
        }).catch(() => {
          this.closeLoading();
        });
        break;
      default:
        break;
    }

  }

  async presentToast() {
    const toast = await this.toaster.create({
      message: 'Image Shared successfully',
      duration: 2000
    });
    toast.present();
  }

  loading: any;
  async presentLoading() {
    this.loading = await this.loader.create({
      message: 'Sharing',
      duration: 2000
    });
    await this.loading.present();
  }

  async closeLoading() {
    await this.loading.onDidDismiss();
  }
}
