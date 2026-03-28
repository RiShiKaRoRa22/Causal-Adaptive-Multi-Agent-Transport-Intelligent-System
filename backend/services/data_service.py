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
        # Count anomalies including high_uncertainty
        anomalies = sum(1 for r in results if r.get("anomaly", False) or r.get("high_uncertainty", False))
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
        
        # Generate alerts for dashboard (using same logic as get_alerts)
        alerts = []
        for i, r in enumerate(results[:10]):
            should_alert = False
            severity = "Low"
            message = ""
            
            # 1. Anomaly flag
            if r.get("anomaly", False):
                should_alert = True
                severity = "High"
                message = "Anomaly detected"
            # 2. High uncertainty
            elif r.get("high_uncertainty", False):
                should_alert = True
                severity = "Medium"
                message = "High prediction uncertainty"
            
            # 3. Specific actions
            actions = r.get("actions", [])
            if "Investigate Anomaly" in actions:
                should_alert = True
                severity = "Medium"
                message = "System flagged for investigation"
            elif "High Demand Risk" in actions and not should_alert:
                should_alert = True
                severity = "Medium"
                message = "High demand risk"
            
            # 4. Over‑capacity
            waiting = r.get("waiting_passengers", 0)
            if waiting > 10000:
                should_alert = True
                severity = "High"
                message = "Extreme waiting passengers"
            elif waiting > 5000 and severity == "Low":
                severity = "Medium"
                message = "High waiting passengers"
            
            if should_alert:
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
        """Get alerts from anomalies, high uncertainty, or flagged actions"""
        results = self.load_results()
        
        if not results:
            return []
        
        alerts = []
        for i, r in enumerate(results):
            should_alert = False
            severity = "Low"
            message = ""
            
            # 1. Anomaly flag (if ever set)
            if r.get("anomaly", False):
                should_alert = True
                severity = "High"
                message = "Anomaly detected"
            
            # 2. High uncertainty
            elif r.get("high_uncertainty", False):
                should_alert = True
                severity = "Medium"
                message = "High prediction uncertainty – manual review advised"
            
            # 3. Specific actions
            actions = r.get("actions", [])
            if "Investigate Anomaly" in actions:
                should_alert = True
                severity = "Medium"
                message = "System flagged for investigation"
            elif "High Demand Risk" in actions and not should_alert:
                should_alert = True
                severity = "Medium"
                message = "High demand risk – consider allocating extra buses"
            
            # 4. Over‑capacity based on waiting_passengers
            waiting = r.get("waiting_passengers", 0)
            if waiting > 10000:
                should_alert = True
                severity = "High"
                message = "Extremely high waiting passengers – capacity crisis"
            elif waiting > 5000 and severity == "Low":
                severity = "Medium"
                message = "High waiting passengers – possible overcrowding"
            
            if should_alert:
                if message == "":
                    message = f"Action required: {', '.join(actions)}"
                
                alerts.append({
                    "id": i + 1,
                    "route": f"R-{r.get('route_id')}",
                    "message": message,
                    "severity": severity,
                    "time": datetime.now().strftime("%I:%M %p")
                })
        
        return alerts[:20]

# Singleton instance
data_service = DataService()