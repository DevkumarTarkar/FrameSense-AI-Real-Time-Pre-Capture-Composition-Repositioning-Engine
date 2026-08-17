import time
import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.models as models

class MobileNetV3NIMA(nn.Module):
    """
    MobileNetV3-Small backbone based Neural Image Assessment (NIMA) model.
    Predicts 10-bin aesthetic score rating distributions for camera frames.
    """
    def __init__(self, pretrained=True):
        super(MobileNetV3NIMA, self).__init__()
        
        # Load lightweight MobileNetV3 backbone for edge NPU efficiency
        if pretrained:
            weights = models.MobileNet_V3_Small_Weights.DEFAULT
            self.backbone = models.mobilenet_v3_small(weights=weights)
        else:
            self.backbone = models.mobilenet_v3_small(weights=None)
            
        # Get input features count of original classifier head
        in_features = self.backbone.classifier[0].in_features
        
        # Custom regression head mapping features to 10 aesthetic rating bins
        self.backbone.classifier = nn.Sequential(
            nn.Linear(in_features, 256),
            nn.Hardswish(),
            nn.Dropout(p=0.25),
            nn.Linear(256, 10),
            nn.Softmax(dim=1)
        )

    def forward(self, x):
        # Predict 10-bin rating probabilities (sums to 1.0)
        prob_dist = self.backbone(x)
        
        # Vectorized weighted average rating calculation (scale 1 to 10 mapped to 0-100)
        weights = torch.arange(1, 11, dtype=torch.float32, device=x.device)
        mean_rating = torch.sum(prob_dist * weights, dim=1) * 10.0
        
        return prob_dist, mean_rating

def build_aesthetic_model(pretrained=True):
    """
    Factory function to instantiate MobileNetV3NIMA network.
    """
    model = MobileNetV3NIMA(pretrained=pretrained)
    return model

if __name__ == '__main__':
    # Local verification block for model architecture & latency benchmarking
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"[Model] Testing MobileNetV3 NIMA network on device: {device}")
    
    net = build_aesthetic_model(pretrained=True).to(device)
    net.eval()
    
    # Dummy frame input simulating 224x224 RGB live camera stream
    dummy_input = torch.randn(1, 3, 224, 224).to(device)
    
    # Warmup and latency test
    start_time = time.time()
    with torch.no_grad():
        prob_dist, mean_score = net(dummy_input)
    elapsed_ms = (time.time() - start_time) * 1000.0
    
    print(f"[Model] Output distribution tensor shape: {prob_dist.shape}")
    print(f"[Model] Predicted Aesthetic Score: {mean_score.item():.2f} / 100")
    print(f"[Model] Single-frame inference latency: {elapsed_ms:.2f} ms")
