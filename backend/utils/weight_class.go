package utils

type WeightClassResult struct {
	WeightKg       float64 `json:"weight_kg"`
	Recommended    string  `json:"recommended_class"`
	NextClassUp    string  `json:"next_class_up"`
	NextClassDown  string  `json:"next_class_down"`
}

var (
	maleClasses   = []string{"59", "66", "74", "83", "93", "105", "120", "120+"}
	femaleClasses = []string{"47", "52", "57", "63", "69", "76", "84", "84+"}
)

func classAsFloat(c string) float64 {
	if c == "120+" || c == "84+" {
		if c == "120+" {
			return 120.01
		}
		return 84.01
	}
	var v float64
	for _, r := range c {
		v = v*10 + float64(r-'0')
	}
	return v
}

func CalculateWeightClass(weightKg float64, sex string) WeightClassResult {
	var classes []string
	if sex == "male" {
		classes = maleClasses
	} else {
		classes = femaleClasses
	}

	recommended := classes[len(classes)-1]
	nextUp := ""
	nextDown := ""

	for i, c := range classes {
		if weightKg <= classAsFloat(c) {
			recommended = c
			if i > 0 {
				nextDown = classes[i-1]
			}
			if i < len(classes)-1 {
				nextUp = classes[i+1]
			}
			break
		}
	}

	return WeightClassResult{
		WeightKg:      weightKg,
		Recommended:   recommended,
		NextClassUp:   nextUp,
		NextClassDown: nextDown,
	}
}
