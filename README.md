<div align="center">

<img src="https://cdn.simpleicons.org/imdb" width="60" alt="watchLOG logo"/>

# watchLOG

![Status](https://img.shields.io/badge/Status-In%20Development-yellow?style=flat-square)

**A personal backlog for tracking and rating TV series you've watched**

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E)

</div>

---

## Overview

**watchLOG** is a web application designed to help users manage their TV series watching experience. Keep track of series you want to watch, rate the ones you've completed, get personalized recommendations, and maintain a backlog of your entertainment journey.

---

## Features

- **Series backlog** — add series you want to watch and organize them
- **Ratings system** — rate completed series
- **Recommendation system** — get personalized series suggestions

---

## Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.10+ |
| Node.js | 20.19+ |
| npm | 10+ |

---

## 1. Clone the repository

```bash
git clone https://github.com/lucassbertol/watchLOG.git
cd watchLOG
```

---

## 2. Environment variables

Fill in your API keys in `backend/.env.example` and rename the file to `.env`.

---

## 3. Install dependencies

### Linux

```bash
cd linux
chmod +x installDependencies.sh
./installDependencies.sh
```

### Windows

```cmd
cd windows
installDependencies.bat
```

This will:
1. Create a Python virtual environment in `backend/venv`
2. Install all Python dependencies
3. Install Playwright browsers
4. Install Node.js dependencies
5. Run database migrations

---

## 4. Run the application

### Linux

```bash
cd linux
./watchLOG.sh
```

### Windows

```cmd
cd windows
watchLOG.bat
```

This will:
1. Run database migrations
2. Open a terminal with the **Backend** (Django) at `http://localhost:8000`
3. Open a terminal with the **Frontend** (Vite) at `http://localhost:5173`

---

## Manual setup

If you prefer to run commands manually:

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # Linux
# venv\Scripts\activate    # Windows
pip install -r requirements.txt
python -m playwright install
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

The application will be available at `http://localhost:5173`.
