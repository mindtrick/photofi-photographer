angular.module('starter.config', [])
    .constant('DB_CONFIG', {
        name: 'DB-photofi',
        tables: [
            {
                name: 'imagesToUpload',
                columns: [
                    {name: 'fullImageUrl', type: 'text primary key'},
                    {name: 'eventId', type: 'text'},
                    {name: 'imageData', type: 'text'}
                ]
            },
            {
                name: 'uploadedImages',
                columns: [
                    {name: 'fullImageUrl', type: 'text primary key'},
                    {name: 'eventId', type: 'text'}
                ]
            }

        ]
    });