from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings."""
    
    # App
    app_name: str = "SkillSurge API"
    debug: bool = True
    frontend_url: str = "http://localhost:5173"
    backend_url: str = "http://localhost:8000"
    
    # OpenAI
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    
    # Tavus
    tavus_api_key: str = ""
    
    # Supabase
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_key: str = ""
    
    # Computed properties for compatibility
    @property
    def SUPABASE_URL(self) -> str:
        return self.supabase_url
    
    @property
    def SUPABASE_ANON_KEY(self) -> str:
        return self.supabase_anon_key
    
    @property
    def SUPABASE_SERVICE_KEY(self) -> str:
        return self.supabase_service_key
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


# Create a module-level settings instance for easy import
settings = get_settings()
