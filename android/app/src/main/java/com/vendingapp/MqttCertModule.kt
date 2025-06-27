package com.vendingapp

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.WritableNativeMap

import java.io.File
import java.io.FileOutputStream

class MqttCertModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "MqttCertModule"

    @ReactMethod
    fun copyCertFiles(promise: Promise) {
        try {
            val filenames = listOf(
                "ca1.pem.crt",
                "ca3.pem.crt",
                "cert.pem.crt",
                "private-key.pem.key"
            )

            val result = WritableNativeMap()
            val filesDir = reactApplicationContext.filesDir

            for (filename in filenames) {
                val inputStream = reactApplicationContext.assets.open(filename)
                val outFile = File(filesDir, filename)
                val outputStream = FileOutputStream(outFile)

                inputStream.copyTo(outputStream)

                inputStream.close()
                outputStream.close()

                result.putString(filename, outFile.absolutePath)
            }

            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("CERT_COPY_FAILED", "Failed to copy cert files", e)
        }
    }
}
