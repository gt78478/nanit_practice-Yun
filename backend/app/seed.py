import json

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models import Brand, Category, Order, OrderItem, OrderStatus, OrderStatusHistory, Product, ProductImage, ShipmentStatus, User, UserAddress


PRODUCTS = [
    ("Сыворотка с витамином C Андес", "Уход за кожей", "Люмина", 1899000, 25, "Осветляющая сыворотка для ежедневного сияния кожи.", "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80"),
    ("Увлажняющий крем Маки", "Уход за кожей", "Ботаника", 1499000, 31, "Легкий крем для лица с экстрактом чилийской ягоды маки.", "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80"),
    ("Минеральный солнцезащитный крем SPF50", "Солнцезащита", "Коста", 1299000, 42, "Минеральная защита от солнца без белого налета.", "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=80"),
    ("Тинт для губ Кармеси", "Макияж", "Люме", 899000, 60, "Стойкий тинт для губ с сатиновым финишем.", "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=900&q=80"),
    ("Масло для волос с авокадо", "Уход за волосами", "Раис", 1099000, 18, "Питательное масло для волос с маслом авокадо.", "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80"),
    ("Маска с розовой глиной", "Уход за кожей", "Атакама", 1199000, 22, "Мягкая глиняная маска для ровного тона кожи.", "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80"),
    ("Гель для умывания Коста", "Уход за кожей", "Коста", 990000, 36, "Нежный очищающий гель для утреннего и вечернего ухода.", "https://images.unsplash.com/photo-1556228724-4b6d2b585a02?auto=format&fit=crop&w=900&q=80"),
    ("Ночной крем Патагония", "Уход за кожей", "Ботаника", 1699000, 17, "Питательный ночной крем для восстановления кожного барьера.", "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80"),
    ("Тоник с морскими минералами", "Уход за кожей", "Коста", 799000, 44, "Освежающий тоник с минералами тихоокеанского побережья.", "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=900&q=80"),
    ("Пилинг с фруктовыми кислотами", "Уход за кожей", "Атакама", 1399000, 12, "Мягкий AHA-пилинг для гладкости и сияния кожи.", "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=900&q=80"),
    ("Крем для рук Медовый Лимон", "Уход за кожей", "Раис", 599000, 55, "Быстро впитывающийся крем для рук с медовым ароматом.", "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=80"),
    ("Шампунь Киноа Баланс", "Уход за волосами", "Раис", 899000, 29, "Балансирующий шампунь для ежедневного ухода за волосами.", "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=900&q=80"),
    ("Кондиционер Алое Гладкость", "Уход за волосами", "Ботаника", 949000, 33, "Увлажняющий кондиционер для мягкости и блеска волос.", "https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?auto=format&fit=crop&w=900&q=80"),
    ("Сухой шампунь Сантьяго", "Уход за волосами", "Люме", 749000, 41, "Легкий сухой шампунь для быстрого обновления укладки.", "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=900&q=80"),
    ("Палетка теней Закат", "Макияж", "Люме", 1599000, 24, "Теплая палетка теней, вдохновленная закатами Атакамы.", "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80"),
    ("Тушь для ресниц Объем", "Макияж", "Люме", 999000, 50, "Черная тушь для выразительного объема без осыпания.", "https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?auto=format&fit=crop&w=900&q=80"),
    ("Кремовые румяна Роза", "Макияж", "Люмина", 1099000, 28, "Кремовые румяна с естественным сияющим финишем.", "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=900&q=80"),
    ("Бальзам для губ Папайя", "Макияж", "Ботаника", 499000, 64, "Питательный бальзам для губ с ароматом папайи.", "https://images.unsplash.com/photo-1599733589046-10c005739ef0?auto=format&fit=crop&w=900&q=80"),
    ("Солнцезащитный стик SPF50", "Солнцезащита", "Коста", 1199000, 37, "Компактный SPF-стик для обновления защиты в течение дня.", "https://images.unsplash.com/photo-1598662972299-5408ddb8a3dc?auto=format&fit=crop&w=900&q=80"),
    ("Лосьон после солнца Алое", "Солнцезащита", "Атакама", 899000, 26, "Успокаивающий лосьон после солнца с алое вера.", "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=900&q=80"),
]

OLD_PRODUCT_NAMES = [
    "Serum vitamina C Andes",
    "Crema hidratante Maqui",
    "Protector solar mineral SPF50",
    "Tinta labial Carmesi",
    "Aceite capilar Palta",
    "Mascarilla arcilla rosa",
]

ORDER_STATUS_TRANSLATIONS = {
    "created": "создан",
    "paid": "оплачен",
    "packed": "собран",
    "shipped": "отправлен",
    "delivered": "доставлен",
    "cancelled": "отменен",
}

SHIPMENT_STATUS_TRANSLATIONS = {
    "pending": "ожидает отправки",
    "in_transit": "в пути",
    "delivered": "доставлен",
    "returned": "возвращен",
}

ORDER_STATUSES = ("создан", "оплачен", "собран", "отправлен", "доставлен", "отменен")
SHIPMENT_STATUSES = ("ожидает отправки", "в пути", "доставлен", "возвращен")
TEST_CLIENT_COUNT = 30
TEST_CLIENT_PASSWORD = "test1234"


def get_or_create_category(db: Session, name: str) -> Category:
    category = db.scalar(select(Category).where(Category.name == name))
    if category:
        return category
    category = Category(name=name)
    db.add(category)
    db.flush()
    return category


def get_or_create_brand(db: Session, name: str) -> Brand:
    brand = db.scalar(select(Brand).where(Brand.name == name))
    if brand:
        return brand
    brand = Brand(name=name)
    db.add(brand)
    db.flush()
    return brand


def get_or_create_order_status(db: Session, name: str) -> OrderStatus:
    status = db.scalar(select(OrderStatus).where(OrderStatus.name == name))
    if status:
        return status
    status = OrderStatus(name=name)
    db.add(status)
    db.flush()
    return status


def get_or_create_shipment_status(db: Session, name: str) -> ShipmentStatus:
    status = db.scalar(select(ShipmentStatus).where(ShipmentStatus.name == name))
    if status:
        return status
    status = ShipmentStatus(name=name)
    db.add(status)
    db.flush()
    return status


def get_or_create_user(db: Session, email: str, password: str, role: str = "customer") -> User:
    user = db.scalar(select(User).where(User.email == email))
    if user:
        return user
    user = User(email=email, password_hash=hash_password(password), role=role)
    db.add(user)
    db.flush()
    return user


def seed_statuses(db: Session) -> None:
    for name in ORDER_STATUSES:
        get_or_create_order_status(db, name)
    for name in SHIPMENT_STATUSES:
        get_or_create_shipment_status(db, name)


def seed_products(db: Session) -> None:
    for name, category_name, brand_name, price, amount, description, image_url in PRODUCTS:
        category = get_or_create_category(db, category_name)
        brand = get_or_create_brand(db, brand_name)
        product = db.scalar(select(Product).where(Product.name == name))
        if product:
            product.category_id = category.id
            product.brand_id = brand.id
            product.price_cents = price
            product.amount = max(product.amount, amount)
            product.description = description
        else:
            product = Product(
                name=name,
                category_id=category.id,
                brand_id=brand.id,
                description=description,
                price_cents=price,
                amount=amount,
            )
            db.add(product)
            db.flush()

        image = db.scalar(select(ProductImage).where(ProductImage.product_id == product.id).order_by(ProductImage.sort_order))
        if image:
            image.image_path = image_url
        else:
            db.add(ProductImage(product_id=product.id, image_path=image_url, sort_order=0))


def seed_test_clients_and_orders(db: Session) -> None:
    products = list(db.scalars(select(Product).where(Product.is_active.is_(True)).order_by(Product.id)).all())
    if not products:
        return

    statuses = list(db.scalars(select(OrderStatus).order_by(OrderStatus.id)).all())
    created_status = db.scalar(select(OrderStatus).where(OrderStatus.name == "создан")) or statuses[0]

    for client_index in range(1, TEST_CLIENT_COUNT + 1):
        user = get_or_create_user(db, f"test-client-{client_index}@mail.cl", TEST_CLIENT_PASSWORD)
        existing_orders = list(db.scalars(select(Order).where(Order.user_id == user.id)).all())
        target_orders = 1 + (client_index % 2)

        for order_index in range(len(existing_orders) + 1, target_orders + 1):
            address_data = {
                "full_name": f"Test Client {client_index}",
                "phone": f"+56 9 5555 {client_index:04d}",
                "country": "Чили",
                "city": "Santiago",
                "commune": f"Comuna {((client_index - 1) % 8) + 1}",
                "address_line1": f"Test street {client_index}, apt {order_index}",
                "address_line2": None,
                "postal_code": f"75{client_index:03d}",
                "is_default": order_index == 1,
            }
            address = UserAddress(user_id=user.id, label="Тестовый адрес", **address_data)
            db.add(address)
            db.flush()

            item_count = 1 + ((client_index + order_index) % 3)
            order_products = [products[(client_index + order_index + offset) % len(products)] for offset in range(item_count)]
            subtotal = sum((1 + ((client_index + product.id + order_index) % 2)) * product.price_cents for product in order_products)
            shipping = 399000
            total = subtotal + shipping
            status = statuses[(client_index + order_index) % len(statuses)] if statuses else created_status
            order = Order(
                user_id=user.id,
                user_address_id=address.id,
                order_status_id=status.id if status else None,
                address=json.dumps(address_data, ensure_ascii=True),
                subtotal_cents=subtotal,
                shipping_cents=shipping,
                discount_cents=0,
                total_cents=total,
            )
            db.add(order)
            db.flush()

            for product in order_products:
                quantity = 1 + ((client_index + product.id + order_index) % 2)
                db.add(
                    OrderItem(
                        order_id=order.id,
                        product_id=product.id,
                        product_name_snapshot=product.name,
                        unit_price_cents_snapshot=product.price_cents,
                        quantity=quantity,
                        line_total_cents=quantity * product.price_cents,
                    )
                )
            if status:
                db.add(OrderStatusHistory(order_id=order.id, changed_by_user=user.id, new_status_id=status.id, note="Тестовый заказ из seed"))


def localize_existing_seed(db: Session) -> None:
    changed = False

    for old, new in ORDER_STATUS_TRANSLATIONS.items():
        row = db.scalar(select(OrderStatus).where(OrderStatus.name == old))
        if row:
            row.name = new
            changed = True

    for old, new in SHIPMENT_STATUS_TRANSLATIONS.items():
        row = db.scalar(select(ShipmentStatus).where(ShipmentStatus.name == old))
        if row:
            row.name = new
            changed = True

    for old_name, product_data in zip(OLD_PRODUCT_NAMES, PRODUCTS, strict=False):
        product = db.scalar(select(Product).where(Product.name == old_name))
        if not product:
            continue
        name, category_name, brand_name, price, amount, description, image_url = product_data
        product.name = name
        product.category_id = get_or_create_category(db, category_name).id
        product.brand_id = get_or_create_brand(db, brand_name).id
        product.price_cents = price
        product.amount = amount
        product.description = description
        image = db.scalar(select(ProductImage).where(ProductImage.product_id == product.id).order_by(ProductImage.sort_order))
        if image:
            image.image_path = image_url
        else:
            db.add(ProductImage(product_id=product.id, image_path=image_url, sort_order=0))
        changed = True

    if changed:
        db.commit()


def seed_database(db: Session) -> None:
    localize_existing_seed(db)
    seed_statuses(db)
    get_or_create_user(db, "admin@beautyshop.cl", "admin123", "admin")
    get_or_create_user(db, "demo@beautyshop.cl", "demo1234")
    seed_products(db)
    seed_test_clients_and_orders(db)
    db.commit()
