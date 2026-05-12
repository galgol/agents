from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Character, User, World
from ..schemas import CharacterCreate, CharacterOut
from ..security import get_current_user

router = APIRouter(prefix="/characters", tags=["characters"])

DEFAULT_WORLD_NAME = "Real world"


def _get_owned_world(db: Session, world_id: int, user: User) -> World:
    world = db.query(World).filter(World.id == world_id, World.user_id == user.id).first()
    if not world:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="World not found")
    return world


def _get_or_create_default_world(db: Session, user: User) -> World:
    world = db.query(World).filter(World.user_id == user.id, World.name == DEFAULT_WORLD_NAME).first()
    if world:
        return world
    world = World(user_id=user.id, name=DEFAULT_WORLD_NAME, description="A basic real-world setting.")
    db.add(world)
    db.commit()
    db.refresh(world)
    return world


@router.get("", response_model=list[CharacterOut])
def list_characters(
    world_id: int | None = Query(None, description="If set, only characters in this world; omit to list all of yours"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Character]:
    q = (
        db.query(Character)
        .join(World, Character.world_id == World.id)
        .filter(World.user_id == current_user.id)
    )
    if world_id is not None:
        _get_owned_world(db, world_id, current_user)
        q = q.filter(Character.world_id == world_id)
    return q.order_by(Character.id).all()


@router.post("", response_model=CharacterOut, status_code=status.HTTP_201_CREATED)
def create_character(
    payload: CharacterCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Character:
    if payload.world_id is None:
        world = _get_or_create_default_world(db, current_user)
        world_id = world.id
    else:
        _get_owned_world(db, payload.world_id, current_user)
        world_id = payload.world_id
    character = Character(
        world_id=world_id,
        name=payload.name,
        bio=payload.bio,
        traits=payload.traits,
        image_url=payload.image_url,
        age=payload.age,
        gender=payload.gender,
        hair=payload.hair,
        eyes=payload.eyes,
        height=payload.height,
        body_figure=payload.body_figure,
        characteristics=payload.characteristics,
    )
    db.add(character)
    db.commit()
    db.refresh(character)
    return character


@router.get("/{character_id}", response_model=CharacterOut)
def get_character(
    character_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Character:
    character = (
        db.query(Character)
        .join(World, Character.world_id == World.id)
        .filter(Character.id == character_id, World.user_id == current_user.id)
        .first()
    )
    if not character:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Character not found")
    return character
