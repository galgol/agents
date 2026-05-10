from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, World
from ..schemas import WorldCreate, WorldOut
from ..security import get_current_user

router = APIRouter(prefix="/worlds", tags=["worlds"])


@router.get("", response_model=list[WorldOut])
def list_worlds(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[World]:
    return db.query(World).filter(World.user_id == current_user.id).order_by(World.id).all()


@router.post("", response_model=WorldOut, status_code=status.HTTP_201_CREATED)
def create_world(
    payload: WorldCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> World:
    world = World(
        user_id=current_user.id,
        name=payload.name,
        description=payload.description,
        cover_image_url=payload.cover_image_url,
    )
    db.add(world)
    db.commit()
    db.refresh(world)
    return world
