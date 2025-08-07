package com.aniteve_tv

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule

class KeyEventModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    companion object {
        private var instance: KeyEventModule? = null
        private val eventQueue = mutableListOf<Int>()
        
        fun sendKeyEvent(keyCode: Int) {
            instance?.let { module ->
                module.emitKeyEvent(keyCode)
            } ?: run {
                eventQueue.add(keyCode)
            }
        }
    }
    
    init {
        instance = this
        if (eventQueue.isNotEmpty()) {
            eventQueue.forEach { keyCode ->
                emitKeyEvent(keyCode)
            }
            eventQueue.clear()
        }
    }

    override fun getName(): String = "KeyEventModule"

    private fun emitKeyEvent(keyCode: Int) {
        val params = Arguments.createMap().apply {
            putInt("keyCode", keyCode)
            putDouble("timestamp", System.currentTimeMillis().toDouble())
        }
        
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            ?.emit("keyPressed", params)
    }
    
    @ReactMethod
    fun getLastKeyEvent(callback: Callback) {
        callback.invoke("No pending events")
    }
}
