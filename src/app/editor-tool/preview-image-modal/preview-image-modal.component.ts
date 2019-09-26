import { SocialShareService } from './../../providers/social-share.service';
import { Component, OnInit, Input } from '@angular/core';
import { NavParams, ModalController, Platform, ToastController } from '@ionic/angular';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
declare var window: any;

@Component({
  selector: 'app-preview-image-modal',
  templateUrl: './preview-image-modal.component.html',
  styleUrls: ['./preview-image-modal.component.scss'],
})
export class PreviewImageModalComponent implements OnInit {

  canShare:boolean = false;
  shareImagePath: string;

  @Input() finalImage: string;
  constructor(navParams: NavParams,
    private modalCtrl: ModalController,
    private platform: Platform,
    public toaster: ToastController,
    public share: SocialShareService,
    private androidPermissions: AndroidPermissions) {
  }

  dismiss() {
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }
  ngOnInit() { }

  saveImage() {
    //let windows: any = window;
    console.log(window);
    this.platform.ready().then(() => {
      if (this.platform.is('android')) {
        this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then(
          result => this.downloadImageToGallery(),
          err => this.requestPermission()
        );
      } else
        this.downloadImageToGallery();
    });

  }

  requestPermission(){
    this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE])
      .then(()=>this.downloadImageToGallery())
  }

  downloadImageToGallery() {
    var params = { data: this.finalImage, prefix: 'frame_', format: 'JPG', quality: 80, mediaScanner: true };
    window.imageSaver.saveBase64Image(params,
      (filePath) => {
        this.presentToast();
        this.canShare = true;
        this.shareImagePath = filePath;
        console.log('File saved on ' + filePath);
      },
      (msg) =>{
        console.error('error while saving file:', msg);
      }
    );
  }

  async presentToast() {
    const toast = await this.toaster.create({
      message: 'Image has been saved in gallery',
      duration: 2000
    });
    toast.present();
  }

  shareImage(){
    this.share.socialShareActionSheet({message:'',image:this.shareImagePath,url:''});
  }
}
