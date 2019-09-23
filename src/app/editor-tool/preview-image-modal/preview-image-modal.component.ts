import { Component, OnInit, Input } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-preview-image-modal',
  templateUrl: './preview-image-modal.component.html',
  styleUrls: ['./preview-image-modal.component.scss'],
})
export class PreviewImageModalComponent implements OnInit {

  @Input() finalImage: string;
  constructor(navParams: NavParams, private modalCtrl:ModalController) {
  }

  dismiss() {
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }
  ngOnInit() {}

}
