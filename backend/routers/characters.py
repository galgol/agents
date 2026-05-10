from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Character, User, World
from ..schemas import CharacterCreate, CharacterOut
from ..security import get_current_user

router = APIRouter(prefix="/characters", tags=["characters"])


def _get_owned_world(db: Session, world_id: int, user: User) -> World:
    world = db.query(World).filter(World.id == world_id, World.user_id == user.id).first()
    if not world:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="World not found")
    return world


@router.get("", response_model=list[CharacterOut])
def list_characters(
    world_id: int = Query(..., description="World id to filter characters by"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Character]:
    _get_owned_world(db, world_id, current_user)
    return (
        db.query(Character)
        .filter(Character.world_id == world_id)
        .order_by(Character.id)
        .all()
    )


@router.post("", response_model=CharacterOut, status_code=status.HTTP_201_CREATED)
def create_character(
    payload: CharacterCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Character:
    _get_owned_world(db, payload.world_id, current_user)
    character = Character(
        world_id=payload.world_id,
        name=payload.name,
        bio=payload.bio,
        traits=payload.traits,
        image_url=payload.image_url,
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
