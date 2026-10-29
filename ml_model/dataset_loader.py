import os
import csv
import numpy as np
from PIL import Image
import torch
from torch.utils.data import Dataset
from torchvision import transforms

def build_aesthetic_transforms(is_train=True):
    """
    Data augmentation and preprocessing pipeline for aesthetic scoring model.
    Resizes images to 224x224 and applies standard ImageNet normalization.
    """
    if is_train:
        return transforms.Compose([
            transforms.Resize((256, 256)),
            transforms.RandomCrop((224, 224)),
            transforms.RandomHorizontalFlip(p=0.5),
            transforms.ColorJitter(brightness=0.15, contrast=0.15, saturation=0.1),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
    else:
        return transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])

class AVAAestheticDataset(Dataset):
    """
    PyTorch Dataset wrapper for AVA (Aesthetics and Visual Analysis) benchmark data.
    """
    def __init__(self, annotation_path, images_dir, transform=None, is_train=True):
        self.images_dir = images_dir
        self.transform = transform if transform is not None else build_aesthetic_transforms(is_train)
        self.samples = []

        if os.path.exists(annotation_path):
            with open(annotation_path, 'r', encoding='utf-8') as f:
                reader = csv.reader(f, delimiter=' ')
                for line in reader:
                    if len(line) >= 12:
                        img_id = line[1]
                        # Columns 2..11 contain rating vote counts for scores 1 through 10
                        votes = np.array([float(val) for val in line[2:12]], dtype=np.float32)
                        total = np.sum(votes)
                        
                        if total > 0:
                            prob_dist = votes / total
                            # Calculate weighted mean rating normalized to 0-100 scale
                            mean_score = float(np.sum(prob_dist * np.arange(1, 11)) * 10.0)
                            
                            self.samples.append({
                                'img_id': img_id,
                                'distribution': prob_dist,
                                'mean_score': mean_score
                            })

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        sample_info = self.samples[idx]
        img_filename = f"{sample_info['img_id']}.jpg"
        full_path = os.path.join(self.images_dir, img_filename)

        if os.path.exists(full_path):
            try:
                img = Image.open(full_path).convert('RGB')
            except Exception:
                img = Image.new('RGB', (224, 224), color=(120, 120, 120))
        else:
            # Fallback synthetic image for local testing when dataset images aren't present
            bg_val = int(min(255, max(0, sample_info['mean_score'] * 2.5)))
            img = Image.new('RGB', (224, 224), color=(bg_val, 140, 180))

        if self.transform:
            img = self.transform(img)

        return {
            'image': img,
            'distribution': torch.tensor(sample_info['distribution'], dtype=torch.float32),
            'mean_score': torch.tensor(sample_info['mean_score'], dtype=torch.float32),
            'img_id': sample_info['img_id']
        }

def generate_sample_annotations(csv_save_path, num_samples=30):
    """
    Helper to generate sample annotations file for testing data pipeline.
    """
    os.makedirs(os.path.dirname(csv_save_path), exist_ok=True)
    with open(csv_save_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f, delimiter=' ')
        for i in range(1, num_samples + 1):
            sample_id = f"sample_{i:04d}"
            # Generate sample ratings centered around 7
            votes = np.random.poisson(lam=6.8, size=10) + 1
            row = [str(i), sample_id] + [str(int(v)) for v in votes] + ['0', '0']
            writer.writerow(row)
    print(f"[Dataset] Generated sample annotation file at: {csv_save_path}")

if __name__ == '__main__':
    # Local verification block
    test_csv = os.path.join("data", "sample_annotations.txt")
    generate_sample_annotations(test_csv, num_samples=25)
    
    ds = AVAAestheticDataset(annotation_path=test_csv, images_dir=os.path.join("data", "images"), is_train=True)
    print(f"[Dataset] Loaded {len(ds)} dataset records.")
    
    if len(ds) > 0:
        first_item = ds[0]
        print(f"[Dataset] Image tensor shape: {first_item['image'].shape}")
        print(f"[Dataset] Mean aesthetic score: {first_item['mean_score']:.2f}/100")
