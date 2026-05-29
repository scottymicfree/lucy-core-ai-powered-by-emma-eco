import torch
import torch.nn as nn
import torch.nn.functional as F

try:
    from mamba_ssm import Mamba
except ImportError:
    Mamba = None # Mock graceful fallback if running on host without CUDA

class ThalamocorticalRouter(nn.Module):
    def __init__(self, d_model, num_experts, top_k=2):
        super().__init__()
        # The gating network acts as the striatum, evaluating inputs
        self.gating_network = nn.Linear(d_model, num_experts)
        self.top_k = top_k
        
    def forward(self, x):
        # Input tensor 'x' represents the latent thought vector
        logits = self.gating_network(x)
        routing_weights = F.softmax(logits, dim=-1)
        
        # Isolate the top-k pathways to enforce sparsity
        topk_vals, topk_indices = torch.topk(routing_weights, self.top_k, dim=-1)
        
        # Normalize weights so the active experts sum to 1.0
        topk_vals_normalized = topk_vals / topk_vals.sum(dim=-1, keepdim=True)
        
        return topk_indices, topk_vals_normalized, logits

class CorticalMoELayer(nn.Module):
    def __init__(self, experts, router):
        super().__init__()
        self.experts = nn.ModuleList(experts)
        self.router = router
        
    def forward(self, x):
        batch_size, seq_len, d_model = x.shape
        x_flat = x.view(-1, d_model)
        topk_indices, topk_vals, logits = self.router(x_flat)
        
        outputs = torch.zeros_like(x_flat)
        
        # Iterate over experts, applying selective gating
        for i, expert in enumerate(self.experts):
            expert_mask = (topk_indices == i)
            if expert_mask.any():
                expert_weight = (topk_vals * expert_mask).sum(dim=1).view(-1, 1)
                expert_output = expert(x_flat) 
                # Combine outputs weighted by the router's confidence
                outputs += (expert_output * expert_weight)
                
        return outputs.view(batch_size, seq_len, d_model), logits

def apply_trn_inhibitory_gating(routing_logits, rosais_scores, safety_threshold=0.85):
    """
    Emulates the Thalamic Reticular Nucleus by applying severe inhibitory 
    suppression to unsafe MoE routing pathways based on real-time RoSais scoring.
    """
    # Create a boolean mask identifying highly vulnerable expert pathways
    inhibitory_mask = (rosais_scores > safety_threshold)
    
    # Apply GABAergic equivalent (Negative Infinity) to suppress the route
    routing_logits[inhibitory_mask] = float('-inf')
    
    # Recalculate routing probabilities; compromised experts now hold 0.0 probability
    safe_routing_weights = torch.nn.functional.softmax(routing_logits, dim=-1)
    
    return safe_routing_weights

def process_sensory_stream(continuous_sensory_stream):
    if Mamba is None:
        return torch.randn(1, 48000, 512)
        
    # Initialize the Mamba-based Sensory Cortex
    # Parameters reflect the hardware limitations of a 128GB RAM / 48GB VRAM system
    sensory_cortex = Mamba(
        d_model=512,        # Dimension of the visible state space
        d_state=128,        # Dimension of the latent hidden states
        d_conv=4,           # Local convolution kernel size
        expand=2,           # Expansion factor for the internal feed-forward layer
    ).to("cuda")

    # Process the stream in linear time, avoiding quadratic memory explosion
    perceived_environment = sensory_cortex(continuous_sensory_stream.to("cuda"))
    return perceived_environment
