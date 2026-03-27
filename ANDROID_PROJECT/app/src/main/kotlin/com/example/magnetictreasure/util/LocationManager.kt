package com.example.magnetictreasure.util

import android.content.Context
import android.content.Intent
import android.location.Location
import androidx.core.content.ContextCompat
import com.example.magnetictreasure.service.LocationService
import com.example.magnetictreasure.service.GPSLocation
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch

class LocationManager(private val context: Context) {

    private var locationService: LocationService? = null
    private var isBound = false

    /**
     * Konum servisi başlat
     */
    fun startLocationUpdates() {
        if (!PermissionManager.hasLocationPermission(context)) {
            return
        }

        try {
            // Service'i başlat
            val intent = Intent(context, LocationService::class.java)
            ContextCompat.startForegroundService(context, intent)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    /**
     * Konum servisi durdur
     */
    fun stopLocationUpdates() {
        try {
            val intent = Intent(context, LocationService::class.java)
            context.stopService(intent)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    /**
     * Son bilinen konumu al
     */
    fun getLastKnownLocation(): GPSLocation? {
        return locationService?.getLastLocation()
    }

    /**
     * Konum akışını takip et
     */
    fun observeLocationUpdates(
        scope: CoroutineScope,
        onLocationUpdate: (GPSLocation) -> Unit
    ) {
        scope.launch {
            locationService?.locationFlow?.collect { location ->
                if (location != null) {
                    onLocationUpdate(location)
                }
            }
        }
    }

    /**
     * Dinleme durumunu kontrol et
     */
    fun isListening(): Boolean {
        return locationService?.isListeningFlow?.value == true
    }

    /**
     * Hızlı konum önbelleği (son GPS konumu)
     */
    private var cachedLocation: GPSLocation? = null

    fun setCachedLocation(location: GPSLocation) {
        cachedLocation = location
    }

    fun getCachedLocation(): GPSLocation? {
        return cachedLocation
    }

    /**
     * Konumlar arasındaki mesafeyi hesapla (metre)
     */
    fun calculateDistance(
        lat1: Double,
        lon1: Double,
        lat2: Double,
        lon2: Double
    ): Float {
        val results = FloatArray(1)
        Location.distanceBetween(lat1, lon1, lat2, lon2, results)
        return results[0]
    }
}
