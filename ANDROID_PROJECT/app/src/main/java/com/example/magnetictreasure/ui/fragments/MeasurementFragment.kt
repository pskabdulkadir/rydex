package com.example.magnetictreasure.ui.fragments

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.example.magnetictreasure.databinding.FragmentMeasurementBinding
import com.example.magnetictreasure.sensor.MagnetometerManager
import com.example.magnetictreasure.sensor.CalibrationManager
import com.example.magnetictreasure.alert.AlertManager
import kotlinx.coroutines.launch

class MeasurementFragment : Fragment() {
    
    private var _binding: FragmentMeasurementBinding? = null
    private val binding get() = _binding!!
    
    private lateinit var magnetometerManager: MagnetometerManager
    private lateinit var calibrationManager: CalibrationManager
    private lateinit var alertManager: AlertManager
    
    private var isRunning = false
    private var alertThreshold = 100f
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentMeasurementBinding.inflate(inflater, container, false)
        return binding.root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        initializeManagers()
        setupUI()
        setupObservers()
        requestPermissions()
    }
    
    private fun initializeManagers() {
        magnetometerManager = MagnetometerManager(requireContext())
        calibrationManager = CalibrationManager(requireContext())
        alertManager = AlertManager(requireContext())
    }
    
    private fun setupUI() {
        binding.startButton.setOnClickListener {
            if (!isRunning) {
                startMeasurement()
            } else {
                stopMeasurement()
            }
        }
        
        binding.calibrationButton.setOnClickListener {
            if (isRunning && !calibrationManager.isCalibrating.value) {
                startCalibration()
            }
        }
        
        binding.thresholdSlider.addOnChangeListener { _, value, _ ->
            alertThreshold = value
            binding.thresholdValue.text = "${value.toInt()} µT"
        }
    }
    
    private fun setupObservers() {
        lifecycleScope.launch {
            magnetometerManager.readings.collect { reading ->
                if (reading != null && isRunning) {
                    binding.totalValue.text = String.format("%.1f", reading.total)
                    binding.xValue.text = String.format("%.1f", reading.x)
                    binding.yValue.text = String.format("%.1f", reading.y)
                    binding.zValue.text = String.format("%.1f", reading.z)
                    
                    // Uyarı kontrolü
                    if (reading.total > alertThreshold) {
                        alertManager.triggerAlert(reading.total, alertThreshold)
                    }
                    
                    if (calibrationManager.isCalibrating.value) {
                        calibrationManager.addReading(reading.total)
                    }
                }
            }
        }
        
        lifecycleScope.launch {
            calibrationManager.calibrationProgress.collect { progress ->
                binding.calibrationProgress.visibility = if (progress > 0 && progress < 100) View.VISIBLE else View.GONE
                binding.calibrationProgress.progress = progress
            }
        }
        
        lifecycleScope.launch {
            calibrationManager.calibrationData.collect { data ->
                if (data != null) {
                    binding.calibrationStatus.visibility = View.VISIBLE
                    binding.calibrationStatus.text = "✅ Başlangıç: ${String.format("%.2f", data.baseline)} µT"
                }
            }
        }
    }
    
    private fun startMeasurement() {
        magnetometerManager.startListening()
        isRunning = true
        binding.startButton.text = "DURDUR"
        binding.startButton.setBackgroundColor(android.graphics.Color.RED)
    }
    
    private fun stopMeasurement() {
        magnetometerManager.stopListening()
        isRunning = false
        binding.startButton.text = "BAŞLAT"
        binding.startButton.setBackgroundColor(android.graphics.Color.GREEN)
    }
    
    private fun startCalibration() {
        calibrationManager.startCalibration()
        Toast.makeText(requireContext(), "Kalibrasyon başladı...", Toast.LENGTH_SHORT).show()
    }
    
    private fun requestPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (ContextCompat.checkSelfPermission(
                    requireContext(),
                    Manifest.permission.VIBRATE
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                requestPermissions(arrayOf(Manifest.permission.VIBRATE), 1)
            }
        }
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        magnetometerManager.stopListening()
        _binding = null
    }
}
