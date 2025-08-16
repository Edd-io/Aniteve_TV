package com.aniteve_tv

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import android.view.KeyEvent
import android.net.wifi.WifiManager
import android.content.Context
import android.os.Bundle

import com.aniteve_tv.KeyEventModule

class MainActivity : ReactActivity() {

    private var multicastLock: WifiManager.MulticastLock? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        try {
            val wifi = applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
            multicastLock = wifi.createMulticastLock("aniteve_multicast_lock")
            multicastLock?.setReferenceCounted(true)
            multicastLock?.acquire()
        } catch (e: Exception) {
            // ignore - not critical
        }
    }

    override fun onDestroy() {
        try {
            multicastLock?.release()
            multicastLock = null
        } catch (e: Exception) {
            // ignore
        }
        super.onDestroy()
    }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "aniteve_tv"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun dispatchKeyEvent(event: KeyEvent): Boolean {
      if (event.action == KeyEvent.ACTION_DOWN) {
          
          if (isTextInputEvent(event)) {
              val handled = super.dispatchKeyEvent(event)
              if (!handled) {
                  KeyEventModule.sendKeyEvent(event.keyCode);
              }
              return handled
          } else {
              KeyEventModule.sendKeyEvent(event.keyCode);
              return true;
          }
      }
      return super.dispatchKeyEvent(event)
  }
  
  private fun isTextInputEvent(event: KeyEvent): Boolean {
      return when (event.keyCode) {
          KeyEvent.KEYCODE_DEL,
          KeyEvent.KEYCODE_ENTER,
          KeyEvent.KEYCODE_SPACE,
          in KeyEvent.KEYCODE_A..KeyEvent.KEYCODE_Z,
          in KeyEvent.KEYCODE_0..KeyEvent.KEYCODE_9
          -> true
          else -> {
              event.unicodeChar != 0 && event.unicodeChar != KeyEvent.KEYCODE_UNKNOWN
          }
      }
  }
}
