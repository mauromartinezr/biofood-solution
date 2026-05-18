# WhatsApp + Evolution API — Configuración

## Flujo

```
WhatsApp → Evolution API (biofood) → POST hack.apptrialhub.com/api/whatsapp/webhook?token=...
         → BioFood backend → Claude + DB → Evolution sendText → WhatsApp
```

---

## 1. Variables en `api/.env.dev` (VPS)

```env
# Evolution (misma instancia y API key que usas en Postman/curl)
EVOLUTION_BASE_URL=https://evolution.ingridaguirre.co   # sin barra final /
EVOLUTION_INSTANCE=biofood
EVOLUTION_API_KEY=94B59265-...   # tu apikey

# Debe coincidir con ?token= en la URL del webhook
WEBHOOK_SECRET=bioalert-wh-secret-2026

# Respuestas con IA (opcional; sin esto hay respuesta corta de saldo)
ANTHROPIC_API_KEY=sk-ant-...

# DB local (mapeo teléfono → estudiante)
DATABASE_DSN=host=biofood-postgres user=hackuser password=... dbname=hackathondb port=5432 sslmode=disable

# DB hackathon (datos de ventas)
HACKATHON_DSN=host=3.208.123.187 user=hackathon_dev password=... dbname=biofooddb port=5432 sslmode=disable
```

Tras cambiar `.env.dev`: `make deploy-api` o reiniciar el contenedor.

---

## 2. Registrar webhook en Evolution

**Body correcto (v2)** — propiedades en la raíz o dentro de `webhook` según tu versión; Evolution acepta:

```bash
curl -X POST "https://evolution.ingridaguirre.co/webhook/set/biofood" \
  -H "apikey: TU_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "webhook": {
      "enabled": true,
      "url": "https://hack.apptrialhub.com/api/whatsapp/webhook?token=bioalert-wh-secret-2026",
      "byEvents": false,
      "base64": false,
      "events": ["MESSAGES_UPSERT"]
    }
  }'
```

Verificar:

```bash
curl "https://evolution.ingridaguirre.co/webhook/find/biofood" -H "apikey: TU_API_KEY"
```

Instancia conectada:

```bash
curl "https://evolution.ingridaguirre.co/instance/connectionState/biofood" -H "apikey: TU_API_KEY"
# → "state": "open"
```

---

## 3. Mapear tu número en la DB local

El bot solo responde si tu teléfono está en **`phone_biofood_map`**:

```sql
INSERT INTO phone_biofood_map (phone_e164, usuario_identificacion)
VALUES ('+573001234567', '0010089277')
ON CONFLICT DO NOTHING;
```

(`usuario_identificacion` = ID real en `hackaton_ventas`.)

Sin mapeo igual recibes: *"No encontré tu número registrado..."* — si no llega nada, el fallo es Evolution/envío, no el mapeo.

---

## 4. Pruebas

### Health

```bash
curl https://hack.apptrialhub.com/health
```

### Webhook simulado

```bash
curl -X POST "https://hack.apptrialhub.com/api/whatsapp/webhook?token=bioalert-wh-secret-2026" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "messages.upsert",
    "instance": "biofood",
    "data": {
      "key": { "remoteJid": "573001234567@s.whatsapp.net", "fromMe": false, "id": "test" },
      "message": { "conversation": "hola" },
      "messageType": "conversation"
    }
  }'
```

Esperado: `{"status":"ok"}` o `{"status":"ok","reply":"failed","error":"..."}` si Evolution no está configurado en el servidor.

### Enviar mensaje directo (Evolution)

```bash
curl -X POST "https://evolution.ingridaguirre.co/message/sendText/biofood" \
  -H "apikey: TU_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"number":"573001234567","text":"ping"}'
```

### Logs en VPS

```bash
docker logs biofood-backend --tail 100 | grep whatsapp
```

---

## Errores frecuentes

| Síntoma | Causa | Solución |
|---------|--------|----------|
| `{"status":"ignored"}` | Token, evento, grupo, sin texto | Revisar `?token=`, mensaje de texto, no grupo |
| Webhook `ok` pero no llega WhatsApp | `EVOLUTION_*` mal en `.env.dev` | Corregir URL, instancia, apikey y redeploy |
| `reply failed` en respuesta | Error al llamar Evolution | Ver logs del contenedor |
| "No encontré tu número" | Falta fila en `phone_biofood_map` | INSERT del paso 3 |
| Evolution no llama al webhook | Instancia desconectada | `connectionState` → `open`, escanear QR |

---

## Nota sobre el POST de configuración

El endpoint `POST /webhook/set/biofood` **no devuelve** mensajes de WhatsApp; solo registra la URL. La respuesta del bot la genera tu backend cuando Evolution hace POST al webhook al recibir un mensaje real.
