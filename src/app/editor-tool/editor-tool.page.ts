import { AdmobService } from './../providers/admob.service';
import { Component, ViewChild } from '@angular/core';
import interact from 'interactjs';
import { Camera, CameraOptions } from '@ionic-native/Camera/ngx';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { File } from '@ionic-native/file/ngx';
import { Router, ActivatedRoute } from '@angular/router';
import { PreviewImageModalComponent } from './preview-image-modal/preview-image-modal.component';
import resizebase64 from 'resize-base64';
import { FrameTextComponent } from './frame-text/frame-text.component';

declare var window: any;
var overlayImage = {
  angle: 0,
  scale: 0,
  x_pos: 0,
  y_pos: 0,
  height: 0,
  width: 0,
  x_text: 0,
  y_text: 0
};

@Component({
  selector: 'app-editor-tool',
  templateUrl: './editor-tool.page.html',
  styleUrls: ['./editor-tool.page.scss'],
})
export class EditorToolPage {

  @ViewChild('photocanvas', { static: false }) canvas: any;
  canvasElement: any;
  frameMeta: any = { height: 0, width: 0 };
  ImageMeta: any = { height: 0, width: 0 };
  frames: any = [];
  currentFrame = 'assets/images/christmas-minions-fram.png';
  sourceImage = 'assets/images/baby2.jpg';
  enableReset: boolean = true;
  enablePreview: boolean = true;
  frameTextData: any = null;

  slideOpts = {
    initialSlide: 1,
    speed: 400,
    pager: false,
    slidesPerView: 3,
    spaceBetween: 15
  };

  bottomSheetOpen: boolean = false;
  croppedImagepath = "";
  isLoading = false;

  imagePickerOptions = {
    maximumImagesCount: 1,
    quality: 50
  };

  finalImage: any = null;
  image = 'assets/images/baby2.jpg';

  constructor(
    private camera: Camera,
    public actionSheetController: ActionSheetController,
    private route: ActivatedRoute,
    private router: Router,
    private file: File,
    public modalController: ModalController,
    public admobService: AdmobService) {
    this.getFrames();
    let cameraType = this.route.snapshot.paramMap.get('id');
    this.selectCameraType(cameraType);
  }

  selectCameraType(type) {
    type === '1' ?
      this.pickImage(this.camera.PictureSourceType.CAMERA)
      :
      this.pickImage(this.camera.PictureSourceType.PHOTOLIBRARY);
  }

  ionViewDidEnter() {

    this.canvasElement = this.canvas.nativeElement;
    this.canvasElement.width = 500;
    this.canvasElement.height = 500;
    //console.log('Canvas:', this.canvas)

    var angleScale = {
      angle: 0,
      scale: 1
    }

    var gestureArea = document.getElementById('gesture-area')
    var scaleElement = document.getElementById('scale-element')
    var orignalImg: any = document.getElementById('img-element-orig')
    let frameImg: any;
    frameImg = document.getElementById('frame-img')

    setTimeout(() => {
      this.frameMeta.height = frameImg.naturalHeight;
      this.frameMeta.width = frameImg.naturalWidth;
      this.ImageMeta.width = orignalImg.naturalWidth;
      this.ImageMeta.height = orignalImg.naturalHeight;
      //console.log('frame meta image:',this.frameMeta.height)
    }, 100);
    overlayImage.angle = 0;
    overlayImage.scale = 1;

    var resetTimeout
    // target elements with the "draggable" class
    interact('.draggable')
      .gesturable({
        onstart: function (event) {
          angleScale.angle -= event.angle
          clearTimeout(resetTimeout)
          scaleElement.classList.remove('reset')
        },
        onmove: function (event) {
          // document.body.appendChild(new Text(event.scale))
          var currentAngle = event.angle + angleScale.angle
          var currentScale = event.scale * angleScale.scale
          scaleElement.style.webkitTransform =
            scaleElement.style.transform =
            'rotate(' + currentAngle + 'deg)' + 'scale(' + currentScale + ')';

          overlayImage.angle = currentAngle;
          overlayImage.scale = currentScale;
          //console.log('its scaling and rotating',overlayImage)
          // uses the dragMoveListener from the draggable demo above
          dragMoveListener(event)
        },
        onend: function (event) {
          angleScale.angle = angleScale.angle + event.angle
          angleScale.scale = angleScale.scale * event.scale
        }
      })
      .draggable({
        onmove: dragMoveListener,
        modifiers: [
          interact.modifiers.restrict({
            restriction: 'parent',
            endOnly: true
          })
        ]
      })
      .resizable({
        modifiers: [
          interact.modifiers.restrictSize({
            min: { width: 100, height: 100 },
            max: { width: 250, height: 250 },
          })
        ]
      });

    var currentImageAngle = 0;
    var currentImageScale = 0;

    function dragMoveListener(event) {
      console.log('event:', event)

      var target = event.target
      // keep the dragged position in the data-x/data-y attributes
      var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
      var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy

      //limited for text dragging
      if (target.id === 'frame-text') {
        target.style.webkitTransform =
          target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
        overlayImage.x_text = x;
        overlayImage.y_text = y;
        return;
      }

      overlayImage.x_pos = x;
      overlayImage.y_pos = y;

      let eventAngle;
      let eventScale;

      if (typeof event.angle === 'undefined') eventAngle = 0; else eventAngle = event.angle;
      if (typeof event.scale === 'undefined') eventScale = 1; else eventScale = event.scale;

      currentImageAngle = eventAngle + angleScale.angle;
      currentImageScale = eventScale * angleScale.scale;

      //console.log(eventAngle, eventScale);

      // translate the element
      /* target.style.webkitTransform =
        target.style.transform =
        'translate(' + overlayImage.x_pos + 'px, ' + overlayImage.y_pos + 'px)'; */

      let transformedData = 'translate(' + overlayImage.x_pos + 'px, ' + overlayImage.y_pos + 'px) ' + 'rotate(' + currentImageAngle + 'deg) ' + 'scale(' + currentImageScale + ')';
      //console.log(transformedData);

      //target is #gesture-area
      target.style.webkitTransform =
        target.style.transform =
        orignalImg.style.webkitTransform =
        orignalImg.style.transform = transformedData;
      // update the posiion attributes
      target.setAttribute('data-x', overlayImage.x_pos);
      target.setAttribute('data-y', overlayImage.y_pos);
    }

    // this is used later in the resizing and gesture demos
    window.dragMoveListener = dragMoveListener;
  }

  async previewImageModal() {
    this.admobService.interstatialAd();
    const modal = await this.modalController.create({
      component: PreviewImageModalComponent,
      componentProps: {
        'finalImage': this.finalImage,
      }
    });
    return await modal.present();
  }

  clearCanvas() {
    let context = this.canvasElement.getContext('2d');
    context.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    this.finalImage = null;
  }

  resetImage() {
    this.clearCanvas();

    this.frameTextData = null;
    let orignalImg: any = document.getElementById('img-element-orig');
    let opaqueImg: any = document.getElementById('gesture-area');
    let scaleElement = document.getElementById('scale-element')

    opaqueImg.setAttribute('data-x', 0);
    opaqueImg.setAttribute('data-y', 0);
    let transformedData = 'translate(0px, 0px) ' + 'rotate(0deg) ' + 'scale(1)';
    opaqueImg.style.webkitTransform =
      opaqueImg.style.transform =
      orignalImg.style.webkitTransform =
      orignalImg.style.transform = transformedData;

    scaleElement.style.webkitTransform =
      scaleElement.style.transform =
      'rotate(0deg)' + 'scale(1)';
    //console.log('before reset:', overlayImage)
    overlayImage = {
      angle: 0,
      scale: 1,
      x_pos: 0,
      y_pos: 0,
      height: this.ImageMeta.height,
      width: this.ImageMeta.width,
      x_text: 0,
      y_text: 0
    };
  }
  x_pos: any;
  y_pos: any;
  drawSourceImage() {
    let canvas = this.canvas;
    let context = this.canvasElement.getContext('2d');
    //overlay image
    let sourceImg: any = document.getElementById('img-element-orig');
    let currentScale = (overlayImage.scale);
    console.table([
      { 'natural width': sourceImg.naturalWidth },
      { 'natural height': sourceImg.naturalHeight },
      { 'Scale': overlayImage.scale },
      { 'Pos x': overlayImage.x_pos },
      { 'Pos y': overlayImage.y_pos },
    ]);
    /* let size = Math.min(sourceImg.width,sourceImg.height);
    let x = (sourceImg.width - size*overlayImage.scale) /2;
    let y = (sourceImg.height - size*overlayImage.scale) /2;
    console.log('size:'+size+' - x:'+x+' - y:'+y); */
    this.x_pos = overlayImage.x_pos;
    this.y_pos = overlayImage.y_pos;
    if (currentScale !== 1) {
      currentScale = currentScale - 0.13;
      this.x_pos = (overlayImage.x_pos * currentScale) / 2;
      this.y_pos = (overlayImage.y_pos * currentScale) / 2;
    }
    context.drawImage(sourceImg, this.x_pos, this.y_pos, (sourceImg.naturalWidth * currentScale), (sourceImg.naturalHeight * currentScale));
  }

  drawFrameImage() {
    let context = this.canvasElement.getContext('2d');
    //frame image
    let frameImg: any = document.getElementById('frame-img');
    this.canvasElement.width = frameImg.naturalWidth;
    this.canvasElement.height = frameImg.naturalHeight;
    context.drawImage(frameImg, 0, 0, frameImg.naturalWidth, frameImg.naturalHeight);
  }

  drawText() {
    let context = this.canvasElement.getContext('2d');
    context.font = this.frameTextData.size + "px "+this.frameTextData.family;
    /* context.textAlign = 'center'; */
    context.fillStyle = this.frameTextData.color;
    let scaleElement = document.getElementById('scale-element');

    console.log(overlayImage)
    //context.fillText(this.frameTextData.text, this.canvasElement.width / 2, this.canvasElement.height * 0.8);
    context.fillText(this.frameTextData.text, overlayImage.x_text*2, overlayImage.y_text*2);
  }

  compileEditing() {
    //console.log('overlay:',overlayImage);
    let canvas = this.canvas;
    let context = this.canvasElement.getContext('2d');

    let source = new Image();
    source.crossOrigin = 'Anonymous';
    source.onload = () => {
      let frameImg: any = document.getElementById('frame-img');
      this.canvasElement.width = frameImg.naturalWidth;
      this.canvasElement.height = frameImg.naturalHeight;

      //overlayImage.scale = 1.1
      //draw source image
      //apply image angle if applied
      context.save(); // save current state
      context.rotate(overlayImage.angle * Math.PI / 180);
      //apply image scale if applied
      this.drawSourceImage();

      //reset angle for frame
      context.restore();
      //context.rotate(-overlayImage.angle * Math.PI / 180);
      //frame image
      context.drawImage(frameImg, 0, 0, frameImg.naturalWidth, frameImg.naturalHeight);
      //this.drawFrameImage();
      if (this.frameTextData !== null)
        this.drawText();

      this.finalImage = this.image = this.canvasElement.toDataURL();
      //show image preview modal
      this.previewImageModal();
    };
    source.src = this.image;
  }

  selectFrame(frame) {
    this.currentFrame = 'assets/images/frames/' + frame;
  }

  getFrames() {
    this.frames = [
      'birthday.png',
      'christmas-cold.png',
      'christmas-evening.png',
      'christmas-minions.png',
      'micky-mouse.png',
      'valentines.png',
      'wedding.png'
    ];
  }

  /*Toggle Bottom Sheet */
  toggleBottomSheet() {
    this.bottomSheetOpen = !this.bottomSheetOpen;
  }

  /*Camera & Gallery Option */
  pickImage(sourceType) {
    const options: CameraOptions = {
      quality: 90,
      sourceType: sourceType,
      destinationType: this.camera.DestinationType.DATA_URL,
      mediaType: this.camera.MediaType.PICTURE
    }
    this.camera.getPicture(options).then((imageData) => {
      this.resetImage();
      //console.log('image data:',imageData);
      let base64Image = 'data:image/jpeg;base64,' + imageData;

      //this.sourceImage = this.resizeBase64(base64Image,800,800);
      //this.resizeBase64(base64Image,800,800);
      this.sourceImage = base64Image;
      console.log('got resized image')
      this.resizeGesureArea(base64Image);
    }, (err) => {
      // Handle error
    });
  }

  //resize base64 image
  resizeBase64(base64, maxWidth, maxHeight) {
    let img = resizebase64(base64, maxWidth, maxHeight);
    console.log('resize done')
    return img;
  }

  //resize gensure area according to selected image size
  resizeGesureArea(base64) {
    let i = new Image();
    i.onload = () => {
      this.ImageMeta.width = i.width;
      this.ImageMeta.height = i.height;
      console.log(i.width + ", " + i.height);
    };
    i.src = base64;
  }

  getSelectedImage(ImagePath) {
    this.isLoading = true;
    var copyPath = ImagePath;
    var splitPath = copyPath.split('/');
    var imageName = splitPath[splitPath.length - 1];
    var filePath = ImagePath.split(imageName)[0];

    this.file.readAsDataURL(filePath, imageName).then(base64 => {
      this.sourceImage = base64;
      this.isLoading = false;
    }, error => {
      console.error(error);
      alert('Error in showing image' + error);
      this.isLoading = false;
    });
  }

  /*Select Image Action Sheet */
  async selectImage() {
    const actionSheet = await this.actionSheetController.create({
      header: "Select Image source",
      buttons: [{
        text: 'Load from Library',
        handler: () => {
          this.pickImage(this.camera.PictureSourceType.PHOTOLIBRARY);
        }
      },
      {
        text: 'Use Camera',
        handler: () => {
          this.pickImage(this.camera.PictureSourceType.CAMERA);
        }
      },
      {
        text: 'Cancel',
        role: 'cancel'
      }
      ]
    });
    await actionSheet.present();
  }


  /*Text Functionality */
  async previewTextModal() {
    console.log('send text',this.frameTextData)
    const modal = await this.modalController.create({
      component: FrameTextComponent,
      componentProps: {
        'frameTextData': this.frameTextData,
      }
    });

    modal.onDidDismiss()
      .then((res: any) => {
        this.frameTextData = res.data;
        console.log('form data', res.data)
      });
    return await modal.present();
  }

}
