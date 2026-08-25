# 🎨 ART

A deliberately vulnerable pencil sketch e-commerce web application built for cybersecurity assignment demonstrating 30+ real-world vulnerabilities.

## 🛠 Tech Stack
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend:** PHP 8
- **Database:** MySQL (MariaDB)
- **Hosting:** InfinityFree
- **Lines of Code:** 2,690+

## 📌 Features
- 🛒 Buy sketches & custom order with pricing plans
- 👤 User authentication (Register/Login/Dashboard)
- 🛡️ Admin panel with full CRUD operations
- 📸 Multi-image upload with carousel view
- 📱 Fully responsive dark theme
- 🔒 Change password functionality

## ⚠️ Vulnerabilities Demonstrated (30+)

| Category | Vulnerability |
|----------|--------------|
| **Authentication** | Hardcoded credentials, weak password policy, plaintext passwords, no brute-force protection, username enumeration |
| **Authorization** | Broken access control, IDOR, missing authentication checks, mass assignment |
| **Input Validation** | Price manipulation via URL/forms, XSS (stored), SQL injection, unrestricted file upload |
| **Data Exposure** | Plaintext passwords in DB, sensitive data in admin panel, information disclosure |
| **Session Management** | localStorage sessions, no expiry, no HttpOnly/Secure flags |

## 🧠 Why I Built This

Most students submit DVWA screenshots. I built an actual business website that works perfectly — until someone tries to hack it. My teacher gets to play attacker on a real-looking site, not some purple-themed lab.

## 🔥 The Hacker's Playground

| Category | What's Broken |
|----------|---------------|
| **Authentication** | Hardcoded credentials, plaintext passwords, no brute-force lockout, username enumeration |
| **Authorization** | IDOR on orders, admin panel accessible to anyone, mass assignment on registration |
| **Input Validation** | Price tampering via URL params, XSS in order notes, unrestricted file upload (upload a shell!) |
| **Session Management** | localStorage sessions (no expiry, stealable via XSS), no HttpOnly flags |
| **Data Exposure** | All user passwords visible in admin panel, session tokens on dashboard |
| **Business Logic** | Change price to PKR 1 in URL and buy sketches for free |

## 🛠 Tech Stack

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![PHP](https://img.shields.io/badge/PHP-777BB4?style=flat&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat&logo=mysql&logoColor=white)

- **Frontend:** Vanilla HTML/CSS/JS — no frameworks, pure pain
- **Backend:** PHP 8 with PDO (prepared statements where I remembered)
- **Database:** MySQL/MariaDB
- **Hosting:** InfinityFree (free tier, baby)
- **Lines of Code:** 2,690+

## 🚀 Quick Start (If You Want to Break It)

```bash
# Clone
git clone https://github.com/mokasha446/final-vuln-web.git

# Host on XAMPP/LAMP
# Import database.sql
# Update php/db.php with your credentials
# Visit localhost and start hacking
```

**Test Credentials:**
- Admin: `admin@okasha.com` / `admin123`
- User: `user@okasha.com` / `1234`

## 🎯 Try These Attacks

```bash
# 1. Price Manipulation
curl "http://site.com/detail.html?id=1&price=1"  # Buy sketch for PKR 1

# 2. XSS
# Type in order notes: <script>alert(document.cookie)</script>

# 3. IDOR
# Change order_id in URL to view anyone's order

# 4. Mass Assignment
# In console: document.getElementById('rRole').value = 'admin'
# Register as admin

# 5. Upload a shell
# Custom order page accepts .php files
```

## 📂 Project Structure

```
romee-sketch/
├── index.html                 # Homepage with dynamic gallery
├── css/style.css              # Modern dark theme with glassmorphism
├── js/main.js                 # JavaScript functionality
├── pages/
│   ├── gallery.html           # Filterable sketch gallery
│   ├── detail.html            # Buy sketch + image carousel
│   ├── custom-order.html      # Order custom sketch (vulnerable)
│   ├── login.html             # Login (hardcoded creds)
│   ├── register.html          # Register (mass assignment)
│   ├── dashboard.html         # User orders (IDOR)
│   ├── admin.html             # Admin CRUD (no auth check)
│   ├── order-detail.html      # View single order
│   └── change-password.html   # Password change (no re-auth)
└── php/
    ├── db.php                 # Database connection
    ├── login.php              # Plaintext password check
    ├── register.php           # Plaintext storage
    ├── order.php              # Price from frontend (trusting user!)
    └── ... (14 files total)
```

## 🏴‍☠️ Vulnerability Count: 30+

Too many to list. Check the code comments — every `VULN:` tag is intentional.

## 👨‍💻 Developer

**Okasha Rajput**
- 💻 I break web applications (ethically)
- 🎓 Cybersecurity Student

## ⚠️ Disclaimer

This project is **intentionally vulnerable** for educational purposes. Do NOT use this code in production. I know exactly what's broken and where. Built for a cybersecurity assignment — hack away, professor.
