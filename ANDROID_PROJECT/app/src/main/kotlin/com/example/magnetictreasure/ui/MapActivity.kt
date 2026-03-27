package com.example.magnetictreasure.ui

import android.content.ComponentName
import android.content.Intent
import android.content.ServiceConnection
import android.os.Bundle
import android.os.IBinder
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.magnetictreasure.R
import com.example.magnetictreasure.service.LocationService
import com.example.magnetictreasure.util.PermissionManager
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.SupportMapFragment
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.MarkerOptions
import kotlinx.coroutines.launch

class MapActivity : AppCompatActivity() {

    private lateinit var locationService: LocationService
    private var locationBound = false
    private var googleMap: GoogleMap? = null

    private val locationConnection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName, service: IBinder) {
            val binder = service as LocationService.LocationBinder
            locationService = binder.getService()
            locationBound = true
            observeLocationData()
        }

        override fun onServiceDisconnected(name: ComponentName) {
            locationBound = false
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_map)

        // İzinleri kontrol et
        if (!PermissionManager.hasLocationPermission(this)) {
            PermissionManager.requestLocationPermission(this)
        }

        // Harita fragment'i
        val mapFragment = supportFragmentManager
            .findFragmentById(R.id.map) as? SupportMapFragment
        mapFragment?.getMapAsync { map ->
            googleMap = map
            setupMap()
        }

        // Konum servisi
        val intent = Intent(this, LocationService::class.java)
        bindService(intent, locationConnection, BIND_AUTO_CREATE)
        startService(intent)
    }

    private fun setupMap() {
        googleMap?.apply {
            mapType = GoogleMap.MAP_TYPE_NORMAL
            uiSettings.isZoomControlsEnabled = true
            uiSettings.isCompassEnabled = true
        }
    }

    private fun observeLocationData() {
        lifecycleScope.launch {
            locationService.locationFlow.collect { location ->
                if (location != null && googleMap != null) {
                    val latLng = LatLng(location.latitude, location.longitude)

                    // Kamera konumunu güncelle
                    googleMap?.animateCamera(CameraUpdateFactory.newLatLngZoom(latLng, 15f))

                    // İşaretçi ekle
                    googleMap?.addMarker(
                        MarkerOptions()
                            .position(latLng)
                            .title("Mevcut Konum")
                            .snippet("Doğruluk: ${location.accuracy}m")
                    )
                }
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        if (locationBound) {
            unbindService(locationConnection)
        }
    }
}
