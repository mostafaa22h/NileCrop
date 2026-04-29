from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.recommendation_engine import predict_crop_for_city

router = APIRouter(tags=["Recommendation"])


class RecommendRequest(BaseModel):
    city: str = Field(..., min_length=2, max_length=50)


@router.post("/recommend")
def recommend_crop(request: RecommendRequest):
    try:
        result = predict_crop_for_city(request.city)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Recommendation failed: {exc}")

    ranked_recommendations = []
    seen_names: set[str] = set()

    primary_name = result["crop_ar"]
    ranked_recommendations.append({
        "name": primary_name,
        "score": result["score"],
        "reason": result["reason"],
    })
    seen_names.add(primary_name)

    for candidate in result["heuristic_candidates"]:
        candidate_name = candidate.get("name_ar") or candidate.get("name")
        if not candidate_name:
            continue

        candidate_payload = {
            "name": candidate_name,
            "score": candidate.get("score"),
            "reason": candidate.get("reason", ""),
        }

        if candidate_name in seen_names:
            existing_item = ranked_recommendations[0]
            existing_item["score"] = max(existing_item.get("score") or 0, candidate_payload["score"] or 0)
            if not existing_item.get("reason"):
                existing_item["reason"] = candidate_payload["reason"]
            continue

        ranked_recommendations.append(candidate_payload)
        seen_names.add(candidate_name)

        if len(ranked_recommendations) == 3:
            break

    return {
        "city": result["city"],
        "recommendations": ranked_recommendations,
        "meta": {
            **result["meta"],
            "soil_type": result["soil_type"],
            "region": result["region"],
            "decision_source": result["decision_source"],
        },
    }
