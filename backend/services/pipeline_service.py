import os
import sys
from typing import Any, Dict, Optional

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

# Import your existing pipeline
from camatis.run_agents_pipeline import CAMATISDecisionPipeline

class PipelineService:
    """Service to run your existing pipeline"""
    
    def __init__(self):
        self.pipeline = None
        self._last_run_timestamp = None
    
    def _init_pipeline(self):
        """Lazy initialize the pipeline"""
        if self.pipeline is None:
            print("Loading CAMATIS pipeline (inference only, no retraining)...")
            self.pipeline = CAMATISDecisionPipeline()
            print("Pipeline ready!")
    
    def run_inference(self) -> Dict[str, Any]:
        """
        Run your existing pipeline inference
        This calls your run_agents_pipeline.py which already does inference (not training)
        """
        self._init_pipeline()
        
        # Run the pipeline - this calls your existing code
        decisions = self.pipeline.run()
        
        self._last_run_timestamp = decisions
        
        return {
            "success": True,
            "message": "Pipeline executed successfully",
            "timestamp": self._last_run_timestamp
        }

# Singleton instance
pipeline_service = PipelineService()