import json
import os
from typing import List, Dict, Any, Optional
from datetime import datetime
import numpy as np

from backend.config import OUTPUT_FILE

class DataService:
    """Service to read data from your existing CAMATIS outputs"""
    
    def __init__(self):
        self._cached_results = None
        self._cached_timestamp = None
    
    def load_results(self) -> Optional[List[Dict[str, Any]]]:
        """Load results from final_output.json"""
        if os.path.exists(OUTPUT_FILE):
            # Check if file was modified since last read
            file_mtime = os.path.getmtime(OUTPUT_FILE)
            if self._cached_timestamp != file_mtime:
                with open(OUTPUT_FILE, 'r') as f:
                    self._cached_results = json.load(f)
                    self._cached_timestamp = file_mtime
            return self._cached_results
        return None
    
    def get_all_routes(self) -> List[Dict[str, Any]]:
        """Get all routes from results"""
        results = self.load_results()
        if not results:
            return []
        
        routes = []
        for r in results[:100]:  # Limit to 100 routes
            load = r.get("waiting_passengers", 50)
            
            # Determine status based on your data
            if r.get("anomaly", False):
                status = "Anomaly"
            elif load > 85:
                status = "Risk"
            elif r.get("high_uncertainty", False):
                status = "Risk"
            else:
                status = "Normal"
            
            routes.append({
                "id": f"R-{r.get('route_id')}",
                "demand": round(r.get("demand_after", 0), 0),
                "load_factor": round(load, 1),
                "status": status
            })
        
        return routes
    
    def get_route_detail(self, route_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed data for a specific route"""
        route_num = route_id.replace("R-", "")
        results = self.load_results()
        
        if not results:
            return None
        
        # Find the route
        route_data = None
        for r in results:
            if str(r.get("route_id", "")) == route_num:
                route_data = r
                break
        
        if not route_data:
            return None
        
        # Generate hourly trends based on actual data
        hours = ["06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"]
        demand_patterns = [0.5, 1.5, 1.2, 1.3, 1.1, 1.4, 1.6, 1.0, 0.6]
        load_patterns = [0.4, 0.9, 0.8, 0.85, 0.75, 0.9, 1.0, 0.7, 0.5]
        
        demand_base = route_data.get("demand_after", 500)
        load_base = route_data.get("waiting_passengers", 65)
        
        demand_trend = [
            {"time": hour, "demand": round(demand_base * pattern, 0)}
            for hour, pattern in zip(hours, demand_patterns)
        ]
        
        load_trend = [
            {"time": hour, "load": round(load_base * pattern, 1)}
            for hour, pattern in zip(hours, load_patterns)
        ]
        
        # Confidence based on uncertainty
        confidence = 95 if not route_data.get("high_uncertainty", False) else 70
        
        # Build recommendations from actual actions
        actions = route_data.get("actions", [])
        
        recommendations = {
            "frequency_multiplier": f"{route_data.get('frequency_multiplier', 1.0)}x",
            "buses_to_add": f"+{route_data.get('buses_added', 0)} Buses" if route_data.get('buses_added', 0) > 0 else "0 Buses",
            "reroute_suggestion": f"Route {route_data.get('rerouted_to')}" if route_data.get('rerouted_to') else "No change needed"
        }
        
        # Map actions to badges
        action_badges = []
        for action in actions:
            if action == "Increase Frequency":
                action_badges.append({"label": action, "color": "blue"})
            elif action == "Allocate Extra Bus":
                action_badges.append({"label": action, "color": "green"})
            elif action == "High Demand Risk":
                action_badges.append({"label": action, "color": "orange"})
            elif action == "Investigate Anomaly":
                action_badges.append({"label": action, "color": "red"})
            else:
                action_badges.append({"label": action, "color": "yellow"})
        
        if not action_badges:
            action_badges.append({"label": "Monitor Load", "color": "yellow"})
        
        return {
            "demand_trend": demand_trend,
            "load_trend": load_trend,
            "confidence": confidence,
            "recommendations": recommendations,
            "action_badges": action_badges
        }
    
    def get_dashboard_data(self) -> Dict[str, Any]:
        """Get dashboard overview data"""
        results = self.load_results()
        
        if not results:
            return {
                "stats": {
                    "total_routes": 0,
                    "active_buses": 0,
                    "high_demand_routes": 0,
                    "anomalies": 0,
                    "avg_load_factor": 0,
                    "avg_demand": 0
                },
                "demand": [],
                "load": [],
                "alerts": []
            }
        
        # Calculate stats from your results
        total_routes = len(results)
        anomalies = sum(1 for r in results if r.get("anomaly", False))
        high_demand = sum(1 for r in results if r.get("waiting_passengers", 0) > 85)
        avg_demand = sum(r.get("demand_after", 0) for r in results) / total_routes if total_routes > 0 else 0
        avg_load = sum(r.get("waiting_passengers", 0) for r in results) / total_routes if total_routes > 0 else 0
        
        # Generate hourly demand pattern
        hours = ["06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"]
        patterns = [0.5, 1.5, 1.2, 1.3, 1.1, 1.4, 1.6, 1.0, 0.6]
        
        demand_data = [
            {"time": hour, "demand": round(avg_demand * pattern, 0)}
            for hour, pattern in zip(hours, patterns)
        ]
        
        # Get top routes for load chart
        load_data = [
            {"route": f"R-{r.get('route_id')}", "load": round(r.get("waiting_passengers", 50), 1)}
            for r in results[:6]
        ]
        
        # Generate alerts from anomalies
        alerts = []
        for i, r in enumerate(results[:10]):
            if r.get("anomaly", False):
                load = r.get("waiting_passengers", 0)
                if load > 85:
                    severity = "High"
                    message = f"Load factor exceeded 85% — critical overcapacity"
                elif load > 70:
                    severity = "Medium"
                    message = f"Load factor at {load:.0f}% — high demand"
                else:
                    severity = "Low"
                    message = f"Anomaly detected on route"
                
                alerts.append({
                    "id": i + 1,
                    "route": f"R-{r.get('route_id')}",
                    "message": message,
                    "severity": severity,
                    "time": datetime.now().strftime("%I:%M %p")
                })
        
        return {
            "stats": {
                "total_routes": total_routes,
                "active_buses": total_routes * 3,
                "high_demand_routes": high_demand,
                "anomalies": anomalies,
                "avg_load_factor": round(avg_load, 1),
                "avg_demand": round(avg_demand, 0)
            },
            "demand": demand_data,
            "load": load_data,
            "alerts": alerts
        }
    
    def get_alerts(self) -> List[Dict[str, Any]]:
        """Get all alerts from anomalies"""
        results = self.load_results()
        
        if not results:
            return []
        
        alerts = []
        for i, r in enumerate(results[:20]):
            if r.get("anomaly", False):
                alerts.append({
                    "id": i + 1,
                    "route": f"R-{r.get('route_id')}",
                    "message": f"Anomaly detected: {', '.join(r.get('actions', []))}",
                    "severity": "High" if r.get("waiting_passengers", 0) > 85 else "Medium",
                    "time": datetime.now().strftime("%I:%M %p")
                })
        
        return alerts

# Singleton instance
data_service = DataService()