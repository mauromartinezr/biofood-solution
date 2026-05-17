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

# Tu número de WhatsApp en formato E.164 (con +57...)
MI_NUMERO = "+573008263922"

# usuario_identificacion real de la hackathon DB.
# Encuéntralo corriendo el Paso 4 del README o con:
#   docker exec -it biofood-postgres psql -h 3.208.123.187 -p 5432 -U hackathon_dev -d biofooddb -c "SELECT DISTINCT usuario_identificacion, nombre_estudiante FROM hackaton_ventas LIMIT 10;"
USUARIO_HACKATHON = "0010033490"

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
    Asocia MI_NUMERO con:
      - USUARIO_HACKATHON (para datos reales de ventas/recargas)
      - STUDENT_ID_LOCAL  (para alérgenos y catálogo local)
    """
    section("PASO 2 — Mapear número de WhatsApp")

    if USUARIO_HACKATHON == "REEMPLAZA_CON_ID_REAL":
        print("  ⚠ USUARIO_HACKATHON no configurado — saltando mapeo en phone_biofood_map")
        print("     Ejecuta el Paso 4 del README para obtener el ID y edita este script")
    else:
        sql(
            f"INSERT INTO phone_biofood_map (phone_e164, usuario_identificacion) "
            f"VALUES ('{MI_NUMERO}', '{USUARIO_HACKATHON}') ON CONFLICT DO NOTHING;",
            f"{MI_NUMERO} → hackathon ID: {USUARIO_HACKATHON}",
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
    print(f"   Número de prueba : {MI_NUMERO}")
    print(f"   Student local    : {STUDENT_ID_LOCAL}")
    print(f"   Usuario hackathon: {USUARIO_HACKATHON}")

    check_container()
    paso1_inventario_vencimiento()
    paso2_mapeo_telefono()
    paso3_admin_cafeteria()
    verificacion()

    print("\n✅ Setup completo.")
    print("   Arranca el server: cd api && go run ./cmd/server")
    print("   El worker de Smart Offers disparará en ~3 minutos al admin de cafetería.\n")
