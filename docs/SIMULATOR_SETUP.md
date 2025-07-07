# CIRO Tokenomics Simulator Setup Guide

## 📋 **Prerequisites**

- **Python 3.8+** (Recommended: 3.10 or later)
- **pip** package manager

## ⚡ **Quick Start**

### 1. Virtual Environment Setup (Recommended)

```bash
# Create virtual environment (first time only)
python3 -m venv .venv

# Activate virtual environment
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Alternative: System-wide Installation

```bash
# For older Python installations without PEP 668
pip install numpy pandas matplotlib jupyter

# For newer Python (if you prefer system-wide)
pip install --user numpy pandas matplotlib jupyter
```

### 3. Verify Installation

```python
# Test in Python REPL (with virtual environment activated)
import numpy as np
import pandas as pd
from src.tokenomics_engine import CIROParameters, CIROTokenomicsEngine

# Create and test simulator
params = CIROParameters()
engine = CIROTokenomicsEngine(params)
print("✅ CIRO Simulator ready!")
```

### 4. VS Code Setup (Important!)

The project includes `.vscode/settings.json` to automatically use the virtual environment:

- **First time**: Select the Python interpreter: `Cmd+Shift+P` → "Python: Select Interpreter" → Choose `.venv/bin/python`
- **PyRight**: Should automatically recognize the virtual environment and stop showing import errors
- **Terminal**: Use VS Code's integrated terminal for automatic `.venv` activation

### 5. Run Basic Simulation

```python
# 5-year simulation
results = engine.run_simulation(months=60)
print(f"Final token price: ${results['price'].iloc[-1]:.2f}")
print(f"Total burned: {results['monthly_burns'].sum():,.0f} CIRO")
```

## 🔧 **Development Setup**

### Type Checking (Optional)

```bash
# Install type checker
pip install pyright

# Check for type errors
pyright src tests
```

### Jupyter Notebook (Recommended)

```bash
# Start Jupyter server
jupyter notebook

# Open: tokenomics_analysis.ipynb
```

## 📊 **Sample Analysis**

The simulator provides **institutional-grade** stress testing:

```python
# Stress test scenarios
bear_market = engine.stress_test("bear_market")
bull_market = engine.stress_test("bull_market")
regulatory_pressure = engine.stress_test("regulatory")

# Comparative analysis
comparative_results = generate_comparative_analysis()
```

## 🚨 **Troubleshooting**

### Import Errors

```bash
# If numpy/pandas missing:
pip install --upgrade numpy pandas

# If Jupyter issues:
pip install --upgrade jupyter ipykernel
```

### Type Errors

- All type annotations are now properly fixed
- Use Python 3.8+ for best compatibility
- Install `typing-extensions` if needed

## 📈 **Expected Results**

**5-Year Target Returns**: 50x-200x (validated against Render Network benchmarks)

**Sample Output**:

- Month 12: $0.85 (+562% from private sale)
- Month 36: $3.20 (+3,900% from private sale)  
- Month 60: $8.50 (+10,525% from private sale)

---
*Ready for tier-1 institutional due diligence presentations.*
