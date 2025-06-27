package com.vendingapp

import android.app.ActivityManager
import android.app.Service
import android.content.Intent
import android.os.IBinder
import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.os.Build
import android.util.Log

class KioskModeService : Service() {

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val dpm = getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
        val componentName = ComponentName(this, MyDeviceAdminReceiver::class.java)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            if (dpm.isDeviceOwnerApp(packageName)) {
                val packages = arrayOf(packageName)
                dpm.setLockTaskPackages(componentName, packages)

                val intent = Intent(this, MainActivity::class.java).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                startActivity(intent)

                Log.d("KioskMode", "Kiosk mode started")
            } else {
                Log.e("KioskMode", "App is not device owner")
            }
        }

        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
