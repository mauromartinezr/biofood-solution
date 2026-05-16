package database

import (
	"biofood-solution/api/internal/features/whatsapp/domain"
	apperrors "biofood-solution/api/internal/shared/errors"

	"gorm.io/gorm"
)

type WhatsAppBotRepository struct {
	localDB      *gorm.DB // local fixtures: phone_biofood_map
	hackathonDB  *gorm.DB // hackathon real data: hackaton_ventas, hackaton_recargas
}

var _ domain.BotRepository = (*WhatsAppBotRepository)(nil)

func NewWhatsAppBotRepository(localDB, hackathonDB *gorm.DB) *WhatsAppBotRepository {
	return &WhatsAppBotRepository{localDB: localDB, hackathonDB: hackathonDB}
}

func (r *WhatsAppBotRepository) FindStudentByPhone(phoneE164 string) (domain.StudentInfo, error) {
	// Step 1: local DB — resolve phone → usuario_identificacion
	var phoneMap phoneBiofoodMapModel
	if err := r.localDB.First(&phoneMap, "phone_e164 = ?", phoneE164).Error; err != nil {
		return domain.StudentInfo{}, apperrors.ErrNotFound
	}
	uid := phoneMap.UsuarioIdentificacion

	// Step 2: hackathon DB — student name and school from latest venta
	var info struct {
		NombreEstudiante string  `gorm:"column:nombre_estudiante"`
		Colegio          string  `gorm:"column:colegio"`
	}
	r.hackathonDB.Raw(
		"SELECT nombre_estudiante, colegio FROM hackaton_ventas WHERE usuario_identificacion = ? ORDER BY fecha DESC LIMIT 1",
		uid,
	).Scan(&info)
	if info.NombreEstudiante == "" {
		return domain.StudentInfo{}, apperrors.ErrNotFound
	}

	// Step 3: balance = SUM(recargas) - SUM(ventas)
	var totalRecargas, totalVentas float64
	r.hackathonDB.Raw(
		"SELECT COALESCE(SUM(valor), 0) FROM hackaton_recargas WHERE usuario_identificacion = ?",
		uid,
	).Scan(&totalRecargas)
	r.hackathonDB.Raw(
		"SELECT COALESCE(SUM(precio * cantidad), 0) FROM hackaton_ventas WHERE usuario_identificacion = ?",
		uid,
	).Scan(&totalVentas)

	// Step 4: avg daily spend — last 30 days
	var avgDailySpend float64
	r.hackathonDB.Raw(
		"SELECT COALESCE(SUM(precio * cantidad) / 30.0, 0) FROM hackaton_ventas WHERE usuario_identificacion = ? AND fecha >= CURRENT_DATE - INTERVAL '30 days'",
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
