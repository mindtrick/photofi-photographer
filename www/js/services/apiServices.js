/**
 * Created by 758orenh on 1/15/2015.
 */
var apiUrl = 'https://prod-photofi.rhcloud.com';
//apiUrl = 'http://localhost:8080';
angular.module('starter.apiServices', ['starter.dbServices'])

    .factory('PhotographerService', function ($http, $q, HttpRequestHash) {
        var self = this;

        self.photographer = function (id, password, fn) {
            this.initialize = function (id, password, fn) {
                var url = '/photographer/' + id + "/" + password;
                var new_url = HttpRequestHash.createHash(url);
                var photographerData = $http.get(new_url);

                photographerData.then(function (response) {
                    fn(response.data);
                });
            };

            this.initialize(id, password, fn);
        };

        self.joinEvent = function (eventId) {
            var url = '/photographerjoinevent/' + localStorage.getItem('photographer') + "/" + eventId,
                new_url = HttpRequestHash.createHash(url),
                deffer = $q.defer();

            $http.get(new_url).then(function (response) {
                if (!response.data.type) {
                    deffer.reject(response.data.data);
                }
                else {
                    deffer.resolve();
                }
            }, function (err) {
                deffer.reject(err);
            });

            return deffer.promise;
        };

        // Return a reference to the function
        return self;
    })

    .factory('EventsService', function ($http, $q, ImagesToUpload, HttpRequestHash) {

        var obj = this;

        var fromLocalStorage = function () {
            var events = JSON.parse(localStorage.getItem('events'));
            if (!events) {
                events = {};
            }
            return events;
        };

        obj.events = function () {


            var url = '/photographer/' + localStorage.getItem('photographer'),
                new_url = HttpRequestHash.createHash(url),
                deffer = $q.defer();

            $http.get(new_url).then(function (response) {
                var events = response.data["data"]["Events"];
                if (events.length > 0) {
                    var url = '/events/' + events.join(',');
                    var new_url = HttpRequestHash.createHash(url);
                    $http.get(new_url).then(function (response) {

                        var events = {};
                        angular.forEach(response.data["data"], function(event){
                            events[event.eventId] = event;
                        });

                        localStorage.setItem('events', JSON.stringify(events));
                        deffer.resolve(response.data["data"]);
                    });
                }
            }, function (error) {
                deffer.resolve(fromLocalStorage());
            });

            return deffer.promise;
        };

        obj.getEvent = function (id) {
            return fromLocalStorage()[id];
        };

        obj.addEvent = function (event) {
            var url = '/events';
            var photographerId = localStorage.getItem('photographer');
            var body = {event: event, photographerId: photographerId};
            var new_url = HttpRequestHash.createHash(url, body);
            var result = $http.post(new_url, JSON.stringify(body));
            return result;
        };

        obj.addImages = function (imageUrl) {
            var deffer = $q.defer();
            ImagesToUpload.getById(imageUrl).then(function (image) {
                var url = '/event/' + image['eventId'] + "/image";
                var new_url = HttpRequestHash.createHash(url, image);
                $http.post(new_url, JSON.stringify(image)).then(function (data) {
                        if (data["data"]["type"]) {
                            deffer.resolve(image);
                        }
                        else {
                            deffer.reject("logical error")
                        }
                    },
                    function (data) {
                        deffer.reject("error while trying to post")
                    });
            });
            return deffer.promise;
        };
        // Return a reference to the function
        return obj;

    })

    .factory('HttpRequestHash', function () {

        var key = "Photofi.,-K3y-4_different=httprequests";

        var CreateHash = function (url, body) {
            var jsonBody = JSON.stringify(body);
            var text = jsonBody ? url + jsonBody : url;
            var hash = CryptoJS.HmacSHA1(text, key).toString(CryptoJS.enc.Hex);
            if (url.indexOf('?') == -1) {
                return apiUrl + url + '?hash=' + hash;
            }
            else {
                return apiUrl + url + '&hash=' + hash;
            }
        };

        return {
            createHash: (CreateHash)
        }
    });
