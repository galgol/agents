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
    world_id: int | None = None
    name: str = Field(min_length=1, max_length=120)
    bio: str | None = None
    traits: str | None = None
    image_url: str | None = None
    age: int | None = Field(default=None, ge=0, le=200)
    gender: str | None = Field(default=None, max_length=64)
    hair: str | None = Field(default=None, max_length=200)
    eyes: str | None = Field(default=None, max_length=200)
    height: str | None = Field(default=None, max_length=200)
    body_figure: str | None = Field(default=None, max_length=200)
    characteristics: str | None = None


class CharacterOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    world_id: int
    name: str
    bio: str | None
    traits: str | None
    image_url: str | None
    age: int | None
    gender: str | None
    hair: str | None
    eyes: str | None
    height: str | None
    body_figure: str | None
    characteristics: str | None


class UploadOut(BaseModel):
    url: str
