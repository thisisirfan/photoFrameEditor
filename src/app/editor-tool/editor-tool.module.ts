import { PreviewImageModalComponent } from './preview-image-modal/preview-image-modal.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { EditorToolPage } from './editor-tool.page';
import { FrameTextComponent } from './frame-text/frame-text.component';
import { ColorPicker } from './frame-text/color-picker';

const routes: Routes = [
  {
    path: '',
    component: EditorToolPage
  }
];

@NgModule({
  entryComponents:[
    PreviewImageModalComponent,
    FrameTextComponent,
    ColorPicker
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [EditorToolPage, PreviewImageModalComponent, FrameTextComponent, ColorPicker]
})
export class EditorToolPageModule {}
