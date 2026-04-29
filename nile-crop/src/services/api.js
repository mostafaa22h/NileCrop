import axios from "axios";
import { egyptianCities } from "@data/egyptianCities";

const useMockApi = import.meta.env.VITE_USE_MOCK_API === "true";
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const apiBaseUrls = [
  configuredApiUrl,
  "http://127.0.0.1:8000",
  "http://localhost:8000",
  "http://127.0.0.1:8001",
  "http://localhost:8001",
].filter(Boolean);

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeCityName(city) {
  const value = city?.trim();
  if (!value) return value;

  const matchedCity = egyptianCities.find((item) => item.nameAr === value || item.nameEn.toLowerCase() === value.toLowerCase());
  return matchedCity?.nameEn || value;
}

async function postWithFallback(paths, payload, config) {
  let lastError;

  for (const baseURL of apiBaseUrls) {
    const api = axios.create({
      baseURL,
      timeout: 120000,
    });

    for (const path of paths) {
      try {
        const { data } = await api.post(path, payload, config);
        return data;
      } catch (error) {
        lastError = error;
      }
    }
  }

  throw lastError;
}

async function getMockCropRecommendation(city) {
  await wait(700);

  return {
    recommendations: [
      {
        name: "القمح",
        score: 92,
        reason: `ملائم لظروف ${city} في الموسم الزراعي الحالي.`,
      },
    ],
  };
}

async function getMockDiseaseDetection() {
  await wait(900);

  return {
    disease: "تبقع ورقي مبكر",
    confidence: 88,
    treatment: "يوصى بعزل الأوراق المصابة وتحسين التهوية واستخدام برنامج وقائي مناسب.",
  };
}

export async function recommendCrop(payload) {
  if (useMockApi) {
    return getMockCropRecommendation(payload?.city || "مدينتك");
  }

  const normalizedPayload = {
    ...payload,
    city: normalizeCityName(payload?.city),
  };

  return postWithFallback(["/recommend", "/crop/recommend"], normalizedPayload);
}

export async function detectDisease(file) {
  if (useMockApi) {
    return getMockDiseaseDetection(file);
  }

  const formData = new FormData();
  const fallbackName = file?.type === "image/png" ? "upload.png" : "upload.jpg";
  formData.append("image", file, file?.name || fallbackName);
  return postWithFallback(["/upload/disease", "/disease", "/upload/upload-image"], formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export function extractApiErrorMessage(error, fallbackMessage) {
  const detail = error?.response?.data?.detail;
  const message = error?.response?.data?.message;

  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  return fallbackMessage;
}

export default { recommendCrop, detectDisease };
