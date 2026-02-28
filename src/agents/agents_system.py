from agents.agents import DemandAgent, FleetAgent, SchedulingAgent, SupervisorAgent

def format_prediction(i, route_id, reg_pred, cls_pred, reg_std, cls_probs):
    return {
        "route_id": route_id,
        "passenger_demand": float(reg_pred[i][0]),
        "load_factor": float(reg_pred[i][1]),
        "utilization_class": int(cls_pred[i]),
        "demand_uncertainty": float(reg_std[i][0]),
        "load_uncertainty": float(reg_std[i][1]),
        "prob_low": float(cls_probs[i][0]),
        "prob_medium": float(cls_probs[i][1]),
        "prob_high": float(cls_probs[i][2]),
    }

class AgentSystem:

    def __init__(self):
        self.demand = DemandAgent()
        self.fleet = FleetAgent()
        self.schedule = SchedulingAgent()
        self.supervisor = SupervisorAgent()

    def process_batch(self, route_ids, reg_pred, cls_pred, reg_std, cls_probs, available_buses=5):
        decisions = []

        for i, route_id in enumerate(route_ids):

            pred = format_prediction(i, route_id, reg_pred, cls_pred, reg_std, cls_probs)

            actions = []

            actions.append(self.demand.evaluate(pred))
            actions.append(self.fleet.allocate(pred, available_buses))
            actions.append(self.schedule.adjust(pred))

            final = self.supervisor.resolve(actions)

            if final:
                decisions.append(final)

        return decisions