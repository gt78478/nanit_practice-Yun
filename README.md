# 🌸 BeautyShop Chile

> Интернет-магазин косметической продукции, ориентированный на чилийский рынок.
> Учебный проект — полный стек от базы данных до фронтенда.

![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2023-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 📋 Содержание

- [О проекте](#-о-проекте)
- [Стек технологий](#-стек-технологий)
- [Архитектура](#-архитектура)
- [Функциональность](#-функциональность)
- [Быстрый старт](#-быстрый-старт)
- [Структура проекта](#-структура-проекта)
- [API Документация](#-api-документация)
- [База данных](#-база-данных)
- [Переменные окружения](#-переменные-окружения)
- [Деплой](#-деплой)
- [Диаграммы](#-диаграммы)
- [Авторы](#-авторы)

---

## 🛍 О проекте

**BeautyShop Chile** — полнофункциональный интернет-магазин косметики с поддержкой двух языков (español / english), локализацией под чилийский рынок (CLP, RUT, регионы Чили) и интеграцией платёжной системы Mercado Pago.

Проект разработан в рамках учебной практики и демонстрирует реализацию:
- REST API на FastAPI с JWT-авторизацией
- Реляционной базы данных PostgreSQL с ORM и миграциями
- Адаптивного фронтенда на Vanilla JS без тяжёлых фреймворков
- Интеграции с внешними платёжными сервисами

---

## 🛠 Стек технологий

### Backend
| Технология | Версия | Назначение |
|---|---|---|
| Python | 3.11+ | Основной язык бэкенда |
| FastAPI | 0.111 | REST API фреймворк |
| SQLAlchemy | 2.x async | ORM для работы с БД |
| Alembic | 1.13 | Миграции базы данных |
| Pydantic v2 | 2.x | Валидация данных и схемы |
| python-jose | 3.x | JWT токены |
| bcrypt | 4.x | Хэширование паролей |
| uvicorn | 0.29 | ASGI сервер |

### Frontend
| Технология | Назначение |
|---|---|
| HTML5 + CSS3 | Разметка и стилизация |
| Vanilla JavaScript (ES2023) | Логика и взаимодействие с API |
| Vite 5 | Сборщик и dev-сервер |
| CSS Custom Properties | Дизайн-система |

### База данных и инфраструктура
| Технология | Назначение |
|---|---|
| PostgreSQL 16 | Основная СУБД |
| Docker / docker-compose | Локальное окружение |
| Railway / Render | Деплой (production) |
| GitHub Actions | CI/CD |

### Внешние сервисы
| Сервис | Назначение |
|---|---|
| Mercado Pago | Основная платёжная система (Чили) |
| Stripe | Резервная платёжная система |
| Webpay (Transbank) | Локальная чилийская система |
| SendGrid / SMTP | Транзакционные email |

---

## 🏗 Архитектура

```
┌─────────────────┐     HTTP/JSON      ┌─────────────────────────────────┐
│                 │ ─────────────────► │           FastAPI Backend        │
│    Frontend     │                    │                                  │
│  HTML/CSS/JS    │ ◄───────────────── │  Routers → Services → ORM       │
│    (Vite)       │     JSON Response  │                                  │
└─────────────────┘                    └──────────────┬──────────────────┘
                                                      │ SQLAlchemy async
                                                      ▼
                                          ┌─────────────────────┐
                                          │    PostgreSQL DB     │
                                          │  (16 таблиц)        │
                                          └─────────────────────┘
                                                      
                                       External Services:
                                       ┌──────────────────┐
                                       │  Mercado Pago    │
                                       │  Stripe          │
                                       │  SendGrid        │
                                       └──────────────────┘
```

---

## ✅ Функциональность

### 👤 Для покупателей
- [x] Регистрация и авторизация (JWT access + refresh токены)
- [x] Просмотр каталога с фильтрацией по категории, бренду, цене
- [x] Полнотекстовый поиск по товарам
- [x] Страница товара с галереей, описанием и отзывами
- [x] Корзина (для гостей и авторизованных)
- [x] Wishlist (список желаний)
- [x] Оформление заказа с выбором адреса и доставки
- [x] Оплата через Mercado Pago / Stripe
- [x] История заказов и отслеживание статуса
- [x] Личный кабинет: профиль, адреса, отзывы
- [x] Email-уведомления о заказе

### ⚙️ Для администраторов
- [x] CRUD товаров и категорий
- [x] Управление заказами и статусами
- [x] Управление пользователями и ролями
- [x] Промокоды и скидки
- [x] Дашборд со статистикой

### 🌐 Локализация
- [x] Испанский (es-CL) — основной язык
- [x] Английский (en) — дополнительный
- [x] Валюта CLP (формат `$12.990`)
- [x] Поле RUT в форме оплаты
- [x] Регионы Чили в форме адреса

---

## 🚀 Быстрый старт

### Требования
- Python 3.11+
- Node.js 18+
- PostgreSQL 16 (или Docker)
- Git

### 1. Клонирование репозитория

```bash
git clone https://github.com/your-username/beautyshop-chile.git
cd beautyshop-chile
```

### 2. Запуск PostgreSQL через Docker

```bash
docker-compose up -d postgres
```

> Или укажи строку подключения к существующей БД в `.env`

### 3. Настройка бэкенда

```bash
cd backend

# Создать виртуальное окружение
python -m venv venv
source venv/bin/activate        # Linux / macOS
# venv\Scripts\activate         # Windows

# Установить зависимости
pip install -r requirements.txt

# Скопировать и заполнить переменные окружения
cp .env.example .env

# Применить миграции
alembic upgrade head

# Загрузить тестовые данные
python seed.py

# Запустить сервер
uvicorn app.main:app --reload --port 8000
```

API будет доступно на: `http://localhost:8000`
Swagger UI: `http://localhost:8000/docs`

### 4. Настройка фронтенда

```bash
cd frontend

# Установить зависимости
npm install

# Скопировать переменные
cp .env.example .env

# Запустить dev-сервер
npm run dev
```

Фронтенд будет доступен на: `http://localhost:5173`

---

## 📁 Структура проекта

```
beautyshop-chile/
│
├── backend/
│   ├── app/
│   │   ├── main.py               # Точка входа FastAPI
│   │   ├── config.py             # Настройки (Pydantic Settings)
│   │   ├── database.py           # Подключение к БД, сессии
│   │   │
│   │   ├── routers/              # FastAPI роутеры
│   │   │   ├── auth.py
│   │   │   ├── products.py
│   │   │   ├── cart.py
│   │   │   ├── orders.py
│   │   │   ├── payments.py
│   │   │   ├── users.py
│   │   │   ├── reviews.py
│   │   │   └── admin.py
│   │   │
│   │   ├── services/             # Бизнес-логика
│   │   │   ├── auth_service.py
│   │   │   ├── product_service.py
│   │   │   ├── cart_service.py
│   │   │   ├── order_service.py
│   │   │   ├── payment_service.py
│   │   │   └── email_service.py
│   │   │
│   │   ├── models/               # SQLAlchemy модели
│   │   │   ├── user.py
│   │   │   ├── product.py
│   │   │   ├── order.py
│   │   │   └── ...
│   │   │
│   │   ├── schemas/              # Pydantic схемы
│   │   │   ├── auth.py
│   │   │   ├── product.py
│   │   │   └── ...
│   │   │
│   │   └── middleware/
│   │       ├── auth.py           # JWT middleware
│   │       └── cors.py
│   │
│   ├── migrations/               # Alembic миграции
│   │   └── versions/
│   ├── tests/
│   ├── seed.py                   # Тестовые данные
│   ├── requirements.txt
│   ├── .env.example
│   └── alembic.ini
│
├── frontend/
│   ├── src/
│   │   ├── pages/                # HTML страницы
│   │   │   ├── index.html
│   │   │   ├── catalog.html
│   │   │   ├── product.html
│   │   │   ├── cart.html
│   │   │   ├── checkout.html
│   │   │   └── profile.html
│   │   │
│   │   ├── js/
│   │   │   ├── api.js            # Запросы к бэкенду
│   │   │   ├── auth.js           # Управление JWT
│   │   │   ├── cart.js           # Логика корзины
│   │   │   └── i18n.js           # Переводы
│   │   │
│   │   ├── css/
│   │   │   ├── main.css
│   │   │   ├── variables.css     # CSS Custom Properties
│   │   │   └── components.css
│   │   │
│   │   └── locales/
│   │       ├── es.json           # Испанский (es-CL)
│   │       └── en.json           # Английский
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
│
├── docs/
│   ├── usecase-diagram.drawio
│   ├── component-diagram.drawio
│   ├── sequence-diagrams/
│   └── wireframes/
│
├── docker-compose.yml
└── README.md
```

---

## 📖 API Документация

После запуска бэкенда интерактивная документация доступна по адресу:

- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

### Основные эндпоинты

| Метод | Путь | Описание | Auth |
|---|---|---|---|
| `POST` | `/auth/register` | Регистрация | — |
| `POST` | `/auth/login` | Вход, получение JWT | — |
| `POST` | `/auth/refresh` | Обновление токена | — |
| `GET` | `/products` | Список товаров (фильтры, поиск, пагинация) | — |
| `GET` | `/products/{id}` | Детали товара | — |
| `GET` | `/cart` | Текущая корзина | ✅ |
| `POST` | `/cart/items` | Добавить товар в корзину | ✅ |
| `POST` | `/orders` | Создать заказ | ✅ |
| `GET` | `/orders` | История заказов | ✅ |
| `POST` | `/payments/create` | Создать платёж (Mercado Pago) | ✅ |
| `POST` | `/payments/webhook` | Webhook от платёжной системы | — |
| `GET` | `/users/me` | Профиль текущего пользователя | ✅ |
| `POST` | `/reviews` | Написать отзыв | ✅ |
| `GET` | `/admin/dashboard` | Статистика (admin only) | 🔐 |

> 🔐 — требует роль `admin` | ✅ — требует авторизацию

---

## 🗄 База данных

### Схема (основные таблицы)

```
users ──────────┬── orders ──── order_items ──── products
                │                                    │
                ├── cart ───── cart_items            │
                │                                    │
                ├── addresses                    categories
                │
                ├── reviews ──────────────────── products
                │
                └── wishlists ─────────────────── products

promo_codes (используются при checkout)
```

### Запуск миграций

```bash
# Создать новую миграцию
alembic revision --autogenerate -m "description"

# Применить все миграции
alembic upgrade head

# Откатить последнюю
alembic downgrade -1
```

---

## 🔑 Переменные окружения

Скопируй `backend/.env.example` в `backend/.env` и заполни:

```env
# База данных
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/beautyshop

# JWT
SECRET_KEY=your-super-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=your-mp-access-token
MERCADOPAGO_WEBHOOK_SECRET=your-webhook-secret

# Stripe (резерв)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SENDGRID_API_KEY=SG.xxx
EMAIL_FROM=noreply@beautyshop.cl

# App
DEBUG=True
ALLOWED_ORIGINS=http://localhost:5173
```

---

## 🚢 Деплой

### Railway (рекомендуется для учебного проекта)

1. Создай аккаунт на [railway.app](https://railway.app)
2. Подключи GitHub репозиторий
3. Добавь сервис PostgreSQL в Railway dashboard
4. Укажи переменные окружения из `.env`
5. Railway автоматически определит Python/Node.js и задеплоит

```bash
# Procfile для Railway (backend)
web: alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Docker (локально или VPS)

```bash
# Сборка и запуск всех сервисов
docker-compose up --build

# Только бэкенд + БД
docker-compose up backend postgres
```

---

## 📐 Диаграммы

Все диаграммы находятся в папке `/docs` и открываются в [draw.io](https://app.diagrams.net):

| Файл | Тип | Описание |
|---|---|---|
| `usecase-diagram.drawio` | Use Case | Акторы: Гость, Покупатель, Администратор |
| `component-diagram.drawio` | Component | 4 слоя: Frontend → Backend → Services → DB |
| `seq-registration.drawio` | Sequence | Регистрация пользователя |
| `seq-cart.drawio` | Sequence | Добавление товара в корзину |
| `seq-checkout.drawio` | Sequence | Оформление заказа и оплата |
| `seq-catalog.drawio` | Sequence | Просмотр каталога с фильтрами |
| `seq-auth.drawio` | Sequence | JWT авторизация |

---

## 👨‍💻 Авторы

Проект разработан в рамках учебной практики.

| Роль | Имя |
|---|---|
| Backend разработка (FastAPI, PostgreSQL) | [@username](https://github.com/username) |
| Frontend разработка (HTML/CSS/JS) | [@username](https://github.com/username) |

---

## 📄 Лицензия

Распространяется под лицензией MIT. Подробнее см. [LICENSE](LICENSE).

---

<div align="center">
  Сделано с ❤️ для учебной практики · BeautyShop Chile 2025
</div>
