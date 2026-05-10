from pydantic import BaseModel, ConfigDict, Field


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=64)
    password: str = Field(min_length=6, max_length=128)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class WorldCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: str | None = None
    cover_image_url: str | None = None


class WorldOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    name: str
    description: str | None
    cover_image_url: str | None


class CharacterCreate(BaseModel):
    world_id: int
    name: str = Field(min_length=1, max_length=120)
    bio: str | None = None
    traits: str | None = None
    image_url: str | None = None


class CharacterOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    world_id: int
    name: str
    bio: str | None
    traits: str | None
    image_url: str | None


class UploadOut(BaseModel):
    url: str
