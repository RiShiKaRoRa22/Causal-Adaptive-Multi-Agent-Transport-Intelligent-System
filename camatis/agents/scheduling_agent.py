class SchedulingAgent:

    def adjust(self, demand, uncertainty, util_class):
        if util_class == 2 and uncertainty > 0.1:
            return {"type": "schedule_action", "action": "Increase Frequency", "priority": 2}
        return None