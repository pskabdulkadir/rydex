package com.example.magnetictreasure.util

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

object PermissionManager {

    private const val LOCATION_PERMISSION_REQUEST_CODE = 100
    private const val STORAGE_PERMISSION_REQUEST_CODE = 101

    // Gereken izinler
    private val LOCATION_PERMISSIONS = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        arrayOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION,
            Manifest.permission.ACCESS_BACKGROUND_LOCATION
        )
    } else {
        arrayOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION
        )
    }

    private val STORAGE_PERMISSIONS = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        arrayOf(
            Manifest.permission.READ_MEDIA_IMAGES,
            Manifest.permission.READ_MEDIA_VIDEO
        )
    } else {
        arrayOf(
            Manifest.permission.READ_EXTERNAL_STORAGE,
            Manifest.permission.WRITE_EXTERNAL_STORAGE
        )
    }

    /**
     * Konum izinlerinin verilip verilmediğini kontrol et
     */
    fun hasLocationPermission(context: Context): Boolean {
        return LOCATION_PERMISSIONS.all { permission ->
            ContextCompat.checkSelfPermission(context, permission) == PackageManager.PERMISSION_GRANTED
        }
    }

    /**
     * Konum izinleri iste
     */
    fun requestLocationPermission(activity: Activity) {
        if (!hasLocationPermission(activity)) {
            ActivityCompat.requestPermissions(
                activity,
                LOCATION_PERMISSIONS,
                LOCATION_PERMISSION_REQUEST_CODE
            )
        }
    }

    /**
     * Depolama izinlerinin verilip verilmediğini kontrol et
     */
    fun hasStoragePermission(context: Context): Boolean {
        return STORAGE_PERMISSIONS.all { permission ->
            ContextCompat.checkSelfPermission(context, permission) == PackageManager.PERMISSION_GRANTED
        }
    }

    /**
     * Depolama izinleri iste
     */
    fun requestStoragePermission(activity: Activity) {
        if (!hasStoragePermission(activity)) {
            ActivityCompat.requestPermissions(
                activity,
                STORAGE_PERMISSIONS,
                STORAGE_PERMISSION_REQUEST_CODE
            )
        }
    }

    /**
     * İzin isteme sonucunu işle
     */
    fun handlePermissionResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray,
        onLocationGranted: () -> Unit = {},
        onLocationDenied: () -> Unit = {},
        onStorageGranted: () -> Unit = {},
        onStorageDenied: () -> Unit = {}
    ) {
        when (requestCode) {
            LOCATION_PERMISSION_REQUEST_CODE -> {
                if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    onLocationGranted()
                } else {
                    onLocationDenied()
                }
            }
            STORAGE_PERMISSION_REQUEST_CODE -> {
                if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    onStorageGranted()
                } else {
                    onStorageDenied()
                }
            }
        }
    }

    /**
     * Gerekli tüm izinleri iste
     */
    fun requestAllPermissions(activity: Activity) {
        requestLocationPermission(activity)
        requestStoragePermission(activity)
    }

    /**
     * Tüm gerekli izinlerin verilip verilmediğini kontrol et
     */
    fun hasAllPermissions(context: Context): Boolean {
        return hasLocationPermission(context) && hasStoragePermission(context)
    }
}
