import { AdmobService } from './../providers/admob.service';
import { Component, ViewChild } from '@angular/core';
import interact from 'interactjs';
import { Camera, CameraOptions } from '@ionic-native/Camera/ngx';
import { ActionSheetController, ModalController, AlertController, NavController, Platform } from '@ionic/angular';
import { File } from '@ionic-native/file/ngx';
import { Router, ActivatedRoute } from '@angular/router';
import { PreviewImageModalComponent } from './preview-image-modal/preview-image-modal.component';
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
  y_text: 0,
  x_temp_pos: 0,
  y_temp_pos: 0,
  isReset: false
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
  currentFrame = '';
  sourceImage = 'assets/images/cake.jpg';
  enableReset: boolean = true;
  enablePreview: boolean = true;
  frameTextData: any = null;
  imageOpacity: any = 1;
  showOpacity: boolean = false;
  public unsubscribeBackEvent: any;

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
    public admobService: AdmobService,
    public navCtrl: NavController,
    public platform: Platform,
    public alertController: AlertController) {
    this.getFrames();
    this.currentFrame = 'assets/images/frames/' + this.frames[0];
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
    console.log('ion view entered')
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
        modifiers: [
          interact.modifiers.restrict({
            restriction: 'parent',
            endOnly: true
          })
        ],
        onstart: function (event) {
          angleScale.angle -= event.angle
          clearTimeout(resetTimeout)
          scaleElement.classList.remove('reset')
        },
        onmove: function (event) {
          if (overlayImage.isReset === true) {
            resetTimeout = setTimeout(function () {
              resetScaleRotate();
            }, 1000)
            scaleElement.classList.add('reset')
            overlayImage.isReset = false;
          }
          var currentAngle = event.angle + angleScale.angle
          var currentScale = event.scale * angleScale.scale
          //console.log('event angle:' + event.angle, 'angle scale:', angleScale.angle)
          scaleElement.style.webkitTransform =
            scaleElement.style.transform =
            'rotate(' + currentAngle + 'deg)' + 'scale(1)';

          overlayImage.angle = currentAngle;
          overlayImage.scale = currentScale;
          //console.log('its scaling and rotating', overlayImage)
          dragMoveListener(event)
        },
        onend: function (event) {
          angleScale.angle = angleScale.angle + event.angle
          angleScale.scale = angleScale.scale * event.scale
          setTimeout(function() {
            calculateOffsetDistance(event)
          }, 2000);
          /* resetTimeout = setTimeout(resetScaleRotate, 1000)
          scaleElement.classList.add('reset') */
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

    function resetScaleRotate() {
      console.log('reset triggered')
      let scaleElement1 = document.getElementById('scale-element')
      let opaqueImg1: any = document.getElementById('gesture-area');
      let orignalImg1: any = document.getElementById('img-element-orig');
      orignalImg1.style.webkitTransform =
        orignalImg1.style.webkitTransform =
        opaqueImg1.style.webkitTransform =
        opaqueImg1.style.webkitTransform =
        scaleElement1.style.transform =
        scaleElement1.style.webkitTransform =
        scaleElement1.style.transform =
        'scale(1)'
      angleScale.angle = 0;
      angleScale.scale = 1;
      scaleElement1.classList.add('reset')
    }

    function getOffsetLeft(elem) {
      var offsetLeft = 0;
      do {
        if (!isNaN(elem.offsetLeft)) {
          offsetLeft += elem.offsetLeft;
        }
      } while (elem = elem.offsetParent);
      return offsetLeft;
    }

    function getOffsetTop(elem) {
      var offsetTop = 0;
      do {
        if (!isNaN(elem.offsetTop)) {
          offsetTop += elem.offsetTop;
        }
      } while (elem = elem.offsetParent);
      return offsetTop;
    }

    function calculateOffsetDistance(event) {
      let leftWindowDistance = getOffsetLeft(frameImg);
      let topWindowDistance = getOffsetTop(frameImg);
      let left = event.rect.left - leftWindowDistance;
      let top = event.rect.top - topWindowDistance;
      //console.log('event:',event)
      //console.log(['left:'+left, 'top:'+top])
      overlayImage.x_temp_pos = left;
      overlayImage.y_temp_pos = top;
    }

    var currentImageAngle = 0;
    var currentImageScale = 0;

    function dragMoveListener(event) {
      //console.log('event:', event)
      if (overlayImage.isReset === true) {
        resetScaleRotate();
        angleScale.angle = 0;
        angleScale.scale = 1;
        overlayImage.isReset = false;
      } else {
        //console.log('not triggering reset scale')
      }
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

        let leftWindowDistance = getOffsetLeft(frameImg);
        let topWindowDistance = getOffsetTop(frameImg);
        let left = event.rect.left - leftWindowDistance;
        let top = event.rect.top - topWindowDistance;
        //console.log(top,left)
        overlayImage.x_text = left;
        overlayImage.y_text = top;
        return;
      }

      calculateOffsetDistance(event);

      overlayImage.x_pos = x;
      overlayImage.y_pos = y;

      let eventAngle;
      let eventScale;

      //console.log('event scale' + event.scale, 'angleScale.scale:' + angleScale.scale)
      if (typeof event.angle === 'undefined') eventAngle = 0; else eventAngle = event.angle;
      if (typeof event.scale === 'undefined') eventScale = 1; else eventScale = event.scale;

      currentImageAngle = eventAngle + angleScale.angle;
      currentImageScale = eventScale * angleScale.scale;

      //console.log('currentImageScale:', currentImageScale)

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
    if (this.finalImage)
      this.clearCanvas();
    //console.log(window)
    //this.frameTextData = null;
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
      'scale(1)';
    scaleElement.classList.add('reset');

    //console.log('before reset:', overlayImage)
    overlayImage = {
      angle: 0,
      scale: 1,
      x_pos: 0,
      y_pos: 0,
      height: this.ImageMeta.height,
      width: this.ImageMeta.width,
      x_text: 0,
      y_text: 0,
      x_temp_pos: 0,
      y_temp_pos: 0,
      isReset: true
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

    this.x_pos = overlayImage.x_temp_pos;
    this.y_pos = overlayImage.y_temp_pos;

    let sourceWidth = sourceImg.naturalWidth;
    let sourceHeight = sourceImg.naturalHeight;

    /* currentScale = .46 */
    if (currentScale !== 1) {
      /* currentScale = currentScale-0.13; */
      sourceWidth = (sourceImg.naturalWidth * currentScale);
      sourceHeight = (sourceImg.naturalHeight * currentScale);
      /*  if (currentScale < 1) {
         sourceWidth = (sourceImg.naturalWidth * currentScale);
         sourceHeight = (sourceImg.naturalHeight * currentScale);
       } else {
         sourceWidth = (sourceImg.naturalWidth * currentScale) / 2;
         sourceHeight = (sourceImg.naturalHeight * currentScale) / 2;
       } */
    }

    console.table([
      ['natural width', sourceImg.naturalWidth],
      ['natural height', sourceImg.naturalHeight],
      ['Updated width', overlayImage.width],
      ['Updated height', overlayImage.height],
      ['Scale', overlayImage.scale],
      ['Pos x', this.x_pos],
      ['Pos y', this.y_pos],
      ['Source Width & Height', sourceWidth + ',' + sourceHeight]
    ]);

    context.drawImage(sourceImg, this.x_pos, this.y_pos, sourceWidth, sourceHeight);
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
    context.font = this.frameTextData.size + "px " + this.frameTextData.family;
    /* context.textAlign = 'center'; */
    context.fillStyle = this.frameTextData.color;
    let scaleElement = document.getElementById('scale-element');

    context.fillText(this.frameTextData.text, (overlayImage.x_text) + 30, (overlayImage.y_text) + 30);
  }

  setOpacity() {
    /* console.log(this.imageOpacity); */
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
      /* overlayImage.angle = -5.1; */
      context.rotate(overlayImage.angle * Math.PI / 180);
      //apply image opacity if applied
      context.globalAlpha = this.imageOpacity;
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
    let frameImg: any;
    frameImg = document.getElementById('frame-img')
    setTimeout(() => {
      this.frameMeta.height = frameImg.naturalHeight;
      this.frameMeta.width = frameImg.naturalWidth;
    }, 100);
    this.currentFrame = 'assets/images/frames/' + frame;
  }

  getFrames() {
    this.frames = [
      'wedding/wedding-1.png',
      'wedding/wedding-2.png',
      'wedding/wedding-3.png',
      'wedding/wedding-4.png',
      'wedding/wedding-5.png',
      'wedding/wedding-6.png',
      'wedding/wedding-7.png',
      'wedding/wedding-8.png',
      'wedding/wedding-9.png',
      'wedding/wedding-10.png',
      'wedding/wedding-11.png',
      'wedding/wedding-12.png',
      'wedding/wedding-13.png',
      'wedding/wedding-14.png',
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
      mediaType: this.camera.MediaType.PICTURE,
      targetWidth: 800,
      targetHeight: 800
    }
    this.camera.getPicture(options).then(async (imageData) => {
      this.resetImage();
      //console.log('image data:',imageData);
      let base64Image = 'data:image/jpeg;base64,' + imageData;

      this.sourceImage = base64Image;
      this.resizeGesureArea(this.sourceImage);
    }, (err) => {
      // Handle error
    });
  }

  //resize gensure area according to selected image size
  resizeGesureArea(base64) {
    let i = new Image();
    i.onload = () => {
      this.ImageMeta.width = i.width;
      this.ImageMeta.height = i.height;

      overlayImage.width = i.width;
      overlayImage.height = i.height;
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
    console.log('send text', this.frameTextData)
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

  showAlertMessage = true;

  ngOnInit() {
    this.initializeBackButtonCustomHandler();
  }

  ionViewWillLeave() {
    // Unregister the custom back button action for this page
    this.unsubscribeBackEvent && this.unsubscribeBackEvent();

    /* if (this.showAlertMessage) {
      this.promptExitAlert();
      return;
    } */
  }

  initializeBackButtonCustomHandler(): void {
    this.unsubscribeBackEvent = this.platform.backButton.subscribeWithPriority(999999, () => {
      this.promptExitAlert();
    });
    /* here priority 101 will be greater then 100 
    if we have registerBackButtonAction in app.component.ts */
  }

  async promptExitAlert() {
    const alert = await this.alertController.create({
      header: 'Editor',
      message: 'Are you sure you want to leave editor?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            /* console.log('Confirm Cancel: blah'); */
          }
        }, {
          text: 'Yes',
          handler: () => {
            this.exitPage();
          }
        }
      ]
    });

    await alert.present();
  }

  private exitPage() {
    this.showAlertMessage = false;
    this.navCtrl.navigateBack('/home');
  }

}
