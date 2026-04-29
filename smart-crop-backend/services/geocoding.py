import requests


CITY_COORDINATE_FALLBACKS = {
    "cairo": (30.0444, 31.2357),
    "القاهرة": (30.0444, 31.2357),
    "giza": (30.0131, 31.2089),
    "الجيزة": (30.0131, 31.2089),
    "alexandria": (31.2001, 29.9187),
    "الإسكندرية": (31.2001, 29.9187),
    "mansoura": (31.0409, 31.3785),
    "المنصورة": (31.0409, 31.3785),
    "tanta": (30.7865, 31.0004),
    "طنطا": (30.7865, 31.0004),
    "zagazig": (30.5877, 31.5020),
    "الزقازيق": (30.5877, 31.5020),
    "fayoum": (29.3084, 30.8428),
    "الفيوم": (29.3084, 30.8428),
    "aswan": (24.0889, 32.8998),
    "أسوان": (24.0889, 32.8998),
    "luxor": (25.6872, 32.6396),
    "الأقصر": (25.6872, 32.6396),
    "ismailia": (30.5965, 32.2715),
    "الإسماعيلية": (30.5965, 32.2715),
    "port said": (31.2653, 32.3019),
    "بورسعيد": (31.2653, 32.3019),
    "suez": (29.9668, 32.5498),
    "السويس": (29.9668, 32.5498),
    "minya": (28.1099, 30.7503),
    "المنيا": (28.1099, 30.7503),
    "sohag": (26.5591, 31.6957),
    "سوهاج": (26.5591, 31.6957),
    "qena": (26.1551, 32.7160),
    "قنا": (26.1551, 32.7160),
    "hurghada": (27.2579, 33.8116),
    "الغردقة": (27.2579, 33.8116),
    "sharm el sheikh": (27.9158, 34.3300),
    "شرم الشيخ": (27.9158, 34.3300),
    "matrouh": (31.3543, 27.2373),
    "marsa matruh": (31.3543, 27.2373),
    "مرسى مطروح": (31.3543, 27.2373),
    "دمياط": (31.4165, 31.8133),
    "بنها": (30.4669, 31.1848),
    "دمنهور": (31.0341, 30.4682),
    "كفر الشيخ": (31.1117, 30.9399),
    "بني سويف": (29.0661, 31.0994),
    "أسيوط": (27.1809, 31.1837),
    "العريش": (31.1313, 33.7984),
}


def get_coordinates(city_name: str):
    normalized = city_name.strip().lower()
    fallback = CITY_COORDINATE_FALLBACKS.get(normalized)

    url = "https://nominatim.openstreetmap.org/search"
    params = {"q": city_name, "format": "json"}
    headers = {"User-Agent": "smart-crop-app"}

    try:
        response = requests.get(url, params=params, headers=headers, timeout=5)
        response.raise_for_status()
        data = response.json()
        if data:
            return float(data[0]["lat"]), float(data[0]["lon"])
    except requests.RequestException:
        pass

    if fallback:
        return fallback

    return None, None
