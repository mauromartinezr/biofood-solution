package database

import (
	"errors"

	"biofood-solution/api/internal/features/whatsapp/domain"
	apperrors "biofood-solution/api/internal/shared/errors"

	"gorm.io/gorm"
)

type WhatsAppBotRepository struct {
	db *gorm.DB
}

var _ domain.BotRepository = (*WhatsAppBotRepository)(nil)

func NewWhatsAppBotRepository(db *gorm.DB) *WhatsAppBotRepository {
	return &WhatsAppBotRepository{db: db}
}

func (r *WhatsAppBotRepository) FindStudentByPhone(phoneE164 string) (domain.Student, error) {
	var phoneMap parentPhoneMapModel
	if err := r.db.First(&phoneMap, "phone_e164 = ?", phoneE164).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return domain.Student{}, apperrors.ErrNotFound
		}
		return domain.Student{}, err
	}

	var student studentModel
	if err := r.db.First(&student, "id = ?", phoneMap.StudentID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return domain.Student{}, apperrors.ErrNotFound
		}
		return domain.Student{}, err
	}

	return domain.Student{
		ID:      student.ID,
		Name:    student.Name,
		Balance: student.Balance,
	}, nil
}

func (r *WhatsAppBotRepository) FindMenuItems() ([]domain.MenuItem, error) {
	var models []productModel
	if err := r.db.Find(&models).Error; err != nil {
		return nil, err
	}
	out := make([]domain.MenuItem, len(models))
	for i, m := range models {
		out[i] = domain.MenuItem{
			Name:  m.Name,
			Price: m.Price,
		}
	}
	return out, nil
}
