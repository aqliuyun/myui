(function (lib,$) {
    navigator.getUserMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;
    var Camera = libs.Class.define({
        __constructor:function(options){
            this.options = options;
            this.width = options.width;
            this.height = options.height;
            this.video = options.video;
            if (this.checkSupport()) {
                this.video.width = this.width;
                this.video.height = this.height;
            }
        },
        checkSupport:function(){
            if (navigator.getUserMedia) {
                navigator.getUserMedia({
                    video: true
                }, function (stream) {
                    this.video.src = window.URL.createObjectURL(stream);
                    this.localstream = stream;
                }, function (e) {
                    console.log('没有权限访问摄像头，或摄像头被占用，请检查设备状态！');
                });
            }
            else {
                console.log('不支持!');
            }
        },
        //照相
        photo: function () {
            var canvas = document.createElement('canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, width, height);
            return canvas.toDataURL('image/jpeg');
        },
        //裁剪图片
        clip: function (img, x, y, w, h) {
            var canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
            return canvas.toDataURL('image/jpeg');
        },
        //图片数据
        data: function (data) {
            var result = data.replace('data:image/jpeg;base64,', '');
            return result;
        },
        //保存
        save: function () {
            var url = this.photo().replace('image/jpeg', 'image/octet-stream;');
            location.href = url;
        }
    });   
    libs.Widgets.Camera = Camera; 
})(myui,jQuery);