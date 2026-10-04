"""
FrameSense AI - Training & Fine-Tuning Pipeline for Aesthetic Assessment
Trains MobileNetV3-NIMA on AVA dataset using Earth Mover's Distance (EMD) Loss on NVIDIA RTX 3050 CUDA.
"""

import os
import time
import math
import torch
from torch.utils.data import DataLoader, random_split
from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingLR

from ml_model.aesthetic_net import MobileNetV3NIMA
from ml_model.loss import EMDLoss
from ml_model.dataset_loader import AVAAestheticDataset, generate_sample_annotations


def compute_correlations(y_true, y_pred):
    """Computes Pearson Linear Correlation (PLCC) and Spearman Rank (SRCC)."""
    if len(y_true) < 2:
        return 0.0, 0.0

    y_true = torch.tensor(y_true, dtype=torch.float32)
    y_pred = torch.tensor(y_pred, dtype=torch.float32)

    # Pearson Correlation
    vx = y_true - torch.mean(y_true)
    vy = y_pred - torch.mean(y_pred)
    denom = torch.sqrt(torch.sum(vx ** 2)) * torch.sqrt(torch.sum(vy ** 2))
    plcc = (torch.sum(vx * vy) / (denom + 1e-8)).item()

    # Spearman Rank Correlation (approximation via ranks)
    rank_true = torch.argsort(torch.argsort(y_true)).float()
    rank_pred = torch.argsort(torch.argsort(y_pred)).float()
    rx = rank_true - torch.mean(rank_true)
    ry = rank_pred - torch.mean(rank_pred)
    denom_r = torch.sqrt(torch.sum(rx ** 2)) * torch.sqrt(torch.sum(ry ** 2))
    srcc = (torch.sum(rx * ry) / (denom_r + 1e-8)).item()

    return round(plcc, 4), round(srcc, 4)


def train_aesthetic_model(
    annotation_path="data/sample_annotations.txt",
    images_dir="data/images",
    epochs=5,
    batch_size=16,
    lr=1e-4,
    save_dir="ml_model/weights",
):
    """Fine-tunes MobileNetV3NIMA on AVA dataset."""
    os.makedirs(save_dir, exist_ok=True)
    os.makedirs(images_dir, exist_ok=True)

    # 1. Hardware device detection (RTX 3050 CUDA check)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"\n{'='*60}")
    print(f"[FrameSense AI Training] Target Device: {device}")
    if device.type == "cuda":
        gpu_name = torch.cuda.get_device_name(0)
        vram_gb = torch.cuda.get_device_properties(0).total_memory / (1024 ** 3)
        print(f"[Hardware Engine] GPU: {gpu_name} ({vram_gb:.2f} GB VRAM)")
    print(f"{'='*60}\n")

    # Ensure annotations exist
    if not os.path.exists(annotation_path):
        print(f"[Dataset] Annotation file not found. Generating sample AVA benchmark at: {annotation_path}")
        generate_sample_annotations(annotation_path, num_samples=100)

    # 2. Dataset & DataLoader setup
    full_dataset = AVAAestheticDataset(annotation_path, images_dir, is_train=True)
    train_size = int(0.8 * len(full_dataset))
    val_size = len(full_dataset) - train_size

    if val_size == 0 and len(full_dataset) > 1:
        train_size = len(full_dataset) - 1
        val_size = 1

    train_data, val_data = random_split(full_dataset, [train_size, val_size])
    train_loader = DataLoader(train_data, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_data, batch_size=batch_size, shuffle=False)

    print(f"[Dataset] Total Samples: {len(full_dataset)} | Train: {train_size} | Validation: {val_size}")

    # 3. Model & Loss setup
    model = MobileNetV3NIMA(pretrained=True).to(device)
    criterion = EMDLoss(r=2.0)
    optimizer = AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = CosineAnnealingLR(optimizer, T_max=epochs)

    best_val_loss = float("inf")
    history = {"train_loss": [], "val_loss": [], "srcc": [], "plcc": []}

    print("\n[Training Loop Started]")
    for epoch in range(1, epochs + 1):
        epoch_start = time.time()
        model.train()
        running_train_loss = 0.0

        for batch in train_loader:
            images = batch["image"].to(device)
            targets = batch["distribution"].to(device)

            optimizer.zero_grad()
            prob_preds, _ = model(images)
            loss = criterion(targets, prob_preds)
            loss.backward()
            optimizer.step()

            running_train_loss += loss.item() * images.size(0)

        scheduler.step()
        epoch_train_loss = running_train_loss / max(1, train_size)

        # Validation phase
        model.eval()
        running_val_loss = 0.0
        val_true_scores = []
        val_pred_scores = []

        with torch.no_grad():
            for batch in val_loader:
                images = batch["image"].to(device)
                targets = batch["distribution"].to(device)
                true_means = batch["mean_score"].tolist()

                prob_preds, pred_means = model(images)
                loss = criterion(targets, prob_preds)
                running_val_loss += loss.item() * images.size(0)

                val_true_scores.extend(true_means)
                val_pred_scores.extend(pred_means.cpu().tolist())

        epoch_val_loss = running_val_loss / max(1, val_size)
        plcc, srcc = compute_correlations(val_true_scores, val_pred_scores)
        epoch_duration = time.time() - epoch_start

        history["train_loss"].append(epoch_train_loss)
        history["val_loss"].append(epoch_val_loss)
        history["srcc"].append(srcc)
        history["plcc"].append(plcc)

        print(
            f"Epoch [{epoch:02d}/{epochs:02d}] "
            f"Train EMD Loss: {epoch_train_loss:.4f} | "
            f"Val EMD Loss: {epoch_val_loss:.4f} | "
            f"SRCC: {srcc:.4f} | "
            f"Time: {epoch_duration:.2f}s"
        )

        # Save best model checkpoint
        if epoch_val_loss < best_val_loss:
            best_val_loss = epoch_val_loss
            save_path = os.path.join(save_dir, "best_aesthetic_mobilenet.pth")
            torch.save({
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "optimizer_state_dict": optimizer.state_dict(),
                "val_loss": best_val_loss,
                "srcc": srcc,
                "plcc": plcc,
            }, save_path)
            print(f"  --> Saved new best checkpoint to: {save_path}")

    print(f"\n[Training Finished] Best Validation EMD Loss: {best_val_loss:.4f}")

    # Generate and save authentic training curves for college presentation/report
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt

        epochs_range = list(range(1, epochs + 1))
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))

        # Subplot 1: EMD Loss
        ax1.plot(epochs_range, history["train_loss"], "b-o", label="Train EMD Loss", linewidth=2)
        ax1.plot(epochs_range, history["val_loss"], "r--s", label="Val EMD Loss", linewidth=2)
        ax1.set_title("NIMA MobileNetV3 - Earth Mover's Distance (EMD) Loss", fontsize=11, fontweight="bold")
        ax1.set_xlabel("Epochs")
        ax1.set_ylabel("EMD Loss")
        ax1.grid(True, linestyle="--", alpha=0.5)
        ax1.legend()

        # Subplot 2: Spearman Rank Correlation (SRCC)
        ax2.plot(epochs_range, history["srcc"], "g-^", label="Validation SRCC", linewidth=2)
        ax2.set_title("Spearman Rank Correlation Coefficient (SRCC)", fontsize=11, fontweight="bold")
        ax2.set_xlabel("Epochs")
        ax2.set_ylabel("Correlation Score (SRCC)")
        ax2.grid(True, linestyle="--", alpha=0.5)
        ax2.legend()

        plt.tight_layout()
        plot_path = os.path.join("ml_model", "training_loss_curve.png")
        plt.savefig(plot_path, dpi=300)
        plt.close()
        print(f"[Plot Engine] Saved high-resolution loss curve to: {plot_path}")
    except Exception as e:
        print(f"[Plot Engine] Plotting skipped: {e}")

    return history


if __name__ == "__main__":
    train_aesthetic_model(
        annotation_path="data/curated_ava_benchmark.txt",
        images_dir="data/images",
        epochs=5,
        batch_size=32,
    )
