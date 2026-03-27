package com.example.magnetictreasure.sensor

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlin.math.sqrt

data class MagneticReading(
    val x: Float,
    val y: Float,
    val z: Float,
    val total: Float,
    val timestamp: Long = System.currentTimeMillis()
)

class MagnetometerManager(private val context: Context) : SensorEventListener {
    
    private val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
    private val magnetometer: Sensor? = sensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD)
    
    private val _readings = MutableStateFlow<MagneticReading?>(null)
    val readings: StateFlow<MagneticReading?> = _readings
    
    private val noiseFilter = NoiseFilter(0.15f)
    
    fun startListening() {
        magnetometer?.let {
            sensorManager.registerListener(
                this,
                it,
                SensorManager.SENSOR_DELAY_UI
            )
        }
    }
    
    fun stopListening() {
        sensorManager.unregisterListener(this)
    }
    
    override fun onSensorChanged(event: SensorEvent?) {
        event?.let {
            if (it.sensor.type == Sensor.TYPE_MAGNETIC_FIELD) {
                val x = it.values[0]
                val y = it.values[1]
                val z = it.values[2]
                
                // Toplam manyetik alan şiddeti
                val total = sqrt((x * x + y * y + z * z).toDouble()).toFloat()
                
                // Gürültü filtresi uygula
                val filteredTotal = noiseFilter.filter(total.toDouble()).toFloat()
                
                _readings.value = MagneticReading(
                    x = x,
                    y = y,
                    z = z,
                    total = filteredTotal
                )
            }
        }
    }
    
    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
    
    fun resetFilter() {
        noiseFilter.reset()
    }
}

class NoiseFilter(private val alpha: Float = 0.1f) {
    private var filteredValue = 0.0
    
    fun filter(input: Double): Double {
        filteredValue = filteredValue + alpha * (input - filteredValue)
        return filteredValue
    }
    
    fun reset() {
        filteredValue = 0.0
    }
}
