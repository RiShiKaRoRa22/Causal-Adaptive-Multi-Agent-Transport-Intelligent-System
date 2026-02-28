class DemandAgent:
    def evaluate(self, pred):
        # High risk if load > 85% OR high overload probability
        if pred["load_factor"] > 0.85 or pred["prob_high"] > 0.6:
            return {"type": "risk", "route": pred["route_id"]}
        return None


class FleetAgent:
    def allocate(self, pred, available_buses):
        # Add uncertainty margin
        adjusted_load = pred["load_factor"] + pred["load_uncertainty"]

        if adjusted_load > 0.9 and available_buses > 0:
            return {
                "type": "fleet",
                "action": "Allocate Extra Bus",
                "route": pred["route_id"]
            }
        return None


class SchedulingAgent:
    def adjust(self, pred):
        # If demand high AND uncertain → increase frequency
        if pred["passenger_demand"] > 140 and pred["demand_uncertainty"] > 8:
            return {
                "type": "schedule",
                "action": "Increase Frequency",
                "route": pred["route_id"]
            }
        return None


class SupervisorAgent:
    def resolve(self, actions):
        priority = ["fleet", "schedule", "risk"]

        for p in priority:
            for action in actions:
                if action and action["type"] == p:
                    return action
        return None
    