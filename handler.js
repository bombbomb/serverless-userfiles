'use strict';

var AWS = require('aws-sdk');
var s3 = new AWS.S3();

var bucket = 'userfiles.bombbomb.com';

module.exports.list = function (event, context, cb) {

    s3.listObjects({Bucket: bucket}, function(err, data){
        console.log(err, data);
        cb(null, data);
    });

};

module.exports.sign = function (event, context, cb) {

    var userId = 'candy';

    var params = {Bucket: bucket, Key: userId + '/' + event.path.filename};
    s3.getSignedUrl('putObject', params, function (err, url) {
        cb(null, url);
    });

};