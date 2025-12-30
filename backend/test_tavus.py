"""Test Tavus API connection."""
import asyncio
import httpx

TAVUS_API_KEY = "d1ef7652f3b84f2a81e5e91e2a435281"
TAVUS_BASE_URL = "https://tavusapi.com/v2"

async def test_replicas():
    """Test listing replicas."""
    headers = {
        "x-api-key": TAVUS_API_KEY,
        "Content-Type": "application/json",
    }
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{TAVUS_BASE_URL}/replicas",
                headers=headers,
                timeout=30.0,
            )
            print(f"Replicas Status: {response.status_code}")
            print(f"Replicas Response: {response.text[:500]}")
        except Exception as e:
            print(f"Replicas Error: {e}")

async def test_create_persona():
    """Test creating a persona."""
    headers = {
        "x-api-key": TAVUS_API_KEY,
        "Content-Type": "application/json",
    }
    # Minimal required payload based on docs
    payload = {
        "persona_name": "Test Interview Persona",
        "system_prompt": "You are a helpful interviewer who asks behavioral questions and provides feedback.",
        "pipeline_mode": "full",
        "default_replica_id": "rfe12d8b9597",  # Phoenix-3 stock replica
    }
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{TAVUS_BASE_URL}/personas",
                headers=headers,
                json=payload,
                timeout=30.0,
            )
            print(f"Persona Status: {response.status_code}")
            print(f"Persona Response: {response.text[:800]}")
        except Exception as e:
            print(f"Persona Error: {e}")

if __name__ == "__main__":
    print("Testing Tavus API...")
    asyncio.run(test_replicas())
    print("\n" + "="*50 + "\n")
    asyncio.run(test_create_persona())
