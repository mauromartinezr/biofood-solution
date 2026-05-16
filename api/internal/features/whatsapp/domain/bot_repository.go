package domain

type Student struct {
	ID      string
	Name    string
	Balance float64
}

type MenuItem struct {
	Name  string
	Price float64
}

type BotRepository interface {
	FindStudentByPhone(phoneE164 string) (Student, error)
	FindMenuItems() ([]MenuItem, error)
}
