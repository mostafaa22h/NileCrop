from datetime import datetime


REGION_CROP_LIBRARY = {
    "delta": [
        {"name": "Wheat", "base": 88, "season": "winter", "reason_ar": "محصول ثابت وملائم لمدن الدلتا مع توازن جيد في الرطوبة."},
        {"name": "Rice", "base": 85, "season": "summer", "reason_ar": "يناسب المناطق الأعلى رطوبة وشبكات الري القوية في الدلتا."},
        {"name": "Cotton", "base": 82, "season": "summer", "reason_ar": "خيار جيد في التربة الطينية المنتشرة في كثير من مدن الدلتا."},
        {"name": "Corn", "base": 78, "season": "summer", "reason_ar": "بديل مناسب عند ارتفاع الحرارة نسبيًا خلال الموسم."},
    ],
    "coastal": [
        {"name": "Tomato", "base": 87, "season": "summer", "reason_ar": "ملائم للمناخ المعتدل نسبيًا في المدن الساحلية."},
        {"name": "Potato", "base": 84, "season": "winter", "reason_ar": "أداؤه جيد في الأجواء الساحلية مع إدارة ري منتظمة."},
        {"name": "Wheat", "base": 79, "season": "winter", "reason_ar": "خيار مستقر إذا كانت التربة جيدة والصرف مناسب."},
        {"name": "Barley", "base": 77, "season": "winter", "reason_ar": "يتحمل الظروف الساحلية ويعطي استقرارًا جيدًا."},
    ],
    "upper_egypt": [
        {"name": "Sugarcane", "base": 89, "season": "summer", "reason_ar": "من أنسب المحاصيل لحرارة الصعيد وتوفر موسم نمو طويل."},
        {"name": "Corn", "base": 84, "season": "summer", "reason_ar": "ملائم لدرجات الحرارة الأعلى مع إدارة مائية جيدة."},
        {"name": "Sesame", "base": 81, "season": "summer", "reason_ar": "يتحمل الجو الدافئ والجاف نسبيًا في الصعيد."},
        {"name": "Wheat", "base": 75, "season": "winter", "reason_ar": "يبقى خيارًا مقبولًا في العروات المناسبة."},
    ],
    "desert": [
        {"name": "Watermelon", "base": 86, "season": "summer", "reason_ar": "يناسب التربة الرملية والمناطق الجافة نسبيًا."},
        {"name": "Olive", "base": 83, "season": "summer", "reason_ar": "خيار قوي في البيئات الصحراوية وشبه الصحراوية."},
        {"name": "Barley", "base": 79, "season": "winter", "reason_ar": "يتحمل الجفاف ويعطي استقرارًا أفضل من محاصيل كثيرة."},
        {"name": "Corn", "base": 72, "season": "summer", "reason_ar": "ممكن لكنه يحتاج متابعة أدق للري."},
    ],
    "general": [
        {"name": "Wheat", "base": 85, "season": "winter", "reason_ar": "محصول متوازن ومناسب كخيار عام في ظروف متنوعة."},
        {"name": "Corn", "base": 80, "season": "summer", "reason_ar": "خيار جيد مع الحرارة الأعلى نسبيًا."},
        {"name": "Potato", "base": 78, "season": "winter", "reason_ar": "مناسب عند انتظام الري وتحسن خواص التربة."},
        {"name": "Beans", "base": 76, "season": "winter", "reason_ar": "خيار جيد للمزارعين الباحثين عن تنوع في الدورة الزراعية."},
    ],
}


def get_current_season() -> str:
    return "summer" if datetime.now().month in {4, 5, 6, 7, 8, 9} else "winter"


def detect_region(city: str, soil: str) -> str:
    normalized_city = city.strip().lower()
    normalized_soil = soil.strip().lower()

    coastal_cities = {"alexandria", "port said", "damietta", "marsa matruh", "matrouh", "el alamein", "ras el bar"}
    delta_cities = {"mansoura", "tanta", "zagazig", "banha", "kafr el sheikh", "damanhur", "mahalla", "fayoum"}
    upper_egypt_cities = {"aswan", "luxor", "qena", "sohag", "assiut", "minya", "beni suef"}
    desert_cities = {"hurghada", "sharm el sheikh", "north sinai", "south sinai", "siwa", "new valley"}

    if normalized_city in coastal_cities:
        return "coastal"
    if normalized_city in delta_cities:
        return "delta"
    if normalized_city in upper_egypt_cities:
        return "upper_egypt"
    if normalized_city in desert_cities or normalized_soil == "sandy":
        return "desert"
    if normalized_soil == "clay":
        return "delta"
    return "general"


def score_crop(base_score: int, temp: float, humidity: float, soil: str, crop_name: str) -> int:
    score = base_score
    normalized_soil = soil.strip().lower()
    normalized_crop = crop_name.lower()

    if temp >= 32 and normalized_crop in {"corn", "sugarcane", "sesame", "watermelon"}:
        score += 5
    if temp <= 24 and normalized_crop in {"wheat", "potato", "barley"}:
        score += 4
    if humidity >= 65 and normalized_crop in {"rice", "tomato", "potato"}:
        score += 5
    if humidity <= 45 and normalized_crop in {"olive", "barley", "sesame", "watermelon"}:
        score += 5
    if normalized_soil == "clay" and normalized_crop in {"wheat", "rice", "cotton"}:
        score += 4
    if normalized_soil == "sandy" and normalized_crop in {"watermelon", "olive", "barley"}:
        score += 4
    if normalized_soil == "loamy" and normalized_crop in {"corn", "potato", "beans", "tomato"}:
        score += 3

    return max(60, min(score, 96))


def get_crop_recommendations(city: str, temp: float, humidity: float, soil: str):
    region = detect_region(city, soil)
    current_season = get_current_season()
    crops = [crop for crop in REGION_CROP_LIBRARY[region] if crop.get("season") == current_season]

    if not crops:
        crops = REGION_CROP_LIBRARY[region]

    ranked = []
    for crop in crops:
        ranked.append({
            "name": crop["name"],
            "score": score_crop(crop["base"], temp, humidity, soil, crop["name"]),
            "reason": crop["reason_ar"],
        })

    ranked.sort(key=lambda item: item["score"], reverse=True)
    return ranked[:3], region


def recommend_crop(temp: float, humidity: float, soil: str) -> str:
    fallback_city = "general"
    recommendations, _ = get_crop_recommendations(fallback_city, temp, humidity, soil)
    return recommendations[0]["name"]
