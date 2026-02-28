class DemandAgent:

    def evaluate(self, demand, load, prob_high):
        if load > 0.85 or prob_high > 0.7:
            return {"type": "demand_risk", "priority": 3}
        return None