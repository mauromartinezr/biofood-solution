"""
BioAlert — Demo Setup Script
Configura los datos de prueba en la DB local (Docker PostgreSQL).

Requisitos: Python 3.x + Docker corriendo con el container biofood-postgres.
Uso: python postgres/demo_setup.py
"""

import subprocess
import sys

# ============================================================
# CONFIGURACIÓN — edita estos valores antes de correr
# ============================================================

# Teléfono (E.164) → usuario_identificacion en hackaton_ventas (phone_biofood_map)
PHONE_MAPPINGS = [
    ("+573008263922", "0010089277"),  # KEVIN OSPINA HERNANDEZ
    ("+573059319289", "0010130953"),  # ALEJANDRO TORRES MENDOZA (nuevo)
    ("+573024158002", "0010086378"),  # VICTORIA MEJIA CAMACHO (nuevo)
]

# Número principal (admin cafetería + alérgenos locales en parent_phone_map)
MI_NUMERO = PHONE_MAPPINGS[0][0]
USUARIO_HACKATHON = PHONE_MAPPINGS[0][1]

# student_id local para alérgenos — b1000000-...000001 = Juan García (alérgico al maní)
STUDENT_ID_LOCAL = "b1000000-0000-0000-0000-000000000001"

# ============================================================
# CONSTANTES — no tocar
# ============================================================

CONTAINER = "biofood-postgres"
DB_USER   = "hackuser"
DB_NAME   = "hackathondb"

# ============================================================
# HELPERS
# ============================================================

def sql(query: str, description: str = "") -> bool:
    if description:
        print(f"\n▶ {description}")
    result = subprocess.run(
        ["docker", "exec", CONTAINER, "psql", "-U", DB_USER, "-d", DB_NAME, "-c", query],
        capture_output=True, text=True
    )
    stdout = result.stdout.strip()
    stderr = result.stderr.strip()
    if result.returncode != 0:
        print(f"  ✗ ERROR: {stderr}")
        return False
    if stdout:
        print(f"  ✓ {stdout}")
    return True

def section(title: str):
    print(f"\n{'='*55}")
    print(f"  {title}")
    print(f"{'='*55}")

def check_container():
    result = subprocess.run(
        ["docker", "inspect", "-f", "{{.State.Running}}", CONTAINER],
        capture_output=True, text=True
    )
    if result.returncode != 0 or result.stdout.strip() != "true":
        print(f"✗ El container '{CONTAINER}' no está corriendo.")
        print("  Ejecuta primero: docker compose -f postgres/docker-compose.yml up -d")
        sys.exit(1)
    print(f"✓ Container '{CONTAINER}' corriendo")

# ============================================================
# PASOS
# ============================================================

def paso1_inventario_vencimiento():
    """
    Simula productos próximos a vencer para activar Smart Offers.
    Estos valores ya existen en inventory tras correr seed.sql;
    solo actualizamos el campo days_to_expiry que AutoMigrate agrega.
    """
    section("PASO 1 — Simular productos próximos a vencer")

    items = [
        ("c1000000-0000-0000-0000-000000000002", 2, "Leche con chocolate — vence en 2 días"),
        ("c1000000-0000-0000-0000-000000000005", 1, "Galletas de maní — vence en 1 día"),
    ]
    for product_id, days, label in items:
        sql(
            f"UPDATE inventory SET days_to_expiry = {days} WHERE product_id = '{product_id}';",
            label,
        )

def paso2_mapeo_telefono():
    """
    Registra PHONE_MAPPINGS en phone_biofood_map (bot WhatsApp).
    MI_NUMERO además en parent_phone_map (alérgenos locales).
    """
    section("PASO 2 — Mapear números de WhatsApp")

    for phone, usuario_id in PHONE_MAPPINGS:
        sql(
            f"INSERT INTO phone_biofood_map (phone_e164, usuario_identificacion) "
            f"VALUES ('{phone}', '{usuario_id}') "
            f"ON CONFLICT (phone_e164) DO UPDATE "
            f"SET usuario_identificacion = EXCLUDED.usuario_identificacion;",
            f"{phone} → hackathon ID: {usuario_id}",
        )

    sql(
        f"INSERT INTO parent_phone_map (phone_e164, student_id) "
        f"VALUES ('{MI_NUMERO}', '{STUDENT_ID_LOCAL}') ON CONFLICT DO NOTHING;",
        f"{MI_NUMERO} → student local: Juan García (alérgico al maní)",
    )

def paso3_admin_cafeteria():
    """
    Agrega MI_NUMERO como admin de cafetería para recibir alertas del worker.
    """
    section("PASO 3 — Registrar número como admin de cafetería")

    sql(
        f"INSERT INTO cafeteria_admins (phone_e164, school_id) "
        f"VALUES ('{MI_NUMERO}', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11') ON CONFLICT DO NOTHING;",
        f"{MI_NUMERO} registrado como admin",
    )

def verificacion():
    section("VERIFICACIÓN — Estado actual de la demo")

    sql(
        "SELECT p.name, i.current_stock, i.minimum_stock, i.days_to_expiry "
        "FROM inventory i JOIN products p ON p.id = i.product_id "
        "WHERE i.current_stock <= i.minimum_stock OR i.days_to_expiry <= 3 "
        "ORDER BY i.days_to_expiry ASC;",
        "Smart Offers activas (stock crítico o próximos a vencer):",
    )

    sql(
        "SELECT ppm.phone_e164, sa.allergen_name "
        "FROM student_allergens sa "
        "JOIN parent_phone_map ppm ON ppm.student_id = sa.student_id;",
        "Alérgenos mapeados por teléfono:",
    )

    sql(
        "SELECT phone_e164, usuario_identificacion FROM phone_biofood_map;",
        "Mapeos phone → hackathon DB:",
    )

    sql(
        "SELECT phone_e164, school_id FROM cafeteria_admins;",
        "Admins de cafetería registrados:",
    )

# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":
    print("\n🌿 BioAlert Demo Setup")
    print("   Mapeos WhatsApp → hackathon:")
    for phone, uid in PHONE_MAPPINGS:
        print(f"     {phone} → {uid}")
    print(f"   Admin / alérgenos locales: {MI_NUMERO} (student {STUDENT_ID_LOCAL})")

    check_container()
    paso1_inventario_vencimiento()
    paso2_mapeo_telefono()
    paso3_admin_cafeteria()
    verificacion()

    print("\n✅ Setup completo.")
    print("   Arranca el server: cd api && go run ./cmd/server")
    print("   El worker de Smart Offers disparará en ~3 minutos al admin de cafetería.\n")
