"""
FrameSense AI - Earth Mover's Distance (EMD) Loss
Implements the exact loss function proposed in Google's NIMA research (Talebi & Milanfar, IEEE TIP 2018).
Designed for ordinal aesthetic score distributions (ratings 1 to 10).
"""

import torch
import torch.nn as nn


class EMDLoss(nn.Module):
    """
    Earth Mover's Distance (EMD) Loss for ordinal probability distributions.
    Penalizes misclassifications proportionally to the distance between rating buckets.
    """
    def __init__(self, r: float = 2.0):
        super(EMDLoss, self).__init__()
        self.r = r

    def forward(self, p_target: torch.Tensor, p_estimate: torch.Tensor) -> torch.Tensor:
        """
        Parameters:
            p_target: Ground truth rating distribution [batch_size, 10]
            p_estimate: Predicted rating distribution [batch_size, 10]
        """
        assert p_target.shape == p_estimate.shape, "Shape mismatch between target and estimate"

        # Compute Cumulative Distribution Functions (CDF)
        cdf_target = torch.cumsum(p_target, dim=-1)
        cdf_estimate = torch.cumsum(p_estimate, dim=-1)

        # Compute normalized L_r distance between CDFs
        diff = torch.abs(cdf_target - cdf_estimate)
        if self.r == 2.0:
            loss = torch.sqrt(torch.mean(torch.pow(diff, 2), dim=-1))
        else:
            loss = torch.pow(torch.mean(torch.pow(diff, self.r), dim=-1), 1.0 / self.r)

        return torch.mean(loss)
