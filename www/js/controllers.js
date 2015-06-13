angular.module('starter.controllers', ['ngCordova'])

    .controller('LoginCtrl', function ($scope, $ionicModal, $state, PhotographerService) {
        closeAddModal = function () {
            if ($scope.modal)
                $scope.modal.hide();
            $state.go('events');

        };

        if (localStorage.getItem('photographer')) {
            closeAddModal();
            return;
        }
        // Form data for the login modal
        $scope.loginData = {};

        $scope.openLogin = function () {
            // Create the login modal that we will use later
            $ionicModal.fromTemplateUrl('templates/login.html', {
                scope: $scope
            }).then(function (modal) {
                $scope.modal = modal;
                $scope.modal.show();
            });
        };


        // Perform the login action when the user submits the login form
        $scope.doLogin = function () {
            $scope.msgError = "Loading...";
            PhotographerService.photographer($scope.loginData.uniqueId, $scope.loginData.password, function (data) {
                if (data == true) {
                    localStorage.setItem("photographer", $scope.loginData.uniqueId);
                    closeAddModal();
                }
                else {
                    $scope.msgError = "wrong password or unique Id";
                }
            });

        };

    })

    .controller('EventsCtrl', function ($scope, $state, $ionicHistory, $ionicNavBarDelegate, EventsService, ImagesToUpload, UploadedImages) {
        $scope.events = [];
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
        $ionicNavBarDelegate.showBackButton(false);

        EventsService.events().then(function (events) {
            $scope.events = events;
        });


        $scope.eventOptions = function () {
            $ionicNavBarDelegate.showBackButton(true);
            $state.go('events-options');
        };

        $scope.clearMemory = function () {
            ImagesToUpload.deleteAll();
            UploadedImages.deleteAll();
        };
//
    })

    .controller('EventOptionsCtrl', function ($scope, $ionicModal) {
        $scope.newEvent = function () {
            $ionicModal.fromTemplateUrl('templates/events/create-event.html', {
                scope: $scope
            }).then(function (modal) {
                $scope.modal = modal;
                $scope.modal.show();
            });
        };

        $scope.joinEvent = function () {
            $ionicModal.fromTemplateUrl('templates/events/old-event.html', {
                scope: $scope
            }).then(function (modal) {
                $scope.modal = modal;
                $scope.modal.show();
            });
        };

        $scope.eventData = {};

        $scope.closeAddModal = function () {
            $scope.modal.hide();
            $scope.eventData = {};

        };
    })

    .controller('JoinEventCtrl', function ($scope, $state, $cordovaToast, PhotographerService) {
        $scope.joinExistEvent = function () {
            console.log('join event', $scope.eventData);

            PhotographerService.joinEvent($scope.eventData.uniqueId).then(function () {
                $scope.closeAddModal();
                $state.go('events');
            }, function (err) {
                console.log(err);
                $cordovaToast.show('האירוע לא קיים', 'long', 'center');
            });
        }
    })

    .controller('AddEventCtrl', function ($scope, $state, EventsService) {

        $scope.addEvent = function () {
            console.log('add event', $scope.eventData);

            $scope.eventData.avatar = "http://placehold.it/100";
            EventsService.addEvent($scope.eventData).then(function () {
                $scope.closeAddModal();
                $state.go('events');
            });

        };
    })

    .controller('UploadImagesCtrl', function ($scope, $ionicPopup, $state, $ionicNavBarDelegate, $cordovaToast, event, CameraLoad, ImagesToUpload) {
        $ionicNavBarDelegate.showBackButton(true);
        $scope.eventId = event.eventId;

        var resetProgress = function (msg) {
            if(msg)
                $cordovaToast.show(msg, 'long', 'center');
            $scope.maxValue = 0;
            $scope.currentValue = 0;
        };
        resetProgress();
        $scope.imagesFromCamera = function () {

            function getDataFromImage(index) {
                if (index < $scope.inCameraimages.length) {
                    var fullImageUrl = $scope.inCameraimages[index];
                    CameraLoad.base64Converter(fullImageUrl).then(function (data) {
                        if ($scope.eventId != "events") {
                            ImagesToUpload.insertNewImage(fullImageUrl, $scope.eventId, data);
                        }
                        $scope.currentValue++;
                        getDataFromImage(++index);

                    }, function (error) {
                        console.log(error);
                        $scope.currentValue++;
                        getDataFromImage(++index);
                    });
                }
                else {
                    resetProgress("התמונות הועלו מהצלמה בהצלחה");
                }

            }

            CameraLoad.loadCameraImages().then(function (urls) {
                $scope.inCameraimages = urls;
                $scope.maxValue = urls.length;
                getDataFromImage(0);
            }, function () {
                alert("שים לב! אינך מחובר לרשת של הכרטיס זכרון");
            });
        };

        $scope.imagesToServer = function () {
            ImagesToUpload.count($scope.eventId).then(function (data) {
                $scope.maxValue = data["c"];

                CameraLoad.uploadImagesToServer().then(function (result) {
                    if(result){
                        resetProgress("אין תמונות חדשות, תעלה תמונות מהמצלמה");
                    }
                    else{
                    resetProgress("התמונות הועלו בהצלחה לשרת");

                    }
                }, function (error) {
                    resetProgress("שים לב שהינך מחובר לשרת האינטרנט");
                }, function () {
                    $scope.currentValue++;
                });
            });
        };

        $scope.stats = function () {
            $state.go('stats', { event: $scope.eventId });
        };

        $scope.calc = function () {
            return Math.round(parseInt($scope.currentValue) / parseInt($scope.maxValue) * 100);
        }

    })

    .controller('StatsCtrl', function ($scope, $stateParams, ImagesToUpload, UploadedImages, CameraLoad) {
        $scope.eventId = $stateParams.event;

        $scope.imagesToUploadCount = 0;
        $scope.inCameraimages = [];
        $scope.uplodedCount = 0;
        var config = {"header": {
            "title": {
                "text": "מצב העלאת תמונות",
                "fontSize": 24
            },
            "subtitle": {
                "text":$scope.eventId + " - מצב התמונות לאירוע " ,
                "color": "#999999",
                "fontSize": 12
            },
            "titleSubtitlePadding": 9
        },
            "footer": {
                "color": "#999999",
                "fontSize": 10,
                "font": "open sans",
                "location": "bottom-left"
            },
            "size": {
                "canvasHeight": Math.round(window.innerHeight * 100) / 100,
                "canvasWidth": Math.round(window.innerWidth * 100) / 100
            },
            "data": {
                "content": [
                    {
                        "label": "תמונות במצלמה",
                        "value": $scope.inCameraimages.length,
                        "color": "#2383c1"
                    },
                    {
                        "label": "תמונות בשרת",
                        "value": $scope.uplodedCount,
                        "color": "#64a61f"
                    },
                    {
                        "label": "תמונות בפלאפון",
                        "value": $scope.imagesToUploadCount,
                        "color": "#7b6788"
                    }
                ]
            },
            "labels": {
                "outer": {
                    "format": "none",
                    "pieDistance": 23
                },
                "inner": {
                    "format": "label-value2"
                },
                "mainLabel": {
                    "color": "#ffffff",
                    "fontSize": 11
                },
                "percentage": {
                    "color": "#ffffff",
                    "decimalPlaces": 0
                },
                "value": {
                    "color": "#adadad",
                    "fontSize": 11
                },
                "lines": {
                    "enabled": true,
                    "style": "straight"
                }
            },
            "effects": {
                "load": {
                    "speed": 400
                },
                "pullOutSegmentOnClick": {
                    "effect": "none",
                    "speed": 400,
                    "size": 8
                }
            },
            "misc": {
                "gradient": {
                    "enabled": true,
                    "percentage": 100
                }
            }
        };
        $scope.pie = new d3pie("pieChart", config);
        var onDataChanged = function () {
            var data = [
                {
                    "label": "תמונות במצלמה",
                    "value": $scope.inCameraimages.length,
                    "color": "#2383c1"
                },
                {
                    "label": "תמונות בשרת",
                    "value": $scope.uplodedCount,
                    "color": "#64a61f"
                },
                {
                    "label": "תמונות בפלאפון",
                    "value": $scope.imagesToUploadCount,
                    "color": "#7b6788"
                }
            ];
            $scope.pie.updateProp("data.content", data);
        };
        window.onresize = function () {
            $scope.refresh();
        };

        $scope.$watch('inCameraimages', onDataChanged);
        $scope.$watch('uplodedCount', onDataChanged);
        $scope.$watch('imagesToUploadCount', onDataChanged);

        $scope.refresh = function () {
            $scope.pie.updateProp("size.canvasHeight", Math.round(window.innerHeight * 100) / 100);
            $scope.pie.updateProp("size.canvasWidth", Math.round(window.innerWidth * 100) / 100);

            ImagesToUpload.count($scope.eventId).then(function (imagesToUploadCount) {
                $scope.imagesToUploadCount = parseInt(imagesToUploadCount["c"]);
            });

            UploadedImages.count($scope.eventId).then(function (uplodedCount) {
                $scope.uplodedCount = parseInt(uplodedCount["c"]);
            });

            CameraLoad.loadCameraImages().then(function (urls) {
                $scope.inCameraimages = urls;
            }, function () {

            });
        };
        $scope.refresh();
    });
