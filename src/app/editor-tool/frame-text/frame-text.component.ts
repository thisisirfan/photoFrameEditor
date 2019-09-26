import { ModalController } from '@ionic/angular';
import { Component, OnInit, Input } from '@angular/core';
import { ColorPicker } from './color-picker';

@Component({
  selector: 'app-frame-text',
  templateUrl: './frame-text.component.html',
  styleUrls: ['./frame-text.component.scss'],
})
export class FrameTextComponent implements OnInit {

  @Input() frameTextData: any;
  textMeta:any = {text:'',family:'arial',size:16, color:'#FF0000'};
  constructor(private modalCtrl: ModalController) {
    console.log('text',this.frameTextData)
  }

  ngOnInit() {
    if(typeof this.frameTextData!=='undefined' && this.frameTextData!==null)
      this.textMeta = this.frameTextData;
  }

  applyText(){
    this.dismiss();
  }

  dismiss() {
    this.modalCtrl.dismiss(this.textMeta);
  }

  setColor(e){
    this.textMeta.color = e;
  }

  colorTouchEnd(){}
  colorTouchStart(){}

}
