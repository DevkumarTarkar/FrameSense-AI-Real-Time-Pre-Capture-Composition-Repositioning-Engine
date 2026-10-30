import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Set up figure
fig, ax = plt.subplots(figsize=(12, 16), dpi=300)
ax.set_facecolor('white')
fig.patch.set_facecolor('white')
ax.set_xlim(0, 100)
ax.set_ylim(0, 152)
ax.axis('off')

# Header text
ax.text(95, 149.5, 'FrameSense AI – Real-Time AI Multi-Agent Architecture', 
        fontsize=8.5, style='italic', color='#64748b', ha='right', va='top')

# Helper: Draw container section
def draw_layer_container(x, y, w, h, title, subtitle='', bg='#f8fafc', border='#cbd5e1'):
    box = patches.FancyBboxPatch((x - w/2, y - h/2), w, h, boxstyle='round,pad=0.3,rounding_size=1.5',
                                 facecolor=bg, edgecolor=border, linewidth=1.3, zorder=1)
    ax.add_patch(box)
    ax.text(x - w/2 + 2, y + h/2 - 2.2, title, fontsize=9.0, fontweight='bold', color='#1e293b', ha='left', va='top', zorder=2)
    if subtitle:
        ax.text(x + w/2 - 2, y + h/2 - 2.2, subtitle, fontsize=7.8, style='italic', color='#64748b', ha='right', va='top', zorder=2)

# Helper: Draw component boxes
def draw_box(x, y, w, h, title, subtext='', bg='#ffffff', border='#94a3b8', is_oval=False, text_color='#0f172a', title_size=8.0, sub_size=6.6):
    boxstyle = f'round,pad=0.2,rounding_size={h/2}' if is_oval else 'round,pad=0.2,rounding_size=1.2'
    box = patches.FancyBboxPatch((x - w/2, y - h/2), w, h, boxstyle=boxstyle,
                                 facecolor=bg, edgecolor=border, linewidth=1.1, zorder=3)
    ax.add_patch(box)
    
    if subtext:
        lines = subtext.split('\n')
        offset_y = 0.3 * len(lines)
        ax.text(x, y + offset_y, title, fontsize=title_size, fontweight='bold', color=text_color, ha='center', va='center', zorder=4)
        ax.text(x, y - 0.65 - (0.18 * (len(lines)-1)), subtext, fontsize=sub_size, color='#334155', ha='center', va='center', zorder=4, linespacing=1.18)
    else:
        ax.text(x, y, title, fontsize=title_size, fontweight='bold', color=text_color, ha='center', va='center', zorder=4)

# Helper: Draw neat arrow
def draw_arrow(x1, y1, x2, y2, color='#64748b', lw=1.1):
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle='-|>', mutation_scale=10, color=color, lw=lw),
                zorder=5)

# ==================== LAYER 1: INPUT PROCESSING LAYER ====================
draw_layer_container(50, 137.5, 94, 15.5, 'LAYER 1: INPUT PROCESSING LAYER', 'WebRTC 60 FPS Ingestion & Normalization', bg='#f8fafc', border='#cbd5e1')

draw_box(16, 136, 18, 7.5, 'WebRTC Camera Stream', 'Uncompressed Live Video\n60 FPS Ingestion Buffer', bg='#ffffff', border='#94a3b8')
draw_arrow(25, 136, 29, 136)

draw_box(38, 136, 16, 7.5, 'Canvas Frame Capture', 'Lightweight Base64\nJPEG Frame Dispatch', bg='#ffffff', border='#94a3b8')
draw_arrow(46, 136, 50, 136)

draw_box(60, 136, 18, 7.5, 'OpenCV Image Decoder', 'cv2.imdecode to BGR\n640x480 Normalization', bg='#ffffff', border='#94a3b8')
draw_arrow(69, 136, 73, 136)

draw_box(83, 136, 18, 7.5, 'Active Preset Loader', 'Portrait / Landscape\nTarget Spatial Rubric', bg='#ffffff', border='#94a3b8')

# Down arrow from Layer 1 to Layer 2
draw_arrow(50, 129.5, 50, 125.5)

# ==================== LAYER 2: DUAL-BRAIN EVALUATION LAYER ====================
draw_layer_container(50, 108.5, 94, 30.5, 'LAYER 2: DUAL-BRAIN MULTI-AGENT EVALUATION LAYER', 'Concurrent CPU & RTX 3050 GPU Execution', bg='#f0f9ff', border='#7dd3fc')

# Section Sub-headers
ax.text(32, 120.5, 'BRAIN 1: Deterministic Geometric Sub-Engines (CPU)', fontsize=8.2, fontweight='bold', color='#0284c7', ha='center', zorder=2)
ax.text(82, 120.5, 'BRAIN 2: Aesthetic Neural Engine (GPU)', fontsize=8.2, fontweight='bold', color='#4338ca', ha='center', zorder=2)

# Agent 1: Rule of Thirds
draw_box(14, 109, 16.5, 16.5, 'Rule of Thirds\nAgent', 'BlazeFace 68 Pts\nGolden Grid Intersect\nEuclidean Offset Map\n\nWeight: 40%', 
         bg='#ffffff', border='#38bdf8', title_size=7.8, sub_size=6.4)

# Agent 2: Headroom Clearance
draw_box(32, 109, 16.5, 16.5, 'Headroom Balance\nAgent', 'Crown-to-Upper Border\n15% - 20% Safe Scale\nGolden Margin Ratio\n\nWeight: 20%', 
         bg='#ffffff', border='#38bdf8', title_size=7.8, sub_size=6.4)

# Agent 3: Horizon Level & Tilt
draw_box(50, 109, 16.5, 16.5, 'Horizon Tilt\nAgent', 'OpenCV Canny Edges\nProbabilistic Hough\n+/-2.0 deg Tolerance\n\nWeight: 20%', 
         bg='#ffffff', border='#38bdf8', title_size=7.8, sub_size=6.4)

# Agent 4: Subject Proximity
draw_box(68, 109, 16.5, 16.5, 'Subject Proximity\nAgent', 'Face Box Area Ratio\n18% - 35% Frame Scale\nDistance Calibration\n\nWeight: 20%', 
         bg='#ffffff', border='#38bdf8', title_size=7.8, sub_size=6.4)

# Agent 5: NIMA Aesthetic (RTX 3050 CUDA)
draw_box(86, 109, 16.5, 16.5, 'Neural NIMA\nAesthetic Agent', 'MobileNetV3 Backbone\nAVA Dataset (5k Imgs)\nEMD Wasserstein Loss\n10.84ms CUDA Latency', 
         bg='#e0e7ff', border='#6366f1', text_color='#312e81', title_size=7.8, sub_size=6.4)

# Downward arrows from Layer 2 to Layer 3
conv_y = 90.5
for ax_pos in [14, 32, 50, 68, 86]:
    ax.plot([ax_pos, ax_pos], [100.5, conv_y], color='#64748b', lw=1.1, zorder=2)
ax.plot([14, 86], [conv_y, conv_y], color='#64748b', lw=1.1, zorder=2)
draw_arrow(50, conv_y, 50, 87.5)

# ==================== LAYER 3: CENTRAL ORCHESTRATOR LAYER ====================
draw_layer_container(50, 77.5, 94, 16.5, 'LAYER 3: CENTRAL ORCHESTRATION & TELEMETRY FUSION', 'Python Asyncio Coordinator & Guard', bg='#f0fdf4', border='#86efac')

draw_box(20, 75.5, 24, 8.5, 'Parallel Asyncio Dispatcher', 'Concurrent CPU/GPU Threads\n50ms Strict Frame Timeout Guard', bg='#ffffff', border='#4ade80')
draw_arrow(32, 75.5, 38, 75.5)

draw_box(50, 75.5, 22, 8.5, 'Weighted Score Aggregator', 'Rubric Formula Fusion\nComposite Quality Score (0-100)', bg='#ffffff', border='#4ade80')
draw_arrow(61, 75.5, 67, 75.5)

draw_box(79, 75.5, 22, 8.5, 'WebSocket Serializer', 'Unified Telemetry Packet\nDispatched via /ws/composition', bg='#ffffff', border='#4ade80')

# Down arrow from Layer 3 to Layer 4
draw_arrow(50, 69.0, 50, 65.0)

# ==================== LAYER 4: FEEDBACK GENERATION LAYER ====================
draw_layer_container(50, 53.5, 94, 18.5, 'LAYER 4: REAL-TIME FEEDBACK GENERATION LAYER', 'Multi-Modal Photographer Guidance', bg='#faf5ff', border='#d8b4fe')

draw_box(20, 51.5, 24, 9.5, 'Dynamic Verdict & Grade', 'Calculates Letter Grades:\nMaster (A+), Good (A), Retake (B)\nVisual Performance Badges', bg='#ffffff', border='#c084fc')

draw_box(50, 51.5, 26, 9.5, 'Vector Reticle Offsets', 'Computes (dx, dy) Alignment Delta\nDirects Camera Toward Golden Target\nDynamic Glowing Crosshair Vector', bg='#ffffff', border='#c084fc')

draw_box(80, 51.5, 24, 9.5, 'Hands-Free Voice Coach', 'Web Speech API Vocal Directives\n("Tilt Left", "Step Back", "Raise")\nSmart 3.5s Audio Cooldown', bg='#ffffff', border='#c084fc')

# Down arrow from Layer 4 to Layer 5
draw_arrow(50, 44.0, 50, 39.5)

# ==================== LAYER 5: PRESENTATION & ARCHIVAL LAYER ====================
draw_layer_container(50, 26.5, 94, 21.0, 'LAYER 5: PRESENTATION & CLOUD ARCHIVAL LAYER', 'Client Viewfinder HUD & Session Persistence', bg='#f8fafc', border='#94a3b8')

draw_box(21, 24.5, 26, 12.0, '60 FPS Canvas HUD Overlay', 'Interactive WebRTC Viewfinder\nGlowing Rule-of-Thirds Grid\nReal-Time Horizon Bar (Level / Tilt)\nCircular Composite Score Dial', bg='#ffffff', border='#3b82f6')

draw_box(50, 24.5, 24, 12.0, 'Full-Res Shutter Capture', 'One-Click Full Sensor Resolution\nNon-Destructive Framing Snapshot\nZero Cropping Resolution Loss\nAWS S3 / Local Media Store', bg='#ffffff', border='#3b82f6')

draw_box(79, 24.5, 26, 12.0, 'Session Gallery & Audit', 'Historical Captures Inspection\nMongoDB Telemetry Storage\nPerformance Radar Spider Charts\nPDF & JSON Session Audit Export', bg='#ffffff', border='#3b82f6')

# Figure Caption at bottom
ax.text(50, 8.5, 'Figure 4.1: AI Multi-Agent Architecture Diagram', 
        fontsize=12, fontweight='bold', style='italic', color='#0f172a', ha='center', va='center')

plt.subplots_adjust(left=0.02, right=0.98, top=0.98, bottom=0.04)
plt.savefig(r'D:\FrameSense-AI\ai_multiagent_architecture.png', dpi=300, facecolor='white', bbox_inches='tight')
plt.savefig(r'C:\Users\devku\Downloads\Figure_4.1_AI_MultiAgent_Architecture.png', dpi=300, facecolor='white', bbox_inches='tight')
print('SUCCESSFULLY GENERATED FIGURE 4.1 DIAGRAM')
