import { Component, ViewChild } from '@angular/core';
import interact from 'interactjs';
import mergeImages from 'merge-images';
import { Observable } from 'rxjs';
import { Camera, CameraOptions } from '@ionic-native/Camera/ngx';
import { ActionSheetController } from '@ionic/angular';
import { File } from '@ionic-native/file/ngx';

declare var window: any;
var overlayImage = {
  angle: 0,
  scale: 0,
  x_pos: 0,
  y_pos: 0,
  height: 0,
  width: 0
};


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  @ViewChild('photocanvas', {static: false}) canvas: any;
  canvasElement: any;
  frameMeta:any = {height:0,width:0};
  ImageMeta:any = {height:0,width:0};
  frames:any = [];
  currentFrame = 'assets/images/christmas-minions-fram.png';
  sourceImage = 'assets/images/baby2.jpg';

  slideOpts = {
    initialSlide: 1,
    speed: 400,
    pager: false,
    slidesPerView: 3,
    spaceBetween: 15
  };

  bottomSheetOpen:boolean = false;
  croppedImagepath = "";
  isLoading = false;

  imagePickerOptions = {
    maximumImagesCount: 1,
    quality: 50
  };

  constructor(
    private camera: Camera,
    public actionSheetController: ActionSheetController,
    private file: File) {
    this.getFrames();
  }

  ionViewDidEnter() {

    this.canvasElement = this.canvas.nativeElement;
    this.canvasElement.width = 500;
    this.canvasElement.height = 500;
    console.log('Canvas:',this.canvas)

    var angleScale = {
      angle: 0,
      scale: 1
    }

    var gestureArea = document.getElementById('gesture-area')
    var scaleElement = document.getElementById('scale-element')
    var orignalImg:any = document.getElementById('img-element-orig')
    let frameImg:any; 
    frameImg = document.getElementById('frame-img')

    setTimeout(() => {
      this.frameMeta.height = frameImg.naturalHeight;
      this.frameMeta.width = frameImg.naturalWidth;
      this.ImageMeta.width = orignalImg.naturalWidth;
      this.ImageMeta.height = orignalImg.naturalWidth;
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
      var target = event.target
      // keep the dragged position in the data-x/data-y attributes
      var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
      var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy

      let eventAngle;
      let eventScale;

      if( typeof event.angle === 'undefined')  eventAngle = 0; else eventAngle =  event.angle;
      if( typeof event.scale === 'undefined')  eventScale = 1; else eventScale =  event.scale;

      currentImageAngle = eventAngle + angleScale.angle;
      currentImageScale = eventScale * angleScale.scale;

      //console.log(eventAngle, eventScale);

      // translate the element
      target.style.webkitTransform =
        target.style.transform =
        'translate(' + x + 'px, ' + y + 'px)';

      let transformedData = 'translate(' + x + 'px, ' + y + 'px) ' + 'rotate(' + currentImageAngle + 'deg) ' + 'scale(' + currentImageScale + ')';
      //console.log(transformedData);
      orignalImg.style.webkitTransform =
        orignalImg.style.transform = transformedData;
      // update the posiion attributes
      target.setAttribute('data-x', x);
      target.setAttribute('data-y', y);
      overlayImage.x_pos = x;
      overlayImage.y_pos = y;
    }

    // this is used later in the resizing and gesture demos
    window.dragMoveListener = dragMoveListener;

    function reset() {
      scaleElement.style.webkitTransform =
        scaleElement.style.transform =
        'scale(1)'

      angleScale.angle = 0;
      angleScale.scale = 1;
    }
  }

  finalImage:any = null;
  image  = 'assets/images/baby2.jpg';

  clearCanvas(){
    let context = this.canvasElement.getContext('2d');
    context.clearRect(0, 0,  this.canvasElement.width,  this.canvasElement.height);
    this.finalImage = null;
  }

  drawSourceImage(){
    let canvas = this.canvas;
    let context = this.canvasElement.getContext('2d');
    //overlay image
    let sourceImg:any = document.getElementById('img-element-orig');
    let currentScale = (overlayImage.scale);
    console.table([
      {'natural width': sourceImg.naturalWidth},
      {'natural height': sourceImg.naturalHeight},
      {'Scale':overlayImage.scale},
      {'Pos x':overlayImage.x_pos},
      {'Pos y':overlayImage.y_pos},
    ]);
    context.drawImage(sourceImg, overlayImage.x_pos, overlayImage.y_pos, (sourceImg.naturalWidth*currentScale), (sourceImg.naturalHeight*currentScale));
  }

  drawFrameImage(){
    let context = this.canvasElement.getContext('2d');
    //frame image
    let frameImg:any = document.getElementById('frame-img');
    this.canvasElement.width = frameImg.naturalWidth;
    this.canvasElement.height = frameImg.naturalHeight;
    context.drawImage(frameImg, 0, 0, frameImg.naturalWidth, frameImg.naturalHeight);
  }

  drawText(){
    let context = this.canvasElement.getContext('2d');
    context.font = "24px impact";
    context.textAlign = 'center';
    context.fillStyle = 'black';
    context.fillText('HELLO WORLD', this.canvasElement.width / 2, this.canvasElement.height * 0.8);
  }

  compileEditing() {
    //console.log('overlay:',overlayImage);
    let canvas = this.canvas;
    let context = this.canvasElement.getContext('2d');

    let source = new Image(); 
    source.crossOrigin = 'Anonymous';
    source.onload = () => {
        let frameImg:any = document.getElementById('frame-img');
        this.canvasElement.width = frameImg.naturalWidth;
        this.canvasElement.height = frameImg.naturalHeight;

        overlayImage.scale = 1.1
        //draw source image
        //apply image angle if applied
        context.rotate(overlayImage.angle * Math.PI / 180);     
        //apply image scale if applied
        this.drawSourceImage();

        //reset angle for frame
        context.rotate(-overlayImage.angle * Math.PI / 180);
        //frame image
        context.drawImage(frameImg, 0, 0, frameImg.naturalWidth, frameImg.naturalHeight);
        //this.drawFrameImage();
        //this.drawText();

        this.finalImage = this.image = this.canvasElement.toDataURL(); 
    };
    source.src = this.image;
  }

  selectFrame(frame){
    this.currentFrame = 'assets/images/frames/'+frame;
  }

  getFrames(){
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
  toggleBottomSheet(){
    this.bottomSheetOpen = !this.bottomSheetOpen;
  }

  /*Camera & Gallery Option */
  pickImage(sourceType) {
    const options: CameraOptions = {
      quality: 50,
      sourceType: sourceType,
      destinationType: this.camera.DestinationType.DATA_URL,
      mediaType: this.camera.MediaType.PICTURE
    }
    this.camera.getPicture(options).then((imageData) => {
      //console.log('image data:',imageData);
      let base64Image = 'data:image/jpeg;base64,' + imageData;
      this.sourceImage = base64Image;
    }, (err) => {
      // Handle error
    });
  }

  getSelectedImage(ImagePath){
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
}
