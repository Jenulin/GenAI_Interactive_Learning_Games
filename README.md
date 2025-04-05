# GenAI_Interactive_Learning_Games

## Follow The Instructions

### ✅ Install Python  
Ensure Python is installed on your system. Verify by running:

```bash
python --version
```

---

### ✅ Install Required Libraries

```bash
npm install phaser
node -v
npm -v
pip install flask
pip install groq
pip install flask-cors
```

---

### ✅ To get `node_modules`, run:

```bash
npm install
```

---

### ✅ Run the frontend server

```bash
npm run dev
```

---

### ✅ Open another terminal and go to the backend folder:

```bash
cd backend
```

---

### ✅ Run the backend server

```bash
python test.py
```

---

## 🔐 Important:

This project uses an API key. Replace `"your_api_key_here"` with your actual **Groq API key** inside the `test.py` file:

```python
client = Groq(api_key="your_api_key")
```
