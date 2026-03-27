package com.example.magnetictreasure.ui

import android.content.ComponentName
import android.content.Intent
import android.content.ServiceConnection
import android.os.Bundle
import android.os.IBinder
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.magnetictreasure.R
import com.example.magnetictreasure.service.MagnetometerService
import com.github.mikephil.charting.charts.LineChart
import com.github.mikephil.charting.data.LineData
import com.github.mikephil.charting.data.LineDataSet
import com.github.mikephil.charting.data.Entry
import kotlinx.coroutines.launch

class GraphActivity : AppCompatActivity() {

    private lateinit var magnetometerService: MagnetometerService
    private var magnetometerBound = false
    private lateinit var lineChart: LineChart

    private val entries = mutableListOf<Entry>()
    private var dataIndex = 0f

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

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_graph)

        lineChart = findViewById(R.id.chart)
        setupChart()

        // Magnetometre servisi
        val intent = Intent(this, MagnetometerService::class.java)
        bindService(intent, magnetometerConnection, BIND_AUTO_CREATE)
        startService(intent)
    }

    private fun setupChart() {
        lineChart.description.isEnabled = false
        lineChart.legend.isEnabled = true
        lineChart.axisLeft.isEnabled = true
        lineChart.axisRight.isEnabled = false
        lineChart.xAxis.isEnabled = true
    }

    private fun observeMagnetometerData() {
        lifecycleScope.launch {
            magnetometerService.readingFlow.collect { reading ->
                if (reading != null) {
                    // Yeni veri noktası ekle
                    entries.add(Entry(dataIndex, reading.magnitude))
                    dataIndex++

                    // 100 veri noktasından fazla tutma
                    if (entries.size > 100) {
                        entries.removeAt(0)
                    }

                    // Grafiği güncelle
                    updateChart()
                }
            }
        }
    }

    private fun updateChart() {
        val dataSet = LineDataSet(entries, "Manyetik Alan (μT)")
        dataSet.setColor(android.graphics.Color.BLUE)
        dataSet.setCircleColor(android.graphics.Color.BLUE)
        dataSet.lineWidth = 2f
        dataSet.circleRadius = 3f

        val lineData = LineData(dataSet)
        lineChart.data = lineData
        lineChart.notifyDataSetChanged()
        lineChart.invalidate()
    }

    override fun onDestroy() {
        super.onDestroy()
        if (magnetometerBound) {
            unbindService(magnetometerConnection)
        }
    }
}
