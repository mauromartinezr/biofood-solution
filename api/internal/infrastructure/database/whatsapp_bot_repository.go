package database

import (
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
	return r.GetStudentContext(phoneMap.UsuarioIdentificacion)
}

func (r *WhatsAppBotRepository) GetStudentContext(usuarioID string) (domain.StudentContext, error) {
	studentInfo, err := r.fetchStudentInfo(usuarioID)
	if err != nil {
		return domain.StudentContext{}, err
	}

	var recharges []struct {
		Fecha string  `gorm:"column:fecha"`
		Valor float64 `gorm:"column:valor"`
	}
	r.hackathonDB.Raw(
		"SELECT fecha::text, valor FROM hackaton_recargas WHERE usuario_identificacion = ? ORDER BY fecha DESC LIMIT 5",
		usuarioID,
	).Scan(&recharges)

	var topProds []struct {
		NombreProducto string  `gorm:"column:nombre_producto"`
		Veces          int     `gorm:"column:veces"`
		Total          float64 `gorm:"column:total"`
	}
	r.hackathonDB.Raw(
		"SELECT nombre_producto, COUNT(*) as veces, SUM(precio::numeric * cantidad::numeric) as total FROM hackaton_ventas WHERE usuario_identificacion = ? GROUP BY nombre_producto ORDER BY veces DESC LIMIT 5",
		usuarioID,
	).Scan(&topProds)

	daysRemaining := 0
	if studentInfo.AvgDailySpend > 0 {
		daysRemaining = int(studentInfo.Balance / studentInfo.AvgDailySpend)
	}

	history := make([]domain.RechargeRecord, len(recharges))
	for i, rec := range recharges {
		history[i] = domain.RechargeRecord{Date: rec.Fecha, Amount: rec.Valor}
	}

	products := make([]domain.ProductSummary, len(topProds))
	for i, p := range topProds {
		products[i] = domain.ProductSummary{Name: p.NombreProducto, Times: p.Veces, Total: p.Total}
	}

	return domain.StudentContext{
		StudentInfo:     studentInfo,
		RechargeHistory: history,
		TopProducts:     products,
		DaysRemaining:   daysRemaining,
	}, nil
}
