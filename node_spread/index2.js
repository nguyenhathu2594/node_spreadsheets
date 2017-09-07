var async = require('async');

async.waterfall([
    myFirstFunction
    //mySecondFunction.
    // myLastFunction,
], function (err, result) {
    console.log(result);
});
function myFirstFunction(callback) {
    callback(null, 'one', 'two');
}
function mySecondFunction(arg1, arg2, callback) {
    // arg1 now equals 'one' and arg2 now equals 'two'
    callback(null, 'three');
}
function myLastFunction(arg1, callback) {
    // arg1 now equals 'three'
    callback(null, 'done');
}