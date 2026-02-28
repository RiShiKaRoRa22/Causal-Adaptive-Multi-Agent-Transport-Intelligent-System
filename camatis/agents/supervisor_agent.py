class SupervisorAgent:

    def resolve(self, actions):
        if not actions:
            return None

        # Pick highest priority (lower number = higher priority)
        actions = [a for a in actions if a is not None]
        if not actions:
            return None

        return sorted(actions, key=lambda x: x["priority"])[0]