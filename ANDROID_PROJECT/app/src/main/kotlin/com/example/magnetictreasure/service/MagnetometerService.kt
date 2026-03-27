package com.example.magnetictreasure.service

import android.app.Service
import android.content.Intent
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Binder
import android.os.IBinder
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlin.math.sqrt

data class MagnetometerReading(
    val x: Float,
    val y: Float,
    val z: Float,
    val magnitude: Float,
    val timestamp: Long,
    val latitude: Double = 0.0,
    val longitude: Double = 0.0
)

data class Detection(
    val magnitude: Float,
    val latitude: Double,
    val longitude: Double,
    val timestamp: Long,
    val accuracy: Float
)

class MagnetometerService : Service(), SensorEventListener {

    private val binder = MagnetometerBinder()
    private lateinit var sensorManager: SensorManager
    private var magneticFieldSensor: Sensor? = null
    private var accelerometerSensor: Sensor? = null

    private val _readingFlow = MutableStateFlow<MagnetometerReading?>(null)
    val readingFlow: StateFlow<MagnetometerReading?> = _readingFlow.asStateFlow()

    private val _detectionsFlow = MutableStateFlow<List<Detection>>(emptyList())
    val detectionsFlow: StateFlow<List<Detection>> = _detectionsFlow.asStateFlow()

    private val _isListeningFlow = MutableStateFlow(false)
    val isListeningFlow: StateFlow<Boolean> = _isListeningFlow.asStateFlow()

    private var lastMagnitude = 0f
    private val detectionThreshold = 50f // Sensitivite eşiği
    private val detections = mutableListOf<Detection>()

    // Hızlandırma değerleri
    private val accelerometerValues = FloatArray(3)
    private val magneticValues = FloatArray(3)
    private val rotationMatrix = FloatArray(9)
    private val orientation = FloatArray(3)

    inner class MagnetometerBinder : Binder() {
        fun getService(): MagnetometerService = this@MagnetometerService
    }

    override fun onCreate() {
        super.onCreate()
        sensorManager = getSystemService(SENSOR_SERVICE) as SensorManager
        magneticFieldSensor = sensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD)
        accelerometerSensor = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder {
        return binder
    }

    fun startListening() {
        magneticFieldSensor?.let {
            sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_NORMAL)
        }
        accelerometerSensor?.let {
            sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_NORMAL)
        }
        _isListeningFlow.value = true
    }

    fun stopListening() {
        sensorManager.unregisterListener(this)
        _isListeningFlow.value = false
    }

    override fun onSensorChanged(event: SensorEvent?) {
        if (event == null) return

        when (event.sensor.type) {
            Sensor.TYPE_MAGNETIC_FIELD -> {
                magneticValues[0] = event.values[0]
                magneticValues[1] = event.values[1]
                magneticValues[2] = event.values[2]
                updateReading()
            }
            Sensor.TYPE_ACCELEROMETER -> {
                accelerometerValues[0] = event.values[0]
                accelerometerValues[1] = event.values[1]
                accelerometerValues[2] = event.values[2]
                updateReading()
            }
        }
    }

    private fun updateReading() {
        val x = magneticValues[0]
        val y = magneticValues[1]
        val z = magneticValues[2]
        val magnitude = sqrt(x * x + y * y + z * z)

        val reading = MagnetometerReading(
            x = x,
            y = y,
            z = z,
            magnitude = magnitude,
            timestamp = System.currentTimeMillis()
        )

        _readingFlow.value = reading

        // Anomali tespiti
        if (magnitude > lastMagnitude + detectionThreshold) {
            // Anomali tespit edildi
        }

        lastMagnitude = magnitude
    }

    fun addDetection(detection: Detection) {
        detections.add(detection)
        _detectionsFlow.value = detections.toList()
    }

    fun getDetections(): List<Detection> {
        return detections.toList()
    }

    fun clearDetections() {
        detections.clear()
        _detectionsFlow.value = emptyList()
    }

    fun getCurrentMagnitude(): Float {
        return _readingFlow.value?.magnitude ?: 0f
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}

    override fun onDestroy() {
        super.onDestroy()
        stopListening()
    }
}
