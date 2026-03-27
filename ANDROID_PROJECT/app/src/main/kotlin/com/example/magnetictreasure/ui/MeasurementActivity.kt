package com.example.magnetictreasure.ui

import android.content.ComponentName
import android.content.Intent
import android.content.ServiceConnection
import android.os.Bundle
import android.os.IBinder
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.magnetictreasure.R
import com.example.magnetictreasure.data.models.MeasurementDTO
import com.example.magnetictreasure.data.repository.MeasurementRepository
import com.example.magnetictreasure.service.LocationService
import com.example.magnetictreasure.service.MagnetometerService
import com.example.magnetictreasure.util.PermissionManager
import com.example.magnetictreasure.util.LocationManager
import kotlinx.coroutines.launch
import kotlin.math.sqrt

class MeasurementActivity : AppCompatActivity() {

    private lateinit var magnetometerService: MagnetometerService
    private var magnetometerBound = false

    private lateinit var locationService: LocationService
    private var locationBound = false

    private lateinit var locationManager: LocationManager
    private val repository = MeasurementRepository()

    private lateinit var textMagnitude: TextView
    private lateinit var textLocation: TextView
    private lateinit var textStatus: TextView
    private lateinit var btnStartStop: Button
    private lateinit var btnSave: Button

    private var isRecording = false
    private var currentLatitude = 0.0
    private var currentLongitude = 0.0

    private val magnetometerConnection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName, service: IBinder) {
            val binder = service as MagnetometerService.MagnetometerBinder
            magnetometerService = binder.getService()
            magnetometerBound = true
            observeMagnetometerData()
        }

        override fun onServiceDisconnected(name: ComponentName) {
            magnetometerBound = false
        }
    }

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
        setContentView(R.layout.activity_measurement)

        // UI bileşenleri
        textMagnitude = findViewById(R.id.text_magnitude)
        textLocation = findViewById(R.id.text_location)
        textStatus = findViewById(R.id.text_status)
        btnStartStop = findViewById(R.id.btn_start_stop)
        btnSave = findViewById(R.id.btn_save)

        locationManager = LocationManager(this)

        // İzinleri kontrol et
        if (!PermissionManager.hasLocationPermission(this)) {
            PermissionManager.requestLocationPermission(this)
        }

        // Buton dinleyicileri
        btnStartStop.setOnClickListener {
            if (isRecording) {
                stopRecording()
            } else {
                startRecording()
            }
        }

        btnSave.setOnClickListener {
            saveMeasurements()
        }

        // Servisleri başlat
        startServices()
    }

    private fun startServices() {
        // Magnetometre servisi
        val magnetometerIntent = Intent(this, MagnetometerService::class.java)
        bindService(magnetometerIntent, magnetometerConnection, BIND_AUTO_CREATE)
        startService(magnetometerIntent)

        // Konum servisi
        val locationIntent = Intent(this, LocationService::class.java)
        bindService(locationIntent, locationConnection, BIND_AUTO_CREATE)
        startService(locationIntent)
    }

    private fun startRecording() {
        if (!PermissionManager.hasLocationPermission(this)) {
            Toast.makeText(this, "Konum izni gerekli", Toast.LENGTH_SHORT).show()
            return
        }

        isRecording = true
        btnStartStop.text = "Kaydı Durdur"
        textStatus.text = "Kaydetme başlatıldı..."

        if (magnetometerBound) {
            magnetometerService.startListening()
        }
        if (locationBound) {
            locationService.startListening()
        }
    }

    private fun stopRecording() {
        isRecording = false
        btnStartStop.text = "Kaydı Başlat"
        textStatus.text = "Kaydetme durduruldu"

        if (magnetometerBound) {
            magnetometerService.stopListening()
        }
        if (locationBound) {
            locationService.stopListening()
        }
    }

    private fun observeMagnetometerData() {
        lifecycleScope.launch {
            magnetometerService.readingFlow.collect { reading ->
                if (reading != null && isRecording) {
                    textMagnitude.text = String.format(
                        "Manyetik Alan: %.2f μT\nX: %.2f Y: %.2f Z: %.2f",
                        reading.magnitude, reading.x, reading.y, reading.z
                    )
                }
            }
        }
    }

    private fun observeLocationData() {
        lifecycleScope.launch {
            locationService.locationFlow.collect { location ->
                if (location != null && isRecording) {
                    currentLatitude = location.latitude
                    currentLongitude = location.longitude

                    textLocation.text = String.format(
                        "Konum: %.4f, %.4f\nDoğruluk: %.1f m",
                        location.latitude, location.longitude, location.accuracy
                    )
                }
            }
        }
    }

    private fun saveMeasurements() {
        lifecycleScope.launch {
            try {
                val reading = magnetometerService.readingFlow.value ?: return@launch
                val location = locationService.locationFlow.value ?: return@launch

                val measurement = MeasurementDTO(
                    timestamp = System.currentTimeMillis(),
                    latitude = location.latitude,
                    longitude = location.longitude,
                    magneticX = reading.x,
                    magneticY = reading.y,
                    magneticZ = reading.z,
                    magnitude = reading.magnitude,
                    accuracy = location.accuracy,
                    altitude = location.altitude
                )

                val result = repository.saveMeasurement(measurement)
                result.onSuccess {
                    Toast.makeText(this@MeasurementActivity, "Başarıyla kaydedildi: $it", Toast.LENGTH_SHORT).show()
                    textStatus.text = "Ölçüm kaydedildi"
                }
                result.onFailure { error ->
                    Toast.makeText(this@MeasurementActivity, "Hata: ${error.message}", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this, "Hata: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        PermissionManager.handlePermissionResult(
            requestCode, permissions, grantResults,
            onLocationGranted = {
                Toast.makeText(this, "Konum izni verildi", Toast.LENGTH_SHORT).show()
            },
            onLocationDenied = {
                Toast.makeText(this, "Konum izni reddedildi", Toast.LENGTH_SHORT).show()
            }
        )
    }

    override fun onDestroy() {
        super.onDestroy()
        if (magnetometerBound) {
            unbindService(magnetometerConnection)
        }
        if (locationBound) {
            unbindService(locationConnection)
        }
    }
}
