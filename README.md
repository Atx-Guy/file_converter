# Convert It — File Converter Web App

A Flask-based web application that lets users convert audio, image, and document files between popular formats directly in the browser.

---

## Use Cases

- **Audio conversion** — Convert audio files between WAV, MP3, OGG, FLAC, AAC, and M4A.
- **Image conversion** — Convert images between PNG, JPG/JPEG, GIF, and WebP.
- **Document conversion** — Convert documents between PDF, DOCX, TXT, Markdown (MD), and HTML.
- **User accounts** — Sign up, log in, and manage conversions with a personal account.
- **Custom output filenames** — Optionally rename the converted file before downloading.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3, [Flask](https://flask.palletsprojects.com/) |
| Database | SQLite via [Flask-SQLAlchemy](https://flask-sqlalchemy.palletsprojects.com/) |
| Authentication | [Flask-Login](https://flask-login.readthedocs.io/), [Flask-Bcrypt](https://flask-bcrypt.readthedocs.io/) |
| Audio conversion | [FFmpeg](https://ffmpeg.org/) (auto-downloaded on Windows) |
| Image conversion | [Pillow](https://python-pillow.org/) |
| Document conversion | python-docx, docx2pdf, pdf2docx, pdfminer.six, pdfkit, html2text, markdown, BeautifulSoup4 |
| Frontend | HTML5, Bootstrap 5, JavaScript |

---

## Prerequisites

- Python 3.8+
- `pip`
- **For document → PDF conversion:** [wkhtmltopdf](https://wkhtmltopdf.org/downloads.html) must be installed and on your `PATH` (required by `pdfkit`).
- **For audio conversion on Windows:** FFmpeg is downloaded automatically the first time an audio conversion is run.
- **For audio conversion on Linux/macOS:** Install FFmpeg manually (`sudo apt install ffmpeg` or `brew install ffmpeg`) and ensure it is on your `PATH`.

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/Atx-Guy/file_converter.git
cd file_converter
```

### 2. Create and activate a virtual environment

```bash
python -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r modules.txt
```

> **Note:** The dependency file is named `modules.txt`. If `pip install -r` does not work directly, install each package listed in the file manually or rename it to `requirements.txt`.

### 4. Initialize the database

```bash
python init_db.py
```

This creates the SQLite database (`instance/users.db`) with all required tables.

### 5. Run the application

```bash
python app.py
```

The server starts on `http://0.0.0.0:5000`. Open `http://localhost:5000` in your browser.

---

## Project Structure

```
file_converter/
├── app.py               # Main Flask application & conversion routes
├── audio_converter.py   # Audio conversion logic using FFmpeg
├── models.py            # SQLAlchemy User model
├── init_db.py           # Database initialisation script
├── modules.txt          # Python dependencies
├── templates/           # Jinja2 HTML templates
│   ├── index.html
│   ├── login.html
│   └── signup.html
├── static/              # CSS, JS, and image assets
│   ├── css/
│   ├── js/
│   └── img/
├── ffmpeg-static/       # Auto-downloaded FFmpeg binary (Windows)
└── temp/                # Temporary files during conversion (auto-created)
```

---

## Supported Conversions

### Audio
| From \ To | WAV | MP3 | OGG | FLAC | AAC | M4A |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| WAV | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| MP3 | ✅ | — | ✅ | ✅ | ✅ | ✅ |
| OGG | ✅ | ✅ | — | ✅ | ✅ | ✅ |
| FLAC | ✅ | ✅ | ✅ | — | ✅ | ✅ |
| AAC | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| M4A | ✅ | ✅ | ✅ | ✅ | ✅ | — |

### Images
PNG, JPG/JPEG, GIF, WebP ↔ any of the above.

### Documents
PDF, DOCX, TXT, Markdown, HTML ↔ any of the above.
