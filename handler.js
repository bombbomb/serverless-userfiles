'use strict';

var AWS = require('aws-sdk');
var s3 = new AWS.S3();

function genBucketName(stage) {
    return stage + ".userfiles.bombbomb.com";
}

module.exports.list = function (event, context, cb) {
    console.log(event);
    s3.listObjects({Bucket: genBucketName(event.stage)}, function(err, data){
        console.log(err, data);
        cb(null, data);
    });
};

module.exports.sign = function (event, context, cb) {

    console.log(event);

    var key = event.principalId + '/' + event.path.filename;

    var params = {
        Bucket: genBucketName(event.stage),
        ACL: 'public-read',
        Key: key
    };

    console.log(params);

    s3.getSignedUrl('putObject', params, function (err, url) {
        console.log(err, url);
        cb(null, url);
    });
};


module.exports.auth = function (event, context, cb) {

    console.log(event);

    var jwt = require('jsonwebtoken');
    var fs = require('fs');
    var cert = fs.readFileSync('public.pem');

    jwt.verify(event.authorizationToken, cert, { audience: 'BBApp' }, function(err, decoded) {
        console.log(err, decoded);

        if (err) {
            context.fail("Unauthorized");
        } else {
            context.succeed(generatePolicy(decoded.sub, 'Allow', event.methodArn));
        }

    });

    var generatePolicy = function(principalId, effect, resource) {
        var authResponse = {};
        authResponse.principalId = principalId;
        if (effect && resource) {
            var policyDocument = {};
            policyDocument.Version = '2012-10-17'; // default version
            policyDocument.Statement = [];
            var statementOne = {};
            statementOne.Action = 'execute-api:Invoke'; // default action
            statementOne.Effect = effect;
            statementOne.Resource = resource;
            policyDocument.Statement[0] = statementOne;
            authResponse.policyDocument = policyDocument;
        }
        return authResponse;
    }

};