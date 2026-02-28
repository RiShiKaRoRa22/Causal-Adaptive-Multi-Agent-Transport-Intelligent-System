class FleetAgent:

    def __init__(self, available_buses):
        self.available_buses = available_buses

    def allocate(self, load, load_uncertainty):
        if load + load_uncertainty > 0.9 and self.available_buses > 0:
            self.available_buses -= 1
            return {"type": "fleet_action", "action": "Allocate Extra Bus", "priority": 1}
        return None