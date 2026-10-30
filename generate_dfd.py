import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Set up canvas
fig, ax = plt.subplots(figsize=(10.5, 14.5), dpi=300)
ax.set_facecolor('white')
fig.patch.set_facecolor('white')
ax.set_xlim(0, 100)
ax.set_ylim(0, 146)
ax.axis('off')

# Header text (top right, matching friend's 'HackEval - AI Driven Hackathon Evaluation Agent')
ax.text(93, 143.5, 'FrameSense AI – Real-Time Pre-Capture Composition Engine', 
        fontsize=8.5, style='italic', color='#64748b', ha='right', va='top')

# Helper to draw boxes
def draw_box(x, y, w, h, title, subtext='', bg='#e0f2fe', border='#7dd3fc', is_oval=False, text_color='#0f172a', title_size=8.3, sub_size=6.8):
    boxstyle = f'round,pad=0.2,rounding_size={h/2}' if is_oval else 'round,pad=0.2,rounding_size=1.2'
    box = patches.FancyBboxPatch((x - w/2, y - h/2), w, h, boxstyle=boxstyle,
                                 facecolor=bg, edgecolor=border, linewidth=1.1, zorder=3)
    ax.add_patch(box)
    
    if subtext:
        lines = subtext.split('\n')
        offset_y = 0.32 * len(lines)
        ax.text(x, y + offset_y, title, fontsize=title_size, fontweight='bold', color=text_color, ha='center', va='center', zorder=4)
        sub_color = '#cbd5e1' if bg == '#3b82f6' else '#334155'
        ax.text(x, y - 0.65 - (0.18 * (len(lines)-1)), subtext, fontsize=sub_size, color=sub_color, ha='center', va='center', zorder=4, linespacing=1.18)
    else:
        ax.text(x, y, title, fontsize=title_size, fontweight='bold', color=text_color, ha='center', va='center', zorder=4)

# Helper to draw straight line arrow with neat, professional arrowhead
def draw_arrow(x1, y1, x2, y2, color='#64748b', lw=1.1):
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle='-|>', mutation_scale=10, color=color, lw=lw),
                zorder=2)

# ==================== 1. SUPER ADMIN LEVEL ====================
# Box 1: System Admin Login (Oval)
draw_box(50, 137.5, 24, 3.8, 'System Admin Login', is_oval=True, bg='#e2e8f0', border='#94a3b8')
draw_arrow(50, 135.6, 50, 132.3)

# Box 2: System & Compute Management
draw_box(50, 129.5, 33, 4.8, 'System & Compute Management', '- Monitor CUDA Engine & API Health', bg='#e0f2fe', border='#7dd3fc')
draw_arrow(50, 127.1, 50, 123.8)

# Box 3: Model & Weights Configuration
draw_box(50, 121.0, 33, 4.8, 'Model & Weights Configuration', '- Manage NIMA AVA Weights & Rubrics', bg='#e0f2fe', border='#7dd3fc')
draw_arrow(50, 118.6, 50, 115.3)

# Box 4: Global Monitoring
draw_box(50, 112.5, 42, 4.8, 'Global Monitoring (Telemetry & Hardware)', '- RTX 3050 CUDA Latency & WebSocket Logs', bg='#e0f2fe', border='#7dd3fc')

# Arrow down to dotted line
draw_arrow(50, 110.1, 50, 107.0)

# Dotted Separator: PHOTOGRAPHER & STUDIO LEVEL
ax.plot([7, 30], [105.5, 105.5], color='#94a3b8', linestyle=':', lw=1.1, zorder=1)
ax.text(50, 105.5, 'PHOTOGRAPHER & STUDIO LEVEL', fontsize=8.0, fontweight='bold', color='#475569', ha='center', va='center')
ax.plot([70, 93], [105.5, 105.5], color='#94a3b8', linestyle=':', lw=1.1, zorder=1)

# Arrow down from separator to Photographer Login
draw_arrow(50, 104.0, 50, 101.4)

# ==================== 2. PHOTOGRAPHER SESSION LEVEL ====================
# Box 5: Photographer Login (Oval)
draw_box(50, 99.5, 30, 3.8, 'Photographer Login (User / Studio)', is_oval=True, bg='#e2e8f0', border='#94a3b8')
draw_arrow(50, 97.6, 50, 94.3)

# Box 6: Initialize Shooting Session
draw_box(50, 91.5, 36, 4.8, 'Initialize Shooting Session', '- Select Camera (Webcam / DSLR / Mobile Stream)', bg='#e0f2fe', border='#7dd3fc')

# Fork from Initialize Shooting Session to 3 Columns: Left(21), Center(50), Right(79)
fork_y = 86.6
ax.plot([50, 50], [89.1, fork_y], color='#64748b', lw=1.1, zorder=2)
ax.plot([21, 79], [fork_y, fork_y], color='#64748b', lw=1.1, zorder=2)
draw_arrow(21, fork_y, 21, 83.8)
draw_arrow(50, fork_y, 50, 83.8)
draw_arrow(79, fork_y, 79, 83.8)

# ==================== 3. THREE PARALLEL BRANCHES ====================
c1_x = 21   # Left column x
c2_x = 50   # Center column x
c3_x = 79   # Right column x
col_w = 23  # Standard column box width

# --- ROW 1 (y = 81.0, h = 5.0) ---
# Left: Select Composition Preset
draw_box(c1_x, 81.0, col_w, 5.0, 'Select Composition Preset', '- Rule of Thirds / Golden Spiral', bg='#e0f2fe', border='#7dd3fc')
draw_arrow(c1_x, 78.5, c1_x, 75.6)

# Center: Live Camera Ingestion
draw_box(c2_x, 81.0, col_w, 5.0, 'Live Camera Ingestion', '- WebRTC 60 FPS Video Stream', bg='#e0f2fe', border='#7dd3fc')
draw_arrow(c2_x, 78.5, c2_x, 75.6)

# Right: Audio & Voice Settings
draw_box(c3_x, 81.0, col_w, 5.0, 'Audio Guidance Settings', '- Voice Coaching & Thresholds', bg='#e0f2fe', border='#7dd3fc')
draw_arrow(c3_x, 78.5, c3_x, 75.6)

# --- ROW 2: FLOW LABELS (Pills, y = 73.8, h = 3.4) ---
draw_box(c1_x, 73.8, 17, 3.4, 'Preset Flow', is_oval=True, bg='#f1f5f9', border='#cbd5e1')
draw_arrow(c1_x, 72.1, c1_x, 68.7)

draw_box(c2_x, 73.8, 21, 3.4, 'Live Viewfinder Flow', is_oval=True, bg='#f1f5f9', border='#cbd5e1')

draw_box(c3_x, 73.8, 17, 3.4, 'System Flow', is_oval=True, bg='#f1f5f9', border='#cbd5e1')
draw_arrow(c3_x, 72.1, c3_x, 68.7)

# Center Row 2 splits into two side-by-side sub-boxes in Row 3!
c_split_y = 70.8
ax.plot([c2_x, c2_x], [72.1, c_split_y], color='#64748b', lw=1.1, zorder=2)
ax.plot([43.2, 56.8], [c_split_y, c_split_y], color='#64748b', lw=1.1, zorder=2)
draw_arrow(43.2, c_split_y, 43.2, 68.4)
draw_arrow(56.8, c_split_y, 56.8, 68.4)

# --- ROW 3 (y = 65.8) ---
# Left: Photographer HUD Settings (Pill, h=4.2)
draw_box(c1_x, 65.8, 20, 4.2, 'HUD Overlay Settings', '- Grid, Reticles & Dials', is_oval=True, bg='#f1f5f9', border='#cbd5e1', title_size=7.6, sub_size=6.3)
draw_arrow(c1_x, 63.7, c1_x, 60.1)

# Center Sub-box A (Left of center, x=43.2, w=12.2, h=4.6)
draw_box(43.2, 65.8, 12.2, 4.6, 'MediaPipe Mesh\n68 Facial Points', bg='#e0f2fe', border='#7dd3fc', title_size=7.0)

# Center Sub-box B (Right of center, x=56.8, w=12.2, h=4.6)
draw_box(56.8, 65.8, 12.2, 4.6, 'NIMA Aesthetic\nRTX 3050 CUDA', bg='#e0f2fe', border='#7dd3fc', title_size=7.0)

# Both converge down into Center Row 4
c_conv_y = 62.0
ax.plot([43.2, 43.2], [63.5, c_conv_y], color='#64748b', lw=1.1, zorder=2)
ax.plot([56.8, 56.8], [63.5, c_conv_y], color='#64748b', lw=1.1, zorder=2)
ax.plot([43.2, 56.8], [c_conv_y, c_conv_y], color='#64748b', lw=1.1, zorder=2)
draw_arrow(c2_x, c_conv_y, c2_x, 60.1)

# Right: Auto-Assistance Active (Pill, h=4.2)
draw_box(c3_x, 65.8, 20, 4.2, 'Auto-Assistance Active', '- Speech Coach Ready', is_oval=True, bg='#f1f5f9', border='#cbd5e1', title_size=7.6, sub_size=6.3)
draw_arrow(c3_x, 63.7, c3_x, 60.1)

# --- ROW 4 (y = 56.8, h = 5.4) ---
# Left: Brain 1 Geometry Engine
draw_box(c1_x, 56.8, col_w, 5.4, 'Brain 1: Geometric Engine', 'MediaPipe Face Detection &\nOpenCV Hough Horizon Tilt', bg='#e0f2fe', border='#7dd3fc', title_size=8.0, sub_size=6.6)
draw_arrow(c1_x, 54.1, c1_x, 50.1)

# Center: Dual-Brain AI Orchestrator
draw_box(c2_x, 56.8, 25, 5.4, 'Dual-Brain AI Engine', 'Real-Time Telemetry Fusion\n(10.84 ms Inference Latency)', bg='#e0f2fe', border='#7dd3fc', title_size=8.0, sub_size=6.6)
draw_arrow(c2_x, 54.1, c2_x, 50.1)

# Right: Voice Synthesis Prompts
draw_box(c3_x, 56.8, col_w, 5.4, 'Corrective Speech Engine', 'Web Speech API Directives\n("Tilt Left", "Step Back")', bg='#e0f2fe', border='#7dd3fc', title_size=8.0, sub_size=6.6)
draw_arrow(c3_x, 54.1, c3_x, 50.1)

# --- ROW 5: ACCENT EVALUATION LEVEL (y = 46.8, h = 6.0) ---
# Left: Spatial Heuristic Scoring (Darker blue accent, matching HackEval)
draw_box(c1_x, 46.8, col_w, 6.0, 'Spatial Threshold Checks', 'Headroom Clearance (15-20%)\nHorizon Tilt (+/-2.0 deg)\nRule of Thirds Alignment', 
         bg='#bfdbfe', border='#60a5fa', text_color='#1e3a8a', title_size=8.0, sub_size=6.4)

# Center: Real-Time 60 FPS Canvas HUD (Wide accent box)
draw_box(c2_x, 46.8, 27, 6.0, 'Real-Time 60 FPS HUD Overlay', 'Rule-of-Thirds Grid, Target Reticles\nLive Horizon Bar & Composite Dial', 
         bg='#bfdbfe', border='#60a5fa', text_color='#1e3a8a', title_size=8.0, sub_size=6.4)

# Right: Automated Pre-Capture QC (Accent box)
draw_box(c3_x, 46.8, col_w, 6.0, 'Automated QC Presets', 'Black Frame Sensor Alert\nSubject Proximity / Shake\nAspect Ratio Locks (9:16 / 4:5)', 
         bg='#bfdbfe', border='#60a5fa', text_color='#1e3a8a', title_size=8.0, sub_size=6.4)

# Lateral horizontal arrows into Center HUD (matching HackEval horizontal arrows into Plagiarism Detection)
draw_arrow(c1_x + col_w/2, 46.8, c2_x - 13.5, 46.8)
draw_arrow(c3_x - col_w/2, 46.8, c2_x + 13.5, 46.8)

# ==================== 4. BOTTOM CONVERGENCE & ARCHIVAL ====================
# Down arrows straight from Row 5 into Bottom Module (Clean and direct, matching HackEval!)
draw_arrow(c1_x, 43.8, c1_x, 34.6)
draw_arrow(c2_x, 43.8, c2_x, 34.6)
draw_arrow(c3_x, 43.8, c3_x, 34.6)

# Bottom Box: Capture, Archival & Analytics Module (Medium blue, white text)
draw_box(50, 31.0, 68, 6.6, 'Capture, Archival & Analytics Module', 
         'One-Click Full-Res Shutter -> AWS S3 / Local Media  |  MongoDB Telemetry Persist + Session Audit PDF', 
         bg='#3b82f6', border='#1d4ed8', text_color='#ffffff', title_size=9.0, sub_size=7.4)

# Figure Caption at bottom (exact same format as friend's HackEval diagram)
ax.text(50, 20.0, 'Figure 3.1: Level 0 DFD – Context Diagram', 
        fontsize=11.5, fontweight='bold', style='italic', color='#0f172a', ha='center', va='center')

plt.subplots_adjust(left=0.03, right=0.97, top=0.98, bottom=0.06)
plt.savefig(r'D:\FrameSense-AI\level0_dfd_diagram.png', dpi=300, facecolor='white', bbox_inches='tight')
plt.savefig(r'C:\Users\devku\Downloads\FrameSense_Level0_DFD_Diagram.png', dpi=300, facecolor='white', bbox_inches='tight')
print('SUCCESSFULLY GENERATED REFINED DFD LEVEL 0 DIAGRAM')
