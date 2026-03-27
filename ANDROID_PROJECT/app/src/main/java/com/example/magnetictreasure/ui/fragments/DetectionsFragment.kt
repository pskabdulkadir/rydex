package com.example.magnetictreasure.ui.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.magnetictreasure.databinding.FragmentDetectionsBinding
import com.example.magnetictreasure.database.AppDatabase
import com.example.magnetictreasure.database.TreasureEntity
import com.example.magnetictreasure.detection.TreasureDetector
import com.example.magnetictreasure.sensor.MagnetometerManager
import com.example.magnetictreasure.sensor.CalibrationManager
import com.example.magnetictreasure.alert.AlertManager
import kotlinx.coroutines.launch

class DetectionsFragment : Fragment() {
    
    private var _binding: FragmentDetectionsBinding? = null
    private val binding get() = _binding!!
    
    private lateinit var database: AppDatabase
    private lateinit var magnetometerManager: MagnetometerManager
    private lateinit var calibrationManager: CalibrationManager
    private lateinit var treasureDetector: TreasureDetector
    private lateinit var alertManager: AlertManager
    
    private val treasureList = mutableListOf<TreasureEntity>()
    private lateinit var adapter: TreasureAdapter
    
    private var isRunning = false
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentDetectionsBinding.inflate(inflater, container, false)
        return binding.root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        database = AppDatabase.getInstance(requireContext())
        magnetometerManager = MagnetometerManager(requireContext())
        calibrationManager = CalibrationManager(requireContext())
        treasureDetector = TreasureDetector()
        alertManager = AlertManager(requireContext())
        
        setupRecyclerView()
        setupUI()
        loadTreasures()
    }
    
    private fun setupRecyclerView() {
        adapter = TreasureAdapter(treasureList)
        binding.treasureRecyclerView.layoutManager = LinearLayoutManager(requireContext())
        binding.treasureRecyclerView.adapter = adapter
    }
    
    private fun setupUI() {
        binding.startButton.setOnClickListener {
            if (calibrationManager.calibrationData.value != null) {
                if (!isRunning) {
                    startDetection()
                } else {
                    stopDetection()
                }
            }
        }
        
        binding.clearButton.setOnClickListener {
            lifecycleScope.launch {
                database.treasureDao().deleteAllTreasures()
                treasureList.clear()
                adapter.notifyDataSetChanged()
            }
        }
    }
    
    private fun setupObservers() {
        lifecycleScope.launch {
            magnetometerManager.readings.collect { reading ->
                if (reading != null && isRunning) {
                    val baseline = calibrationManager.getBaseline()
                    
                    // Her 20 okumada bir tespit et
                    if (treasureList.size % 20 == 0) {
                        val anomaly = reading.total - baseline
                        
                        if (anomaly > 15) {
                            val treasureEntity = TreasureEntity(
                                uuid = java.util.UUID.randomUUID().toString(),
                                resourceType = getResourceType(reading.total),
                                magneticStrength = reading.total,
                                anomalyLevel = anomaly,
                                confidence = calculateConfidence(anomaly),
                                timestamp = reading.timestamp
                            )
                            
                            treasureList.add(0, treasureEntity)
                            adapter.notifyItemInserted(0)
                            
                            lifecycleScope.launch {
                                database.treasureDao().insertTreasure(treasureEntity)
                            }
                            
                            if (treasureEntity.confidence > 50) {
                                alertManager.triggerCriticalAlert(
                                    treasureEntity.resourceType,
                                    reading.total
                                )
                            }
                        }
                    }
                }
            }
        }
    }
    
    private fun startDetection() {
        magnetometerManager.startListening()
        isRunning = true
        binding.startButton.text = "DURDUR"
        binding.startButton.setBackgroundColor(android.graphics.Color.RED)
        setupObservers()
    }
    
    private fun stopDetection() {
        magnetometerManager.stopListening()
        isRunning = false
        binding.startButton.text = "BAŞLAT"
        binding.startButton.setBackgroundColor(android.graphics.Color.GREEN)
    }
    
    private fun loadTreasures() {
        lifecycleScope.launch {
            database.treasureDao().getAllTreasures().collect { treasures ->
                treasureList.clear()
                treasureList.addAll(treasures)
                adapter.notifyDataSetChanged()
            }
        }
    }
    
    private fun getResourceType(magneticStrength: Float): String = when {
        magneticStrength >= 120f -> "TREASURE"
        magneticStrength >= 110f -> "VALUABLE_MATERIAL"
        magneticStrength >= 95f -> "MINERAL"
        magneticStrength >= 80f -> "UNDERGROUND_STRUCTURE"
        else -> "UNKNOWN"
    }
    
    private fun calculateConfidence(anomalyLevel: Float): Float {
        var confidence = 50f
        confidence += minOf(anomalyLevel * 2, 30f)
        return confidence.coerceIn(0f, 100f)
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        magnetometerManager.stopListening()
        _binding = null
    }
}
