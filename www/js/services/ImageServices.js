angular.module('starter.imageServices', [])

    .factory('CameraLoad', function ($q, $http, $ionicPopup, UploadedImages, ImagesToUpload, EventsService) {
        var self = this;
        var imageSource = "http://flashair/command.cgi?op=100&DIR=/DCIM";

        function mock(deferred, times) {
            var arr = [];
            for (var i = 1; i < times; i++) {
                arr.push('http://placehold.it/' + (500 + (10 * i)));
            }
            deferred.resolve(arr);
        }

        // recursive function which go through all the files and return them
        function getFiles(defferer, dirURL, imagesIds, uploadedImagesIds) {
            var path = "http://flashair/DCIM/",
                promise = $q.defer();

            $.ajax({url: dirURL}).success(function (data) {
                var files = data.split('\n');
                files = files.slice(1, files.length - 1);
                var dirs = [], newfilesUrls = [];
                angular.forEach(files, function (fileMetadata) {
                    var metadataPieces = fileMetadata.split(','),
                        isDir = metadataPieces[2] == '0',
                        newURL = dirURL + '/' + metadataPieces[1];
                    if (isDir) {
                        dirs.push(newURL);
                    }
                    else {
                        var relativePath = newURL.split('/DCIM/')[1];
                        // check if the image is already exists
                        if (relativePath.indexOf('.MOV') == -1 && relativePath.indexOf('.AVI') == -1 &&
                            imagesIds.indexOf(path + relativePath) == -1) {

                            if (uploadedImagesIds.indexOf(path + relativePath) == -1) {
                                newfilesUrls.push(path + relativePath);
                            }
                        }
                    }
                });
                var ps = [];
                angular.forEach(dirs, function (dirUrl) {
                    ps.push(getFiles(defferer, dirUrl, imagesIds, uploadedImagesIds));
                });
                $q.all(ps).then(function (urls) {
                    urls.push(newfilesUrls);
                    var merged = [];
                    merged = merged.concat.apply(merged, urls);
                    promise.resolve(merged);
                })
            }).error(function (error) {
//                alert(JSON.stringify(error));
                defferer.reject({
                    err: error,
                    msg: 'You are not connected to photofi WiFi'
                });
            });

            return promise.promise;
        }

        self.loadCameraImages = function () {
            var deferred = $q.defer();

            UploadedImages.selectIds().then(function (uploadedImagesIds) {
                return ImagesToUpload.selectIds().then(function (imagesIds) {
//                    mock(deferred,20);
                    getFiles(deferred, imageSource, imagesIds, uploadedImagesIds).then(function (urls) {
                        deferred.resolve(urls)
                    });

                });
            });

            return deferred.promise;
        };

        self.maxSize = 500.0;
        self.base64Converter = function (url) {
            var deffer = $q.defer();
            var img = new Image();
            img.setAttribute('crossOrigin', 'anonymous');
            img.onload = function () {
                console.log("image done loading");
                var canvas = document.createElement('canvas'),
                    width = img.width,
                    height = img.height;
                if (width > height) {
                    if (width > self.maxSize) {
                        height *= self.maxSize / width;
                        width = self.maxSize;
                    }
                } else {
                    if (height > self.maxSize) {
                        width *= self.maxSize / height;
                        height = self.maxSize;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(img, 0, 0, width, height);

                var dataURL = canvas.toDataURL("image/jpg", 0.8);
                // send the base64 of the image content
                deffer.resolve(dataURL.replace(/^data:image\/(png|jpg);base64,/, ""));
            };
            img.onerror = function () {
                deffer.reject();
            };
            img.src = url;
            return deffer.promise;
        };

        self.uploadImagesToServer = function () {
            var isPopedUp = false,
                deffer = $q.defer();
            var howmanyreturnresults = 0;
            ImagesToUpload.all().then(function (images) {
                if (images.length != 0) {
                    console.log("images returned", images.length);
                    function notifyNewimageSavedSuccessfuly() {
                        deffer.notify(images.length);
                        howmanyreturnresults++;
                        if (howmanyreturnresults == images.length) {
                            deffer.resolve();
                        }
                    }

                    function sendImageToServer(index) {

                        if (index < images.length) {
                            var imageUrl = images[index];
                            EventsService.addImages(imageUrl).then(function (image) {
                                ImagesToUpload.deleteImage(image.fullImageUrl);
                                UploadedImages.insertNewImage(image.fullImageUrl, image.eventId, image.thumbnailUrl);
                                notifyNewimageSavedSuccessfuly();
                            }, function (error) {
                                console.log(error);
                                if (isPopedUp == false) {
                                    isPopedUp = true;
                                    $ionicPopup.alert({
                                        title: 'העלאה נכשלה',
                                        template: 'אחת או יותר מהתמונות לא הועלו, תבדוק את החיבור לאינטרנט שלך'
                                    });
                                }
                                notifyNewimageSavedSuccessfuly();
                            });
                            setTimeout(function () {
                                var newindex = index + 1;
                                sendImageToServer(newindex);
                            }, 200);
                        }
                        else {

                        }
                    }

                    sendImageToServer(0);
                }
                else {
                    deffer.resolve(true);
                }
            });

            return deffer.promise;
        };

        return self;
    });