# 🌾 Payir Kaavalan (CropCare AI)
### Intelligent Crop Disease Diagnostic, Advisory & Tele-Agronomy System

[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20(Python)-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PyTorch](https://img.shields.io/badge/AI%2FML-PyTorch%20MobileNetV3-EE4C2C?logo=pytorch&logoColor=white)](https://pytorch.org/)
[![Database](https://img.shields.io/badge/Database-SQLite%20%2B%20SQLAlchemy-003B57?logo=sqlite&logoColor=white)](https://sqlite.org/)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 📌 1. Project Overview

**Payir Kaavalan (CropCare AI)** is an end-to-end smart agricultural platform designed to empower farmers with instant, laboratory-grade plant disease diagnostics, actionable treatment guidance, disease outbreak warnings, and direct tele-consultation with agronomists.

By snapping a photo of a sick leaf, farmers receive:
1. **Deep Learning Pathogen Identification**: Sub-second visual disease detection with confidence scores.
2. **Explainable AI (XAI) via Grad-CAM**: Visual heatmaps explaining *why* the model made its decision, highlighting lesions and chlorotic tissue.
3. **Automated Agronomic Treatment Plans**: Bio-fungicides, chemical controls, dosage guidance, spray safety protocols, and pre-harvest intervals (PHI).
4. **Microclimate Disease Risk Advisory**: Real-time humidity and weather correlation to forecast fungal infection risks before outbreaks happen.
5. **Expert Review Escalation**: Direct connection with agricultural officers for ambiguous or severe cases.

---

## 🏗️ 2. System Architecture & End-to-End Flow

```
   ┌────────────────────────────────────────────────────────┐
   │                  Farmer / User Device                  │
   │  (Mobile Browser / Desktop - React 18 + Tailwind CSS)   │
   └───────────────────────────┬────────────────────────────┘
                               │
               1. Leaf Upload / Camera Stream
                               ▼
   ┌────────────────────────────────────────────────────────┐
   │             Client Quality Pre-Validation              │
   │   - Resolution check, Canvas brightness calculation    │
   └───────────────────────────┬────────────────────────────┘
                               │
               2. HTTP POST Multipart / Base64
                               ▼
   ┌────────────────────────────────────────────────────────┐
   │           FastAPI Backend (Uvicorn ASGI Engine)        │
   │  - Auth (JWT/Bcrypt)  - CRUD Routing  - Upload Storage │
   └───────────────┬────────────────────────┬───────────────┘
                   │                        │
       3. Run Inference Pipeline     4. Save Assessment Record
                   ▼                        ▼
   ┌───────────────────────────────┐ ┌──────────────────────┐
   │    PyTorch ML Inference       │ │   SQLite Database    │
   │  - MobileNetV3-Small Backbone │ │   (SQLAlchemy ORM)   │
   │  - Softmax Classification     │ │  - Diagnoses History │
   │  - Grad-CAM Heatmap Generator │ │  - Crops & Reminders │
   │  - Agronomic Knowledge Base   │ │  - Expert Reviews    │
   └───────────────┬───────────────┘ └──────────────────────┘
                   │
           5. Diagnostic JSON + Grad-CAM Heatmap
                   ▼
   ┌────────────────────────────────────────────────────────┐
   │             Interactive Frontend Dashboard             │
   │  - Diagnosis breakdown, Grad-CAM slider, Health trend  │
   └────────────────────────────────────────────────────────┘
```

---

## 🛠️ 3. Complete Tech Stack Breakdown & Justification ("Why Did We Use This?")

### 💻 A. Frontend Stack

| Technology | Purpose | Why We Chose It (Mentor Defense) |
| :--- | :--- | :--- |
| **React 18** | UI Architecture | **Component-driven & Declarative:** Enables modular cards (e.g., scanner, health trends, history) and fast re-renders with virtual DOM. |
| **Vite 8** | Build Tool & Dev Server | **Blazing-Fast Speed:** Uses native ES modules (ESM) in development, delivering instantaneous Hot Module Replacement (HMR) and optimized Rollup production bundles. |
| **Tailwind CSS** | Styling & UI Design System | **Custom Agricultural Palette & Responsiveness:** Clean styling with glassmorphism, responsive mobile-first layouts, and zero CSS bloat via purge-on-build. |
| **Lucide React** | Icons System | **Lightweight & Consistent:** Modern SVG icon set covering agronomy, weather, camera controls, and status badges with tree-shaking support. |
| **React Router v6** | Client-Side Routing | **Seamless SPA Navigation:** Handles protected routes (user authentication, expert portals) without reloading the page. |
| **Axios & Fetch API** | Networking / API Client | **REST Communications:** Handles multipart/form-data image uploads, error handling, and JSON responses. |

---

### ⚙️ B. Backend Stack

| Technology | Purpose | Why We Chose It (Mentor Defense) |
| :--- | :--- | :--- |
| **FastAPI (Python 3.10+)** | REST API Framework | **Asynchronous & High-Performance:** Built on Starlette and Pydantic. It is one of the fastest Python frameworks available, supports async/await natively, and has seamless interop with PyTorch and Python data science packages. |
| **Uvicorn** | ASGI Web Server | **Production-Grade Concurrency:** Lightning-fast ASGI server implementation using `uvloop` for handling concurrent requests. |
| **Pydantic v2** | Data Validation & Schemas | **Type Safety:** Validates request payloads (image URLs, base64 data, form fields) and provides automated documentation. |
| **SQLAlchemy 2.0** | Object-Relational Mapper (ORM) | **Clean Data Abstraction:** Eliminates raw SQL vulnerabilities (SQL injection protection) and provides type-safe mapping between Python classes and database tables. |
| **SQLite** | Embedded Relational Database | **Zero-Configuration & Reliable:** Self-contained, serverless database engine that stores users, diagnoses, crops, and expert consultations locally with transactional ACID compliance. |
| **Passlib (Bcrypt) + Python-Jose** | Authentication & Security | **Industry Standards:** Cryptographically secure password hashing using salted Bcrypt and stateless JSON Web Tokens (JWT) for secure authentication. |

---

### 🧠 C. Artificial Intelligence & Computer Vision (AI/ML)

| Technology | Purpose | Why We Chose It (Mentor Defense) |
| :--- | :--- | :--- |
| **PyTorch (torch & torchvision)** | Deep Learning Framework | **Flexibility & Deployment:** Premier framework for computer vision research and production inference. Provides torch vision transforms and clean autograd differentiation. |
| **MobileNetV3-Small** | Neural Network Architecture | **Edge-Optimized Efficiency:** Uses depthwise separable convolutions, inverted residual blocks, and Squeeze-and-Excitation (SE) attention. Weighs only **~6MB**, performs inference in **<150ms on CPU**, making it ideal for rural deployments without expensive GPU servers. |
| **Grad-CAM (Gradient-Weighted Class Activation Mapping)** | Explainable AI (XAI) | **Trust & Transparency:** Computes the gradients of the target class score with respect to feature maps in the final convolutional layer (`model.features[-1]`). Creates a visual heatmap showing *exactly which lesions* guided the AI's diagnosis. |
| **Pillow (PIL) & NumPy** | Image Preprocessing & Metrics | **Input Normalization:** Resizes images to $256\times256$, center-crops to $224\times224$, normalizes with ImageNet statistics ($\mu, \sigma$). Computes Laplacian variance for image sharpness/blur detection. |

---

## 🔬 4. Deep Learning Methodology & Training

### 1. Dataset & Classes
- **Benchmark Source:** PlantVillage agricultural disease dataset.
- **Classes Supported:**
  - `Tomato_Bacterial_spot` (*Xanthomonas perforans*)
  - `Tomato_Early_blight` (*Alternaria solani*)
  - `Tomato_Late_blight` (*Phytophthora infestans*)
  - `Tomato_Leaf_Mold` (*Passalora fulva*)
  - `Tomato_Septoria_leaf_spot` (*Septoria lycopersici*)
  - `Tomato_Spider_mites_Two_spotted_spider_mite` (*Tetranychus urticae*)
  - `Tomato_Target_Spot` (*Corynespora cassiicola*)
  - `Tomato_YellowLeaf_Curl_Virus` (*TYLCV*)
  - `Tomato_mosaic_virus` (*ToMV*)
  - `Tomato_healthy` / Crop Healthy Baseline

### 2. Cross-Crop Biological Knowledge Mapping
- **The Solanaceae Link:** Tomato (*Solanum lycopersicum*) and Potato (*Solanum tuberosum*) share the same botanical family and are susceptible to identical pathogens, notably ***Alternaria solani* (Early Blight)** and ***Phytophthora infestans* (Late Blight)**.
- **Dynamic Crop Adaptation:** When a farmer scans a Potato leaf with *Alternaria solani*, the system:
  1. Identifies the characteristic target-ring lesions.
  2. Maps the diagnosis to **`Potato - Early Blight (Alternaria solani)`**.
  3. Provides **potato-specific agronomy** (tuber protection, hilling up soil, dehaulming before harvest) instead of tomato-specific trellising advice.

### 3. Explainable AI: Grad-CAM Formulation
Grad-CAM calculates the importance weight $\alpha_k^c$ for each feature map $A^k$ of the final convolutional layer for class $c$:

$$\alpha_k^c = \frac{1}{Z} \sum_{i} \sum_{j} \frac{\partial Y^c}{\partial A_{i,j}^k}$$

$$L_{\text{Grad-CAM}}^c = \text{ReLU}\left( \sum_k \alpha_k^c A^k \right)$$

The resulting activation map is upsampled to the original image dimensions and blended with a `jet` colormap overlay ($\alpha=0.45$).

---

## 🚀 5. How to Run the Project Locally

### Prerequisites
- Node.js (v18 or higher)
- Python 3.10+ with pip and virtual environment support

### Step 1: Start the Backend (FastAPI + PyTorch)
Open a terminal in the project root:
```powershell
# Using the PowerShell launcher:
.\run-backend.ps1

# OR manually:
cd backend
..\CropCareAI\.venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
- API Swagger Docs will be available at: **`http://localhost:8000/docs`**

### Step 2: Start the Frontend (React + Vite)
Open a second terminal in the project root:
```bash
npm run dev
```
- Open your browser at: **`http://localhost:5173`**

---

## 🎯 6. Key Questions Mentors Will Ask (& How to Answer)

### Q1: "Why did you use MobileNetV3 instead of ResNet-50 or VGG-16?"
> **Answer:** *"ResNet-50 is ~98MB and VGG-16 is over 500MB, requiring significant RAM and GPU power. In real agricultural contexts, farmers and local centers have limited compute or operate on low-bandwidth networks. MobileNetV3-Small weighs only ~6MB, runs inference in under 150ms on standard CPUs without GPU hardware, and achieves comparable top-1 accuracy on leaf pathology benchmarks due to inverted residuals and Squeeze-and-Excitation attention."*

### Q2: "How do you solve the 'Black Box' problem in AI?"
> **Answer:** *"Deep learning models often make correct predictions for wrong reasons (e.g., learning background soil or water drops). We integrated **Grad-CAM (Explainable AI)**. It traces back gradients to the final convolutional layer and overlays a thermal heatmap showing exactly which leaf lesions triggered the classification. This builds trust with farmers and agronomists."*

### Q3: "What prevents the user from uploading a blurry or non-leaf image?"
> **Answer:** *"We built a two-stage quality pre-validation pipeline: client-side canvas inspection and server-side Laplacian variance blur scoring ($\text{Var}(\nabla^2 I) < 50$), alongside brightness thresholding ($35 < \text{brightness} < 230$) and minimum resolution checks before executing deep learning inference."*

### Q4: "Why did potato and tomato return the same disease (Alternaria solani)?"
> **Answer:** *"Both crops belong to the Solanaceae family and are infected by the exact same fungal pathogen, Alternaria solani. The symptoms (concentric target rings with chlorotic margins) are visually and biologically identical. The system recognizes the pathogen and formats crop-specific management plans (tuber protection for potato, canopy trellising for tomato)."*

---

## 📁 7. Project Folder Structure

```
├── CropCareAI/             # ML Research & Model Training
│   ├── datasets/           # PlantVillage dataset & train/val splits
│   ├── ml/                 # train.py, evaluate.py, gradcam.py
│   └── models/             # cropcare_tomato_best.pth (~6MB weights)
├── backend/                # FastAPI Application
│   ├── main.py             # REST endpoints, CORS, database setup
│   ├── ml_service.py       # PyTorch ModelManager, inference & Grad-CAM
│   ├── models.py           # SQLAlchemy database schemas
│   ├── schemas.py          # Pydantic request/response models
│   ├── auth.py             # JWT token handling & Bcrypt hashing
│   └── uploads/            # Uploaded leaves & generated Grad-CAM heatmaps
├── src/                    # React Frontend
│   ├── components/         # Reusable UI (CropHealthTrend, Navbar, etc.)
│   ├── pages/              # Scan, Dashboard, History, Expert, MyCrops
│   ├── lib/                # cropData.js, i18n, weather service
│   └── api/                # apiClient.js (connects to FastAPI backend)
├── package.json            # Frontend dependencies
├── vite.config.js          # Vite build configuration
└── README.md               # Project documentation
```

---

## 👨‍🌾 Author & Academic Note
Developed as an intelligent smart-farming solution combining Deep Learning, Explainable AI, and Modern Web Engineering.
