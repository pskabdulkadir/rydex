package com.example.magnetictreasure.ui.fragments

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.example.magnetictreasure.databinding.FragmentMapBinding
import com.example.magnetictreasure.database.AppDatabase
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.SupportMapFragment
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.MarkerOptions
import kotlinx.coroutines.launch

class MapFragment : Fragment(), OnMapReadyCallback {
    
    private var _binding: FragmentMapBinding? = null
    private val binding get() = _binding!!
    
    private lateinit var googleMap: GoogleMap
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var database: AppDatabase
    
    private var userLocation: LatLng = LatLng(41.0082, 28.9784) // İstanbul (varsayılan)
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentMapBinding.inflate(inflater, container, false)
        return binding.root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        database = AppDatabase.getInstance(requireContext())
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(requireContext())
        
        val mapFragment = childFragmentManager.findFragmentById(binding.map.id) as? SupportMapFragment
        mapFragment?.getMapAsync(this)
        
        requestLocationPermission()
    }
    
    override fun onMapReady(map: GoogleMap) {
        googleMap = map
        
        // Varsayılan konuma git
        googleMap.moveCamera(CameraUpdateFactory.newLatLngZoom(userLocation, 14f))
        
        // Kaynakları haritaya ekle
        loadTreasuresToMap()
        
        // Kullanıcı konumunu güncelle
        getCurrentLocation()
    }
    
    private fun loadTreasuresToMap() {
        lifecycleScope.launch {
            database.treasureDao().getAllTreasures().collect { treasures ->
                treasures.forEach { treasure ->
                    if (treasure.latitude != null && treasure.longitude != null) {
                        val position = LatLng(treasure.latitude, treasure.longitude)
                        
                        val emoji = when (treasure.resourceType) {
                            "TREASURE" -> "💎"
                            "VALUABLE_MATERIAL" -> "✨"
                            "MINERAL" -> "⛏️"
                            "UNDERGROUND_STRUCTURE" -> "🏗️"
                            else -> "❓"
                        }
                        
                        val name = when (treasure.resourceType) {
                            "TREASURE" -> "Hazine"
                            "VALUABLE_MATERIAL" -> "Değerli Materyal"
                            "MINERAL" -> "Madeni Kaynak"
                            "UNDERGROUND_STRUCTURE" -> "Yer Altı Yapısı"
                            else -> "Bilinmeyen"
                        }
                        
                        googleMap.addMarker(
                            MarkerOptions()
                                .position(position)
                                .title("$emoji $name")
                                .snippet("Şiddet: ${String.format("%.2f", treasure.magneticStrength)} µT")
                        )
                    }
                }
            }
        }
    }
    
    private fun getCurrentLocation() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (ContextCompat.checkSelfPermission(
                    requireContext(),
                    Manifest.permission.ACCESS_FINE_LOCATION
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                return
            }
        }
        
        fusedLocationClient.lastLocation.addOnSuccessListener { location ->
            if (location != null) {
                userLocation = LatLng(location.latitude, location.longitude)
                googleMap.moveCamera(CameraUpdateFactory.newLatLngZoom(userLocation, 14f))
                
                // Kullanıcı konumunu işaretleyin
                googleMap.addMarker(
                    MarkerOptions()
                        .position(userLocation)
                        .title("📍 Konumunuz")
                )
            }
        }
    }
    
    private fun requestLocationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (ContextCompat.checkSelfPermission(
                    requireContext(),
                    Manifest.permission.ACCESS_FINE_LOCATION
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                requestPermissions(
                    arrayOf(Manifest.permission.ACCESS_FINE_LOCATION),
                    LOCATION_PERMISSION_REQUEST_CODE
                )
            }
        }
    }
    
    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == LOCATION_PERMISSION_REQUEST_CODE) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                getCurrentLocation()
            }
        }
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
    
    companion object {
        private const val LOCATION_PERMISSION_REQUEST_CODE = 100
    }
}
