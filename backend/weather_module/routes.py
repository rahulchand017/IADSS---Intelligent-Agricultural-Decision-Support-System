from fastapi import APIRouter
import httpx
from dotenv import load_dotenv
from pathlib import Path
import os

# Explicitly point to backend/.env
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

router = APIRouter()

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

@router.get("/by-pin/{pincode}")
async def weather_by_pin(pincode: str):
    try:
        geo_url = f"http://api.openweathermap.org/geo/1.0/zip?zip={pincode},IN&appid={OPENWEATHER_API_KEY}"
        async with httpx.AsyncClient() as client:
            geo_res = await client.get(geo_url)
            geo_data = geo_res.json()

        print("GEO RESPONSE:", geo_data)  # debug

        if "lat" not in geo_data:
            return {"error": f"API response: {geo_data}"}

        lat = geo_data["lat"]
        lon = geo_data["lon"]
        city = geo_data.get("name", "Unknown")

        weather_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
        async with httpx.AsyncClient() as client:
            weather_res = await client.get(weather_url)
            weather_data = weather_res.json()

        temp = weather_data["main"]["temp"]
        humidity = weather_data["main"]["humidity"]
        description = weather_data["weather"][0]["description"].title()
        rainfall = weather_data.get("rain", {}).get("1h", 0.0)

        return {
            "city": city,
            "temperature": round(temp, 1),
            "humidity": humidity,
            "description": description,
            "rainfall": rainfall
        }

    except Exception as e:
        return {"error": str(e)}