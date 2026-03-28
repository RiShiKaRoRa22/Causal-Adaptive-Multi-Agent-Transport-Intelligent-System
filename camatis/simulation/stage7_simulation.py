"""
Stage 7: Scenario Simulation Engine
Simulates transport scenarios using uncertainty-aware predictions
"""

import simpy
import numpy as np
from camatis.config import *

class Bus:
    """Bus entity in simulation"""
    """
Stage 7: Scenario Simulation Engine
Simulates transport scenarios using uncertainty-aware predictions
"""

import simpy
import numpy as np
from camatis.config import *

class Bus:
    """Bus entity in simulation"""
    
    def __init__(self, bus_id, capacity, route):
        self.bus_id = bus_id
        self.capacity = capacity
        self.route = route
        self.passengers = 0
        self.trips_completed = 0
        
class Route:
    """Route entity"""
    def __init__(self, route_id, frequency, demand_predictor):
        self.route_id = route_id
        self.frequency = frequency  # buses per hour
        self.demand_predictor = demand_predictor
        self.total_passengers = 0
        self.waiting_passengers = 0

class TransportSimulation:

    def __init__(self, predictions, uncertainty_info, optimized_actions):

        self.env = simpy.Environment()

        self.predictions = predictions
        self.uncertainty_info = uncertainty_info
        self.optimized_actions = optimized_actions

        self.routes = {}
        self.buses = []

        self.metrics = {
            'total_passengers': 0,
            'total_waiting_time': 0,
            'overload_events': 0,
            'underutilization_events': 0
        }

    # ----------------------------
    # ROUTES
    # ----------------------------
    def setup_routes(self):

        self.dynamic_demand = {}

        # ----------------------------
        # STEP 1: Initialize routes + demand
        # ----------------------------
        for route_id, plan in self.optimized_actions.items():

            # Base demand
            base = self.predictions['passenger_demand'][route_id % len(self.predictions['passenger_demand'])]
            base = max(1, base * 10)

            self.dynamic_demand[route_id] = base

            # Frequency
            base_freq = 4
            freq = base_freq * plan["frequency_multiplier"]

            self.routes[route_id] = {
                "frequency": freq,
                "waiting": 0
            }

        # ----------------------------
        # STEP 2: Apply rerouting impact
        # ----------------------------
        for route_id, plan in self.optimized_actions.items():

            if plan["reroute_to"] is not None:

                from_route = route_id
                to_route = plan["reroute_to"]

                # Ensure target route exists
                if to_route not in self.dynamic_demand:
                    continue

                shift = self.dynamic_demand[from_route] * 0.4

                self.dynamic_demand[from_route] -= shift
                self.dynamic_demand[to_route] += shift

                print(f"[DEMAND SHIFT] {from_route} → {to_route} ({round(shift,2)})")
    # ----------------------------
    # BUSES
    # ----------------------------
    def setup_buses(self):

        bus_id = 0

        for route_id, plan in self.optimized_actions.items():

            final_route = plan["reroute_to"] if plan["reroute_to"] is not None else route_id

            total = 1 + plan["buses_to_add"]

            for _ in range(total):

                self.buses.append({
                    "id": f"BUS_{bus_id}",
                    "route": final_route,   # ✅ SET HERE ONLY
                    "capacity": 50,
                    "passengers": 0
                })

                if plan["reroute_to"] is not None:
                    print(f"[REROUTE] Route {route_id} → {final_route}")

                bus_id += 1
    # ----------------------------
    # DEMAND ARRIVAL
    # ----------------------------
    def passenger_arrival(self, route_id):

        while True:

            base = self.dynamic_demand[route_id]

            # fix negative values
            base = max(1, base * 50)

            demand = np.random.poisson(base)

            self.routes[route_id]["waiting"] += demand
            self.metrics['total_passengers'] += demand

            # waiting time accumulates
            self.metrics['total_waiting_time'] += self.routes[route_id]["waiting"] * 0.05

            freq = self.routes[route_id]["frequency"]
            yield self.env.timeout(max(1, 60 / freq))

    # ----------------------------
    # BUS MOVEMENT
    # ----------------------------
    def bus_operation(self, bus):

        while True:

            route_id = bus["route"]
            plan = self.optimized_actions.get(route_id, {})

            # 🔁 APPLY REROUTE
            '''if plan["reroute_to"] is not None:

                old_route = route_id
                new_route = plan["reroute_to"]

                # move bus
                bus["route"] = new_route

                # redistribute demand
                moved = self.routes[old_route]["waiting"] * 0.3

                self.routes[old_route]["waiting"] -= moved
                self.routes[new_route]["waiting"] += moved

                print(f"[REROUTE] Bus {bus['id']} → Route {new_route}")'''

            route = self.routes[bus["route"]]

            boarded = min(route["waiting"], bus["capacity"])
            route["waiting"] -= boarded

            bus["passengers"] = boarded

            # utilization check
            util = boarded / bus["capacity"]

            if util > 0.9:
                self.metrics['overload_events'] += 1
            elif util < 0.3:
                self.metrics['underutilization_events'] += 1

            # travel
            yield self.env.timeout(10)

            bus["passengers"] = 0

    # ----------------------------
    # RUN
    # ----------------------------
    def run_simulation(self):

        print("\n=== INITIALIZING SIMULATION ===")

        self.setup_routes()
        self.setup_buses()

        print(f"Routes: {len(self.routes)}")
        print(f"Buses: {len(self.buses)}")

        for r in self.routes:
            self.env.process(self.passenger_arrival(r))

        for b in self.buses:
            self.env.process(self.bus_operation(b))

        self.env.run(until=300)

    # ----------------------------
    # RESULTS
    # ----------------------------
    def get_results(self):

        return {
            "total_passengers": self.metrics['total_passengers'],
            "avg_waiting_time": self.metrics['total_waiting_time'] / max(self.metrics['total_passengers'], 1),
            "overload_events": self.metrics['overload_events'],
            "underutilization_events": self.metrics['underutilization_events']
        }
class ScenarioSimulator:

    def run(self, predictions, uncertainty_info, optimized_actions):

        print("\n=== RUNNING REAL-TIME SIMULATION ===")

        sim = TransportSimulation(
            predictions,
            uncertainty_info,
            optimized_actions
        )

        sim.run_simulation()
        results = sim.get_results()

        print("\n=== FINAL SIMULATION RESULTS ===")
        for k, v in results.items():
            print(f"{k}: {round(v,2)}")

        return sim, results   # 🔥 RETURN SIM OBJECT
    '''def __init__(self):
        self.scenarios = SIMULATION_SCENARIOS
        self.results = {}
    
    def simulate_scenario(self, scenario_name, predictions, uncertainty_info, optimized_actions):
        """Simulate a specific scenario"""
        print(f"\n=== Simulating: {scenario_name} ===")
        
        # Modify predictions based on scenario
        modified_predictions = self._apply_scenario_modifications(
            scenario_name, predictions
        )
        
        # Run simulation
        sim = TransportSimulation(modified_predictions, uncertainty_info, optimized_actions)
        metrics = sim.run_simulation()
        results = sim.get_results()
        
        self.results[scenario_name] = results
        
        return results
    
    def _apply_scenario_modifications(self, scenario_name, predictions):
        """Apply scenario-specific modifications"""
        modified = predictions.copy()
        
        if scenario_name == 'festival_surge':
            # 2x demand increase
            modified['passenger_demand'] = predictions['passenger_demand'] * 2.0
        
        elif scenario_name == 'congestion_spike':
            # Reduced speed, increased congestion
            pass  # Already in predictions
        
        elif scenario_name == 'fleet_breakdown':
            # Reduced capacity
            modified['load_factor'] = predictions['load_factor'] * 1.3
        
        return modified
    
    def run_all_scenarios(self, predictions, uncertainty_info, optimized_actions):

        print("\n" + "="*50)
        print("SCENARIO SIMULATION ENGINE")
        print("="*50)

        for scenario in self.scenarios:

            self.simulate_scenario(
                scenario,
                predictions,
                uncertainty_info,
                optimized_actions
            )

        return self.results
    
    def compare_scenarios(self):
        """Compare results across scenarios"""
        print("\n=== Scenario Comparison ===")
        for scenario, results in self.results.items():
            print(f"\n{scenario}:")
            for metric, value in results.items():
                print(f"  {metric}: {value:.2f}")'''

        
