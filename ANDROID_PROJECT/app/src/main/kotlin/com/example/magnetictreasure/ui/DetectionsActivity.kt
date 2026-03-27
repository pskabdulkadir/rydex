package com.example.magnetictreasure.ui

import android.content.ComponentName
import android.content.Intent
import android.content.ServiceConnection
import android.os.Bundle
import android.os.IBinder
import android.widget.Button
import android.widget.ListView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.magnetictreasure.R
import com.example.magnetictreasure.data.repository.MeasurementRepository
import com.example.magnetictreasure.service.MagnetometerService
import kotlinx.coroutines.launch

class DetectionsActivity : AppCompatActivity() {

    private lateinit var magnetometerService: MagnetometerService
    private var magnetometerBound = false
    private lateinit var listView: ListView
    private lateinit var btnRefresh: Button
    private val repository = MeasurementRepository()

    private val magnetometerConnection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName, service: IBinder) {
            val binder = service as MagnetometerService.MagnetometerBinder
            magnetometerService = binder.getService()
            magnetometerBound = true
            observeDetections()
        }

        override fun onServiceDisconnected(name: ComponentName) {
            magnetometerBound = false
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_detections)

        listView = findViewById(R.id.detections_list)
        btnRefresh = findViewById(R.id.btn_refresh)

        btnRefresh.setOnClickListener {
            refreshDetections()
        }

        // Magnetometre servisi
        val intent = Intent(this, MagnetometerService::class.java)
        bindService(intent, magnetometerConnection, BIND_AUTO_CREATE)
        startService(intent)
    }

    private fun observeDetections() {
        lifecycleScope.launch {
            magnetometerService.detectionsFlow.collect { detections ->
                updateDetectionsList(detections.map { it.toString() })
            }
        }
    }

    private fun refreshDetections() {
        lifecycleScope.launch {
            try {
                val result = repository.getDetections()
                result.onSuccess { detections ->
                    Toast.makeText(this@DetectionsActivity, "${detections.size} tespit bulundu", Toast.LENGTH_SHORT).show()
                    updateDetectionsList(detections.map { 
                        "Lat: ${it.latitude}, Lon: ${it.longitude}\nMagnitude: ${it.magnitude} μT"
                    })
                }
                result.onFailure { error ->
                    Toast.makeText(this@DetectionsActivity, "Hata: ${error.message}", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@DetectionsActivity, "Hata: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun updateDetectionsList(items: List<String>) {
        val adapter = android.widget.ArrayAdapter(
            this,
            android.R.layout.simple_list_item_1,
            items
        )
        listView.adapter = adapter
    }

    override fun onDestroy() {
        super.onDestroy()
        if (magnetometerBound) {
            unbindService(magnetometerConnection)
        }
    }
}
