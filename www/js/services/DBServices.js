angular.module('starter.dbServices', ['starter.config'])

    .factory('DB', function ($q, DB_CONFIG) {
        var self = this;
        self.db = null;

        self.init = function () {
            if (window.sqlitePlugin) {
                self.db = window.sqlitePlugin.openDatabase({name: DB_CONFIG.name});// in production
            }
            else {
                self.db = window.openDatabase(DB_CONFIG.name, '1.0', 'database', -1);
            }
            console.log("init db");
            angular.forEach(DB_CONFIG.tables, function (table) {
                var columns = [];

                angular.forEach(table.columns, function (column) {
                    columns.push(column.name + ' ' + column.type);
                });

                var query = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + columns.join(',') + ')';
                self.query(query).then(function () {
                    console.log('Table ' + table.name + ' initialized');
                });

                var indexQuery = 'CREATE INDEX IF NOT EXISTS MyUnique' + table.name + ' ON ' + table.name + ' (eventId)'
                self.query(indexQuery).then(function () {
                    console.log('index for ' + table.name + ' initialized');
                });
            });


        };

        self.query = function (query, bindings) {
            bindings = typeof bindings !== 'undefined' ? bindings : [];
            var deferred = $q.defer();
//            console.log("deferred");
            self.db.transaction(function (transaction) {
//                console.log("open transaction");
                transaction.executeSql(query, bindings, function (transaction, result) {
//                    console.log("success");
                    deferred.resolve(result);
                }, function (transaction, error) {
                    console.log("inside query", error, transaction);
                    deferred.reject(error);
                });
            });

            return deferred.promise;
        };

        self.fetchAll = function (result) {
            var output = [];
//            console.log("inside fetcha all");
            for (var i = 0; i < result.rows.length; i++) {
                output.push(result.rows.item(i));
            }

            return output;
        };

        self.fetch = function (result) {
            return result.rows.item(0);
        };

        return self;
    })
// Resource service example
    .factory('ImagesToUpload', function (DB) {
        var self = this;

        self.all = function () {
//            console.log("fetching all");
            return DB.query('SELECT fullImageUrl FROM imagesToUpload')
                .then(function (result) {
                    console.log("results", result);
                    return DB.fetchAll(result);
                });
        };

        self.getById = function (id) {
            return DB.query("SELECT * FROM imagesToUpload WHERE fullImageUrl=?", [id["fullImageUrl"]])
                .then(function (result) {
                    return DB.fetchAll(result)[0];
                });
        };

        self.insertNewImage = function (fullImageUrl, eventId, imageData) {
//            console.log("insertNewImage");
            DB.query("insert into imagesToUpload values (?,?,?)", [fullImageUrl, eventId, imageData])
                .then(function (result) {
                    console.log("reuslt:", result);
                });
        };

        self.deleteAll = function () {
            DB.query("delete from imagesToUpload");
        };

        self.deleteImage = function (fullImageUrl) {
            DB.query("delete from imagesToUpload where fullImageUrl= ?", [fullImageUrl])
                .then(function (result) {
                    console.log(result);
                });
        };

        self.selectIds = function () {
            return DB.query('SELECT fullImageUrl FROM imagesToUpload')
                .then(function (result) {
                    var array = DB.fetchAll(result);
                    var compressed = [];
                    for (var i = 0; i < array.length; i++) {
                        compressed.push(array[i]["fullImageUrl"]);
                    }
                    return compressed;
                });
        };

        self.count = function (eventId) {
            return DB.query('SELECT count(*) as c FROM imagesToUpload where eventId=?', [eventId])
                .then(function (result) {
                    return DB.fetch(result);
                });
        };

        return self;
    })

    .factory('UploadedImages', function (DB) {
        var self = this;

        self.all = function () {
            return DB.query('SELECT * FROM uploadedImages')
                .then(function (result) {
                    return DB.fetchAll(result);
                });
        };

        self.getById = function (id) {
            return DB.query("SELECT * FROM uploadedImages WHERE fullImageUrl = ?", [id])
                .then(function (result) {
                    return DB.fetch(result);
                });
        };

        self.insertNewImage = function (fullImageUrl, eventId) {
            DB.query("insert into uploadedImages values (?,?)", [fullImageUrl, eventId])
                .then(function (result) {
                    console.log(result);
                });
        };
        self.deleteAll = function () {
            DB.query("delete from uploadedImages");
        };
        self.deleteImage = function (fullImageUrl) {
            DB.query("delete from uploadedImages where fullImageUrl= ?", [fullImageUrl])
                .then(function (result) {
                    console.log(result);
                });
        };

        self.selectIds = function () {
            return DB.query('SELECT fullImageUrl FROM uploadedImages')
                .then(function (result) {
                    var array = DB.fetchAll(result);
                    var compressed = [];
                    for (var i = 0; i < array.length; i++) {
                        compressed.push(array[i]["fullImageUrl"]);
                    }
                    return compressed;
                });
        };

        self.count = function (eventId) {
            return DB.query('SELECT count(*) as c FROM uploadedImages where eventId= ?', [eventId])
                .then(function (result) {
                    return DB.fetch(result);
                });
        };

        return self;
    });