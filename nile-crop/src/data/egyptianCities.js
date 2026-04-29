export const egyptianCities = [
  { nameAr: "القاهرة", nameEn: "Cairo", lat: 30.0444, lng: 31.2357 },
  { nameAr: "الجيزة", nameEn: "Giza", lat: 30.0131, lng: 31.2089 },
  { nameAr: "الإسكندرية", nameEn: "Alexandria", lat: 31.2001, lng: 29.9187 },
  { nameAr: "المنصورة", nameEn: "Mansoura", lat: 31.0409, lng: 31.3785 },
  { nameAr: "طنطا", nameEn: "Tanta", lat: 30.7865, lng: 31.0004 },
  { nameAr: "الزقازيق", nameEn: "Zagazig", lat: 30.5877, lng: 31.502 },
  { nameAr: "الإسماعيلية", nameEn: "Ismailia", lat: 30.5965, lng: 32.2715 },
  { nameAr: "بورسعيد", nameEn: "Port Said", lat: 31.2653, lng: 32.3019 },
  { nameAr: "السويس", nameEn: "Suez", lat: 29.9668, lng: 32.5498 },
  { nameAr: "دمياط", nameEn: "Damietta", lat: 31.4165, lng: 31.8133 },
  { nameAr: "بنها", nameEn: "Banha", lat: 30.4669, lng: 31.1848 },
  { nameAr: "دمنهور", nameEn: "Damanhur", lat: 31.0341, lng: 30.4682 },
  { nameAr: "كفر الشيخ", nameEn: "Kafr El Sheikh", lat: 31.1117, lng: 30.9399 },
  { nameAr: "الفيوم", nameEn: "Fayoum", lat: 29.3084, lng: 30.8428 },
  { nameAr: "بني سويف", nameEn: "Beni Suef", lat: 29.0661, lng: 31.0994 },
  { nameAr: "المنيا", nameEn: "Minya", lat: 28.1099, lng: 30.7503 },
  { nameAr: "أسيوط", nameEn: "Assiut", lat: 27.1809, lng: 31.1837 },
  { nameAr: "سوهاج", nameEn: "Sohag", lat: 26.5591, lng: 31.6957 },
  { nameAr: "قنا", nameEn: "Qena", lat: 26.1551, lng: 32.716 },
  { nameAr: "الأقصر", nameEn: "Luxor", lat: 25.6872, lng: 32.6396 },
  { nameAr: "أسوان", nameEn: "Aswan", lat: 24.0889, lng: 32.8998 },
  { nameAr: "مرسى مطروح", nameEn: "Marsa Matruh", lat: 31.3543, lng: 27.2373 },
  { nameAr: "العريش", nameEn: "Arish", lat: 31.1313, lng: 33.7984 },
  { nameAr: "شرم الشيخ", nameEn: "Sharm El Sheikh", lat: 27.9158, lng: 34.3308 },
  { nameAr: "الغردقة", nameEn: "Hurghada", lat: 27.2579, lng: 33.8116 }
];

export function matchCitySuggestions(query, language = "ar") {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return egyptianCities.slice(0, 8);

  return egyptianCities.filter((city) => {
    const target = language.startsWith("ar") ? city.nameAr : city.nameEn;
    return city.nameAr.toLowerCase().includes(normalized) || city.nameEn.toLowerCase().includes(normalized) || target.toLowerCase().includes(normalized);
  }).slice(0, 8);
}
