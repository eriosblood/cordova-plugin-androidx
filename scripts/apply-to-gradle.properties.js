var PLUGIN_NAME = "cordova-plugin-androidx";
var enableAndroidX = "android.useAndroidX=true";
var javaHeapSpace = "org.gradle.jvmargs=-Xmx2g -XX:MaxMetaspaceSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8";
var daemon = "org.gradle.daemon=true";
var parallel = "org.gradle.parallel=true";
var onDemand = "org.gradle.configureondemand=true";
var gradlePropertiesPath = "./platforms/android/gradle.properties";

var deferral, fs, path;

function log(message) {
    console.log(PLUGIN_NAME + ": " + message);
}

function onError(error) {
    log("ERROR: " + error);
    deferral.resolve();
}

function run() {
    try {
        fs = require('fs');
        path = require('path');
    } catch (e) {
        throw("Failed to load dependencies: " + e.toString());
    }

    var gradleProperties = fs.readFileSync(gradlePropertiesPath);

    if (gradleProperties) {
        var updatedGradleProperties = false;
        gradleProperties += "\n" + javaHeapSpace;
        gradleProperties += "\n" + daemon;
        gradleProperties += "\n" + parallel;
        gradleProperties += "\n" + onDemand;
        gradleProperties = gradleProperties.toString();
        if(!gradleProperties.match(enableAndroidX)){
            gradleProperties += "\n" + enableAndroidX;
            updatedGradleProperties = true;
        }
        if(!gradleProperties.match(enableJetifier)){
            gradleProperties += "\n" + enableJetifier;
            updatedGradleProperties = true;
        }
        if(updatedGradleProperties){
            fs.writeFileSync(gradlePropertiesPath, gradleProperties, 'utf8');
            log("Updated gradle.properties to enable AndroidX");
        }
    }else{
        log("gradle.properties file not found!")
    }
    deferral.resolve();
}

function attempt(fn) {
    return function () {
        try {
            fn.apply(this, arguments);
        } catch (e) {
            onError("EXCEPTION: " + e.toString());
        }
    }
}

module.exports = function (ctx) {
    try{
        deferral = require('q').defer();
    }catch(e){
        e.message = 'Unable to load node module dependency \'q\': '+e.message;
        log(e.message);
        throw e;
    }
    attempt(run)();
    return deferral.promise;
};
