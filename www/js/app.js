// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.apiServices','starter.imageServices', 'starter.controllers'])

    .run(function ($ionicPlatform, DB) {
        $ionicPlatform.ready(function () {
        DB.init();
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    })

    .config(function ($stateProvider, $urlRouterProvider, $httpProvider) {
        delete $httpProvider.defaults.headers.common['X-Requested-With'];

        $stateProvider

            .state('login', {
                url: "/login",
                templateUrl: "templates/not-login-page.html",
                controller: 'LoginCtrl'
            })

            .state('events', {
                url: "/events",
                templateUrl: "templates/events/events.html",
                controller: 'EventsCtrl'
            })

            .state('events-options', {
                url: "/events-options",
                templateUrl: "templates/events/events-options.html",
                controller: 'EventOptionsCtrl'
            })

            .state('image-upload', {
                url: "/event/:event",
                templateUrl: "templates/image-upload.html",
                controller: 'UploadImagesCtrl',
                resolve: {
                    event: function ($stateParams, EventsService) {
                        return new EventsService.getEvent($stateParams.event);
                    }
                }
            })

            .state('stats', {
                url: "/stats/:event",
                templateUrl: "templates/stats.html",
                controller: 'StatsCtrl'
            });
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/login');
    });


