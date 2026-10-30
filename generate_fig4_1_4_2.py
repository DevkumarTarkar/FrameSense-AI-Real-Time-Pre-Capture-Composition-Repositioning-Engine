import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np

# ==============================================================================
# FIGURE 4.1: Brain 1: Rule-of-Thirds Golden Intersections and Euclidean Distance Mapping
# ==============================================================================
def generate_fig4_1():
    fig, ax = plt.subplots(figsize=(10, 7), dpi=300)
    ax.set_facecolor('#ffffff')
    fig.patch.set_facecolor('#ffffff')
    
    # Viewfinder coordinate frame (640 x 480)
    W, H = 640, 480
    ax.set_xlim(-40, W + 120)
    ax.set_ylim(-30, H + 50)
    ax.invert_yaxis()  # Image coordinates: (0,0) at top-left
    ax.axis('off')
    
    # Viewfinder outer border
    frame = patches.Rectangle((0, 0), W, H, linewidth=2.0, edgecolor='#1e293b', facecolor='#f8fafc', zorder=1)
    ax.add_patch(frame)
    
    # Frame Dimensions Annotations
    ax.annotate('', xy=(W, -12), xytext=(0, -12),
                arrowprops=dict(arrowstyle='<->', color='#475569', lw=1.2))
    ax.text(W/2, -18, f'Sensor Frame Width W = {W} px', fontsize=9.5, fontweight='bold', color='#1e293b', ha='center', va='bottom')
    
    ax.annotate('', xy=(-15, H), xytext=(-15, 0),
                arrowprops=dict(arrowstyle='<->', color='#475569', lw=1.2))
    ax.text(-22, H/2, f'Sensor Frame Height H = {H} px', fontsize=9.5, fontweight='bold', color='#1e293b', ha='center', va='center', rotation=90)
    
    # Rule of Thirds Grid Lines (dashed)
    x1, x2 = W / 3.0, 2.0 * W / 3.0
    y1, y2 = H / 3.0, 2.0 * H / 3.0
    
    # Grid lines
    ax.plot([x1, x1], [0, H], color='#3b82f6', linestyle='--', linewidth=1.5, alpha=0.85, zorder=2)
    ax.plot([x2, x2], [0, H], color='#3b82f6', linestyle='--', linewidth=1.5, alpha=0.85, zorder=2)
    ax.plot([0, W], [y1, y1], color='#3b82f6', linestyle='--', linewidth=1.5, alpha=0.85, zorder=2)
    ax.plot([0, W], [y2, y2], color='#3b82f6', linestyle='--', linewidth=1.5, alpha=0.85, zorder=2)
    
    # Grid Line Labels
    ax.text(x1, H + 14, 'x = W/3 (213 px)', fontsize=8.2, color='#2563eb', ha='center', fontweight='semibold')
    ax.text(x2, H + 14, 'x = 2W/3 (427 px)', fontsize=8.2, color='#2563eb', ha='center', fontweight='semibold')
    ax.text(W + 8, y1, 'y = H/3 (160 px)', fontsize=8.2, color='#2563eb', va='center', fontweight='semibold')
    ax.text(W + 8, y2, 'y = 2H/3 (320 px)', fontsize=8.2, color='#2563eb', va='center', fontweight='semibold')
    
    # 4 Golden Intersection Points
    intersections = [
        (x1, y1, 'P1: Top-Left Golden Point\n(Optimal Portrait Eye Line)'),
        (x2, y1, 'P2: Top-Right Golden Point'),
        (x1, y2, 'P3: Bottom-Left Golden Point'),
        (x2, y2, 'P4: Bottom-Right Golden Point')
    ]
    for ix, iy, label in intersections:
        circle = plt.Circle((ix, iy), 7, facecolor='#f59e0b', edgecolor='#b45309', linewidth=1.8, zorder=4)
        ax.add_patch(circle)
        ring = plt.Circle((ix, iy), 14, facecolor='none', edgecolor='#f59e0b', linestyle=':', linewidth=1.2, zorder=3)
        ax.add_patch(ring)
    
    # Target Golden Intersection is P1 (x1, y1)
    target_x, target_y = x1, y1
    
    # Detected Subject Head & Face (Off-center simulation)
    face_cx, face_cy = 285, 215
    face_w, face_h = 130, 150
    face_x = face_cx - face_w / 2
    face_y = face_cy - face_h / 2
    
    # Draw Subject Face Box (MediaPipe BlazeFace)
    face_box = patches.FancyBboxPatch((face_x, face_y), face_w, face_h, boxstyle='round,pad=2,rounding_size=8',
                                      linewidth=2.0, edgecolor='#10b981', facecolor='#ecfdf5', alpha=0.9, zorder=3)
    ax.add_patch(face_box)
    
    # Draw simple facial feature anchors
    eye_y = face_cy - 18
    left_eye_x = face_cx - 24
    right_eye_x = face_cx + 24
    ax.plot([left_eye_x, right_eye_x], [eye_y, eye_y], 'o-', color='#059669', markersize=5, linewidth=1.5, zorder=4)
    # Eye line center point
    eye_center_x, eye_center_y = face_cx, eye_y
    ax.plot(eye_center_x, eye_center_y, 'D', color='#047857', markersize=7, zorder=5)
    
    # Face Centroid label
    ax.text(face_cx, face_cy + 62, 'Detected Face Centroid\nC(xc, yc) = (285, 197)', fontsize=8.2,
            fontweight='bold', color='#065f46', ha='center', va='top', zorder=5)
    
    # Euclidean Distance Vector from C to Target P1
    ax.annotate('', xy=(target_x, target_y), xytext=(eye_center_x, eye_center_y),
                arrowprops=dict(arrowstyle='->,head_width=4,head_length=5', color='#dc2626', lw=2.2, linestyle='-'),
                zorder=6)
    
    # Vector delta label
    dx = target_x - eye_center_x
    dy = target_y - eye_center_y
    dist = np.sqrt(dx**2 + dy**2)
    mid_vx = (target_x + eye_center_x) / 2
    mid_vy = (target_y + eye_center_y) / 2
    ax.text(mid_vx + 10, mid_vy - 12, f'Euclidean Repositioning Vector d\n||d|| = {dist:.1f} px\n(dx={dx:.0f}px, dy={dy:.0f}px)',
            fontsize=8.5, fontweight='bold', color='#b91c1c', ha='left', va='center',
            bbox=dict(boxstyle='round,pad=0.3', facecolor='#fef2f2', edgecolor='#fca5a5', lw=1.0), zorder=7)
    
    # Headroom clearance annotation (Crown to top boundary)
    crown_y = face_y
    ax.plot([face_cx, face_cx], [0, crown_y], color='#8b5cf6', linestyle='-', linewidth=2.0, zorder=4)
    ax.plot([face_cx - 15, face_cx + 15], [0, 0], color='#8b5cf6', linewidth=2.0, zorder=4)
    ax.plot([face_cx - 15, face_cx + 15], [crown_y, crown_y], color='#8b5cf6', linewidth=2.0, zorder=4)
    ax.text(face_cx + 20, crown_y / 2, f'Headroom Clearance h\nh = {crown_y:.0f} px ({crown_y/H*100:.1f}%)',
            fontsize=8.0, fontweight='bold', color='#6d28d9', va='center', zorder=7,
            bbox=dict(boxstyle='round,pad=0.2', facecolor='#f5f3ff', edgecolor='#ddd6fe', lw=0.9))
    
    # Horizon tilt representation
    horizon_y = 390
    tilt_deg = -1.8
    tilt_rad = np.radians(tilt_deg)
    hx = np.array([40, W - 40])
    hy = horizon_y + (hx - W/2) * np.tan(tilt_rad)
    ax.plot(hx, hy, color='#0284c7', linewidth=2.2, zorder=3)
    ax.plot([40, W - 40], [horizon_y, horizon_y], color='#94a3b8', linestyle=':', linewidth=1.2, zorder=2)
    ax.text(W - 35, horizon_y - 14, f'Horizon Level Line (Tilt: {tilt_deg:+.1f} deg)\n[Tolerance: +/-2.0 deg - OK]',
            fontsize=8.0, fontweight='bold', color='#0369a1', ha='right', va='bottom',
            bbox=dict(boxstyle='round,pad=0.2', facecolor='#f0f9ff', edgecolor='#bae6fd', lw=0.9), zorder=7)
    
    # Mathematical Formulas Box (Bottom Left inside canvas or right side)
    formula_text = (
        r"$\mathbf{Deterministic\ Geometric\ Formulations:}$" + "\n"
        r"$\bullet\ \mathbf{Euclidean\ Distance:}\ d = \sqrt{(x_c - x_t)^2 + (y_c - y_t)^2}$" + "\n"
        r"$\bullet\ \mathbf{Thirds\ Score:}\ S_{thirds} = 100 \times \max(0,\, 1 - d / d_{max})$" + "\n"
        r"$\bullet\ \mathbf{Headroom\ Ratio:}\ R_{headroom} = y_{crown} / H \in [0.15,\, 0.20]$" + "\n"
        r"$\bullet\ \mathbf{Horizon\ Tilt:}\ |\theta| \leq 2.0^{\circ} \rightarrow S_{tilt} = 100$"
    )
    ax.text(25, 65, formula_text, fontsize=8.0, color='#1e293b', va='top', ha='left',
            bbox=dict(boxstyle='round,pad=0.5', facecolor='#ffffff', edgecolor='#cbd5e1', lw=1.2), zorder=8)
    
    # Caption at bottom
    ax.text(W / 2, H + 35, 'Figure 4.1: Brain 1: Rule-of-Thirds Golden Intersections and Euclidean Distance Mapping',
            fontsize=10.5, fontweight='bold', style='italic', color='#0f172a', ha='center', va='top')
    
    plt.subplots_adjust(left=0.03, right=0.97, top=0.95, bottom=0.05)
    plt.savefig(r'D:\FrameSense-AI\Figure_4.1_Rule_of_Thirds_Euclidean.png', dpi=300, facecolor='white', bbox_inches='tight')
    plt.savefig(r'C:\Users\devku\Downloads\Figure_4.1_Rule_of_Thirds_Euclidean.png', dpi=300, facecolor='white', bbox_inches='tight')
    print('Figure 4.1 generated successfully!')

# ==============================================================================
# FIGURE 4.2: Brain 2: NIMA 10-Class Categorical Softmax Aesthetic Rating Distribution
# ==============================================================================
def generate_fig4_2():
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5.5), dpi=300, gridspec_kw={'width_ratios': [1.3, 1]})
    fig.patch.set_facecolor('white')
    ax1.set_facecolor('#fafafa')
    ax2.set_facecolor('#fafafa')
    
    # NIMA 10-class aesthetic score distribution (1 to 10)
    scores = np.arange(1, 11)
    # Simulated AVA Ground Truth vs Fine-Tuned Model Prediction for a High-Quality Photograph
    # Centered around 8.4
    probs_pred = np.array([0.005, 0.010, 0.015, 0.030, 0.060, 0.110, 0.210, 0.320, 0.190, 0.050])
    probs_pred = probs_pred / np.sum(probs_pred)
    
    probs_gt = np.array([0.002, 0.008, 0.018, 0.025, 0.055, 0.125, 0.220, 0.300, 0.195, 0.052])
    probs_gt = probs_gt / np.sum(probs_gt)
    
    # Calculate Mean and Std
    mean_pred = np.sum(scores * probs_pred)
    std_pred = np.sqrt(np.sum((scores - mean_pred)**2 * probs_pred))
    
    # 1. Bar Chart: Categorical Probability Distribution
    bar_width = 0.38
    rects1 = ax1.bar(scores - bar_width/2, probs_gt, bar_width, label='AVA Human Ground Truth (q)', 
                     color='#94a3b8', edgecolor='#64748b', alpha=0.85)
    rects2 = ax1.bar(scores + bar_width/2, probs_pred, bar_width, label='NIMA Predicted Softmax p(s)', 
                     color='#3b82f6', edgecolor='#1d4ed8', alpha=0.9)
    
    ax1.set_xlabel('Aesthetic Rating Score (s)', fontsize=10, fontweight='bold', color='#1e293b')
    ax1.set_ylabel('Probability Mass p(s)', fontsize=10, fontweight='bold', color='#1e293b')
    ax1.set_title('NIMA 10-Class Categorical Rating Probability Mass Function', fontsize=10.5, fontweight='bold', color='#0f172a', pad=10)
    ax1.set_xticks(scores)
    ax1.set_ylim(0, 0.38)
    ax1.grid(axis='y', linestyle='--', alpha=0.5)
    ax1.legend(loc='upper left', fontsize=8.5, framealpha=0.9)
    
    # Annotate Mean Score line
    ax1.axvline(x=mean_pred, color='#ef4444', linestyle='--', linewidth=1.8, label=f'Predicted Mean $\mu={mean_pred:.2f}$')
    ax1.text(mean_pred - 0.15, 0.34, f'Mean $\mu = {mean_pred:.2f}$ / 10\nStd $\sigma = {std_pred:.2f}$', 
             fontsize=8.5, fontweight='bold', color='#b91c1c', ha='right',
             bbox=dict(boxstyle='round,pad=0.3', facecolor='#fef2f2', edgecolor='#fca5a5', lw=1.0))
    
    # 2. Cumulative Distribution Function (CDF) and EMD Loss Plot
    cdf_gt = np.cumsum(probs_gt)
    cdf_pred = np.cumsum(probs_pred)
    
    ax2.step(scores, cdf_gt, where='mid', label='Ground Truth CDF $F_q(k)$', color='#475569', linewidth=2.0, linestyle=':')
    ax2.step(scores, cdf_pred, where='mid', label='Predicted CDF $F_p(k)$', color='#2563eb', linewidth=2.0)
    ax2.fill_between(scores, cdf_gt, cdf_pred, step='mid', color='#93c5fd', alpha=0.45, label='Earth Mover\'s Distance (EMD)')
    
    ax2.set_xlabel('Rating Score Threshold (k)', fontsize=10, fontweight='bold', color='#1e293b')
    ax2.set_ylabel('Cumulative Probability CDF(k)', fontsize=10, fontweight='bold', color='#1e293b')
    ax2.set_title('Earth Mover\'s Distance (EMD) Loss Metric (r=2)', fontsize=10.5, fontweight='bold', color='#0f172a', pad=10)
    ax2.set_xticks(scores)
    ax2.set_ylim(0, 1.05)
    ax2.grid(True, linestyle='--', alpha=0.5)
    ax2.legend(loc='lower right', fontsize=8.5, framealpha=0.9)
    
    # Formulations annotation in Ax2
    emd_text = (
        r"$\mathbf{NIMA\ Formulation:}$" + "\n"
        r"$\bullet\ \mathbf{Mean\ Score:}\ \mu = \sum_{i=1}^{10} i \cdot p_i$" + "\n"
        r"$\bullet\ \mathbf{Std\ Dev:}\ \sigma = \sqrt{\sum_{i=1}^{10} (i - \mu)^2 p_i}$" + "\n"
        r"$\bullet\ \mathbf{EMD\ Loss:}\ L_{EMD} = \left(\frac{1}{N}\sum_{k=1}^N |CDF_p(k) - CDF_q(k)|^2\right)^{1/2}$"
    )
    ax2.text(1.2, 0.95, emd_text, fontsize=8.0, color='#1e293b', va='top', ha='left',
             bbox=dict(boxstyle='round,pad=0.35', facecolor='#ffffff', edgecolor='#cbd5e1', lw=1.0))
    
    # Figure Caption at the very bottom spanning both subplots
    fig.text(0.5, 0.02, 'Figure 4.2: Brain 2: NIMA 10-Class Categorical Softmax Aesthetic Rating Distribution',
             fontsize=11, fontweight='bold', style='italic', color='#0f172a', ha='center')
    
    plt.tight_layout(rect=[0, 0.05, 1, 0.98])
    plt.savefig(r'D:\FrameSense-AI\Figure_4.2_NIMA_Softmax_Distribution.png', dpi=300, facecolor='white', bbox_inches='tight')
    plt.savefig(r'C:\Users\devku\Downloads\Figure_4.2_NIMA_Softmax_Distribution.png', dpi=300, facecolor='white', bbox_inches='tight')
    print('Figure 4.2 generated successfully!')

if __name__ == '__main__':
    generate_fig4_1()
    generate_fig4_2()
