package com.example.magnetictreasure

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.NavController
import androidx.navigation.fragment.NavHostFragment
import androidx.navigation.ui.NavigationUI
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.example.magnetictreasure.databinding.ActivityMainBinding
import com.example.magnetictreasure.ui.MeasurementActivity
import com.example.magnetictreasure.ui.GraphActivity
import com.example.magnetictreasure.ui.DetectionsActivity
import com.example.magnetictreasure.ui.MapActivity
import com.example.magnetictreasure.ui.HistoryActivity

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var navController: NavController

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // ActionBar ayarları
        setSupportActionBar(binding.toolbar)
        supportActionBar?.title = getString(R.string.app_name)

        // NavController setup
        val navHostFragment = supportFragmentManager
            .findFragmentById(R.id.nav_host_fragment) as NavHostFragment
        navController = navHostFragment.navController

        // BottomNavigationView setup
        setupBottomNavigation()
    }

    private fun setupBottomNavigation() {
        binding.bottomNavigation.setOnItemSelectedListener { menuItem ->
            when (menuItem.itemId) {
                R.id.nav_measurement -> startActivity(
                    Intent(this, MeasurementActivity::class.java)
                )
                R.id.nav_graph -> startActivity(
                    Intent(this, GraphActivity::class.java)
                )
                R.id.nav_detections -> startActivity(
                    Intent(this, DetectionsActivity::class.java)
                )
                R.id.nav_map -> startActivity(
                    Intent(this, MapActivity::class.java)
                )
                R.id.nav_history -> startActivity(
                    Intent(this, HistoryActivity::class.java)
                )
            }
            true
        }
    }
}
