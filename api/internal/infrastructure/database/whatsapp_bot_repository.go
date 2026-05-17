package database

import (
	"sync"

	"biofood-solution/api/internal/features/whatsapp/domain"
	apperrors "biofood-solution/api/internal/shared/errors"

	"gorm.io/gorm"
)

type WhatsAppBotRepository struct {
	localDB     *gorm.DB // local fixtures: phone_biofood_map
	hackathonDB *gorm.DB // hackathon real data: hackaton_ventas, hackaton_recargas
}

var _ domain.BotRepository = (*WhatsAppBotRepository)(nil)

func NewWhatsAppBotRepository(localDB, hackathonDB *gorm.DB) *WhatsAppBotRepository {
	return &WhatsAppBotRepository{localDB: localDB, hackathonDB: hackathonDB}
}

func (r *WhatsAppBotRepository) FindStudentByPhone(phoneE164 string) (domain.StudentInfo, error) {
	var phoneMap phoneBiofoodMapModel
	if err := r.localDB.First(&phoneMap, "phone_e164 = ?", phoneE164).Error; err != nil {
		return domain.StudentInfo{}, apperrors.ErrNotFound
	}
	return r.fetchStudentInfo(phoneMap.UsuarioIdentificacion)
}

// fetchStudentInfo queries balance and basic student data from hackathon DB by uid.
func (r *WhatsAppBotRepository) fetchStudentInfo(uid string) (domain.StudentInfo, error) {
	var info struct {
		NombreEstudiante string `gorm:"column:nombre_estudiante"`
		Colegio          string `gorm:"column:colegio"`
	}
	r.hackathonDB.Raw(
		"SELECT nombre_estudiante, colegio FROM hackaton_ventas WHERE usuario_identificacion = ? ORDER BY fecha DESC LIMIT 1",
		uid,
	).Scan(&info)
	if info.NombreEstudiante == "" {
		return domain.StudentInfo{}, apperrors.ErrNotFound
	}

	var totalRecargas, totalVentas float64
	r.hackathonDB.Raw(
		"SELECT COALESCE(SUM(valor), 0) FROM hackaton_recargas WHERE usuario_identificacion = ?",
		uid,
	).Scan(&totalRecargas)
	r.hackathonDB.Raw(
		"SELECT COALESCE(SUM(precio::numeric * cantidad::numeric), 0) FROM hackaton_ventas WHERE usuario_identificacion = ?",
		uid,
	).Scan(&totalVentas)

	var avgDailySpend float64
	r.hackathonDB.Raw(
		"SELECT COALESCE(SUM(precio::numeric * cantidad::numeric) / 30.0, 0) FROM hackaton_ventas WHERE usuario_identificacion = ? AND fecha::date >= CURRENT_DATE - INTERVAL '30 days'",
		uid,
	).Scan(&avgDailySpend)

	return domain.StudentInfo{
		UsuarioID:     uid,
		Name:          info.NombreEstudiante,
		Colegio:       info.Colegio,
		Balance:       totalRecargas - totalVentas,
		AvgDailySpend: avgDailySpend,
	}, nil
}

func (r *WhatsAppBotRepository) FindRecentPurchases(usuarioID string) ([]domain.RecentPurchase, error) {
	var rows []struct {
		Fecha          string  `gorm:"column:fecha"`
		NombreProducto string  `gorm:"column:nombre_producto"`
		Precio         float64 `gorm:"column:precio"`
		Cantidad       int     `gorm:"column:cantidad"`
	}
	r.hackathonDB.Raw(
		"SELECT fecha::text, nombre_producto, precio, cantidad FROM hackaton_ventas WHERE usuario_identificacion = ? ORDER BY fecha DESC LIMIT 10",
		usuarioID,
	).Scan(&rows)

	out := make([]domain.RecentPurchase, len(rows))
	for i, row := range rows {
		out[i] = domain.RecentPurchase{
			Date:    row.Fecha,
			Product: row.NombreProducto,
			Price:   row.Precio,
			Qty:     row.Cantidad,
		}
	}
	return out, nil
}

func (r *WhatsAppBotRepository) GetStudentContextByPhone(phoneE164 string) (domain.StudentContext, error) {
	var phoneMap phoneBiofoodMapModel
	if err := r.localDB.First(&phoneMap, "phone_e164 = ?", phoneE164).Error; err != nil {
		return domain.StudentContext{}, apperrors.ErrNotFound
	}
	ctx, err := r.GetStudentContext(phoneMap.UsuarioIdentificacion)
	if err != nil {
		return domain.StudentContext{}, err
	}
	ctx.Allergens, _ = r.GetStudentAllergens(phoneE164)
	ctx.SafeAlternatives, _ = r.GetSafeAlternatives(ctx.Allergens)
	ctx.SmartOffers, _ = r.GetSmartOffers()
	return ctx, nil
}

func (r *WhatsAppBotRepository) GetStudentAllergens(phoneE164 string) ([]string, error) {
	var rows []struct {
		AllergenName string `gorm:"column:allergen_name"`
	}
	r.localDB.Raw(`
		SELECT sa.allergen_name
		FROM student_allergens sa
		JOIN parent_phone_map ppm ON ppm.student_id = sa.student_id
		WHERE ppm.phone_e164 = ?
	`, phoneE164).Scan(&rows)

	result := make([]string, len(rows))
	for i, row := range rows {
		result[i] = row.AllergenName
	}
	return result, nil
}

func (r *WhatsAppBotRepository) GetSafeAlternatives(allergens []string) ([]domain.SafeAlternative, error) {
	if len(allergens) == 0 {
		return nil, nil
	}
	var rows []struct {
		Name     string  `gorm:"column:name"`
		Category string  `gorm:"column:category"`
		Price    float64 `gorm:"column:price"`
	}
	r.localDB.Raw(`
		SELECT p.name, p.category, p.price
		FROM products p
		WHERE p.id NOT IN (
			SELECT pa.product_id
			FROM product_allergens pa
			WHERE pa.allergen_name IN ?
		)
		ORDER BY p.price ASC
		LIMIT 2
	`, allergens).Scan(&rows)

	result := make([]domain.SafeAlternative, len(rows))
	for i, row := range rows {
		result[i] = domain.SafeAlternative{Name: row.Name, Category: row.Category, Price: row.Price}
	}
	return result, nil
}

func (r *WhatsAppBotRepository) GetLastTransactions(usuarioID string) ([]domain.RecentTransaction, error) {
	var rows []struct {
		Fecha          string  `gorm:"column:fecha"`
		NombreProducto string  `gorm:"column:nombre_producto"`
		Precio         float64 `gorm:"column:precio"`
		Cantidad       int     `gorm:"column:cantidad"`
	}
	r.hackathonDB.Raw(`
		SELECT fecha::text, nombre_producto, precio, cantidad
		FROM hackaton_ventas
		WHERE usuario_identificacion = ?
		ORDER BY fecha DESC
		LIMIT 5
	`, usuarioID).Scan(&rows)

	result := make([]domain.RecentTransaction, len(rows))
	for i, row := range rows {
		result[i] = domain.RecentTransaction{
			Date:    row.Fecha,
			Product: row.NombreProducto,
			Price:   row.Precio,
			Qty:     row.Cantidad,
		}
	}
	return result, nil
}

func (r *WhatsAppBotRepository) GetSmartOffers() ([]domain.SmartOffer, error) {
	var rows []struct {
		Name         string `gorm:"column:name"`
		CurrentStock int    `gorm:"column:current_stock"`
		MinimumStock int    `gorm:"column:minimum_stock"`
		DaysToExpiry int    `gorm:"column:days_to_expiry"`
	}
	r.localDB.Raw(`
		SELECT p.name, i.current_stock, i.minimum_stock, i.days_to_expiry
		FROM inventory i
		JOIN products p ON p.id = i.product_id
		WHERE i.current_stock <= i.minimum_stock
		   OR i.days_to_expiry <= 3
		ORDER BY i.days_to_expiry ASC, i.current_stock ASC
		LIMIT 3
	`).Scan(&rows)

	result := make([]domain.SmartOffer, len(rows))
	for i, row := range rows {
		discount := "Solicitar reabastecimiento"
		if row.DaysToExpiry > 0 && row.DaysToExpiry <= 3 {
			discount = "2x1 hoy — evita merma"
		}
		result[i] = domain.SmartOffer{
			ProductName:  row.Name,
			CurrentStock: row.CurrentStock,
			MinimumStock: row.MinimumStock,
			DaysToExpiry: row.DaysToExpiry,
			DiscountText: discount,
		}
	}
	return result, nil
}

func (r *WhatsAppBotRepository) GetCafeteriaAdminPhones() ([]string, error) {
	var rows []struct {
		PhoneE164 string `gorm:"column:phone_e164"`
	}
	r.localDB.Raw("SELECT DISTINCT phone_e164 FROM cafeteria_admins").Scan(&rows)

	phones := make([]string, len(rows))
	for i, row := range rows {
		phones[i] = row.PhoneE164
	}
	return phones, nil
}

func (r *WhatsAppBotRepository) GetStudentContext(usuarioID string) (domain.StudentContext, error) {
	// Tipos locales para los 4 grupos de queries paralelas
	type ventasSummary struct {
		NombreEstudiante string  `gorm:"column:nombre_estudiante"`
		Colegio          string  `gorm:"column:colegio"`
		TotalVentas      float64 `gorm:"column:total_ventas"`
		AvgDailySpend    float64 `gorm:"column:avg_daily_spend"`
	}
	type recargaRow struct {
		Fecha         string  `gorm:"column:fecha"`
		Valor         float64 `gorm:"column:valor"`
		TotalRecargas float64 `gorm:"column:total_recargas"`
	}
	type topProdRow struct {
		NombreProducto string  `gorm:"column:nombre_producto"`
		Veces          int     `gorm:"column:veces"`
		Total          float64 `gorm:"column:total"`
	}
	type txRow struct {
		Fecha          string  `gorm:"column:fecha"`
		NombreProducto string  `gorm:"column:nombre_producto"`
		Precio         float64 `gorm:"column:precio"`
		Cantidad       int     `gorm:"column:cantidad"`
	}

	var (
		ventas   ventasSummary
		recargas []recargaRow
		topProds []topProdRow
		txs      []txRow
		wg       sync.WaitGroup
	)
	wg.Add(4)

	// Goroutine A: nombre, colegio + total ventas + promedio 30d (3 queries → 1)
	go func() {
		defer wg.Done()
		r.hackathonDB.Raw(`
			SELECT
				MAX(nombre_estudiante)  AS nombre_estudiante,
				MAX(colegio)            AS colegio,
				COALESCE(SUM(precio::numeric * cantidad::numeric), 0) AS total_ventas,
				COALESCE(SUM(CASE WHEN fecha::date >= CURRENT_DATE - INTERVAL '30 days'
					THEN precio::numeric * cantidad::numeric ELSE 0 END) / 30.0, 0) AS avg_daily_spend
			FROM hackaton_ventas
			WHERE usuario_identificacion = ?
		`, usuarioID).Scan(&ventas)
	}()

	// Goroutine B: total recargas + historial últimas 5 (window function → 1 query)
	go func() {
		defer wg.Done()
		r.hackathonDB.Raw(`
			SELECT valor, fecha::text,
			       SUM(valor) OVER () AS total_recargas
			FROM hackaton_recargas
			WHERE usuario_identificacion = ?
			ORDER BY fecha DESC
			LIMIT 5
		`, usuarioID).Scan(&recargas)
	}()

	// Goroutine C: top 5 productos por frecuencia
	go func() {
		defer wg.Done()
		r.hackathonDB.Raw(`
			SELECT nombre_producto, COUNT(*) AS veces,
			       SUM(precio::numeric * cantidad::numeric) AS total
			FROM hackaton_ventas
			WHERE usuario_identificacion = ?
			GROUP BY nombre_producto
			ORDER BY veces DESC LIMIT 5
		`, usuarioID).Scan(&topProds)
	}()

	// Goroutine D: últimas 5 transacciones (patrón nutricional)
	go func() {
		defer wg.Done()
		r.hackathonDB.Raw(`
			SELECT fecha::text, nombre_producto, precio, cantidad
			FROM hackaton_ventas
			WHERE usuario_identificacion = ?
			ORDER BY fecha DESC LIMIT 5
		`, usuarioID).Scan(&txs)
	}()

	wg.Wait()

	if ventas.NombreEstudiante == "" {
		return domain.StudentContext{}, apperrors.ErrNotFound
	}

	totalRecargas := 0.0
	if len(recargas) > 0 {
		totalRecargas = recargas[0].TotalRecargas
	}
	balance := totalRecargas - ventas.TotalVentas

	daysRemaining := 0
	if ventas.AvgDailySpend > 0 {
		daysRemaining = int(balance / ventas.AvgDailySpend)
	}

	history := make([]domain.RechargeRecord, len(recargas))
	for i, rec := range recargas {
		history[i] = domain.RechargeRecord{Date: rec.Fecha, Amount: rec.Valor}
	}
	products := make([]domain.ProductSummary, len(topProds))
	for i, p := range topProds {
		products[i] = domain.ProductSummary{Name: p.NombreProducto, Times: p.Veces, Total: p.Total}
	}
	recentTxs := make([]domain.RecentTransaction, len(txs))
	for i, t := range txs {
		recentTxs[i] = domain.RecentTransaction{
			Date: t.Fecha, Product: t.NombreProducto,
			Price: t.Precio, Qty: t.Cantidad,
		}
	}

	return domain.StudentContext{
		StudentInfo: domain.StudentInfo{
			UsuarioID:     usuarioID,
			Name:          ventas.NombreEstudiante,
			Colegio:       ventas.Colegio,
			Balance:       balance,
			AvgDailySpend: ventas.AvgDailySpend,
		},
		RechargeHistory:    history,
		TopProducts:        products,
		DaysRemaining:      daysRemaining,
		RecentTransactions: recentTxs,
	}, nil
}
