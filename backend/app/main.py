from __future__ import annotations

import hashlib
import random
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import Depends, FastAPI, Header, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy import select, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .config import ALLOWED_ORIGINS, DATABASE_URL, ENVIRONMENT, SESSION_TOKEN_PEPPER
from .database import SessionLocal, init_db
from .models import CampaignEvent, ConfigVersion, LedgerEntry, Player, Spin, _hash_token

app = FastAPI(title="Dashain Dhamaka API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SessionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    ref: str | None = Field(default=None, min_length=8, max_length=8)
    locale: str | None = Field(default="en", min_length=2, max_length=2)

    @field_validator("locale")
    @classmethod
    def validate_locale(cls, value: str | None) -> str | None:
        if value is None:
            return value
        return value.lower() if value.lower() in {"en", "ne"} else "en"


class EventRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    type: str = Field(..., alias="type")
    channel: str | None = None
    ref: str | None = None
    visit_id: str | None = None

    @field_validator("type")
    @classmethod
    def validate_type(cls, value: str) -> str:
        allowed = {"share_clicked", "link_copied", "referral_landing"}
        if value not in allowed:
            raise ValueError(f"Unsupported event type: {value}")
        return value


class SessionState(BaseModel):
    points: int
    spins_used: int
    spins_remaining: int | None
    spin_limit: int | None
    config_version: int
    outcomes: list[dict[str, Any]]
    last_results: list[dict[str, Any]]


@app.on_event("startup")
def startup_event() -> None:
    init_db()


async def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_active_config(db: Session) -> ConfigVersion:
    config = db.query(ConfigVersion).filter(ConfigVersion.is_active.is_(True)).first()
    if not config:
        raise HTTPException(status_code=500, detail="No active configuration found")
    return config


def build_state(player: Player, db: Session) -> dict[str, Any]:
    config = get_active_config(db)
    outcomes = config.outcomes or []
    last_results = []
    for spin in db.query(Spin).filter(Spin.player_id == player.id).order_by(Spin.created_at.desc()).limit(10):
        last_results.append(
            {
                "spin_id": str(spin.id),
                "outcome_id": spin.outcome_id,
                "points_awarded": spin.points_awarded,
                "created_at": spin.created_at.isoformat(),
            }
        )
    return {
        "points": player.points_balance,
        "spins_used": player.spins_used,
        "spins_remaining": None,
        "spin_limit": None,
        "config_version": config.id,
        "outcomes": outcomes,
        "last_results": last_results,
    }


def choose_outcome(outcomes: list[dict[str, Any]]) -> dict[str, Any]:
    total_weight = sum(int(item["weight"]) for item in outcomes)
    pick = random.randint(1, total_weight)
    current = 0
    for item in outcomes:
        current += int(item["weight"])
        if pick <= current:
            return item
    return outcomes[-1]


def get_request_token(request: Request) -> str | None:
    token = request.cookies.get("session_token")
    if token:
        return token
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.lower().startswith("bearer "):
        return auth_header.split(" ", 1)[1]
    return None


def get_player_for_request(request: Request, db: Session) -> Player:
    token = get_request_token(request)
    if not token:
        raise HTTPException(status_code=401, detail={"code": "SESSION_INVALID", "message": "Session required"})
    hashed = _hash_token(token)
    player = db.query(Player).filter(Player.token_hash == hashed).first()
    if not player:
        raise HTTPException(status_code=401, detail={"code": "SESSION_INVALID", "message": "Session invalid"})
    player.last_seen_at = datetime.now(timezone.utc)
    player.expires_at = player.last_seen_at + timedelta(days=30)
    db.add(player)
    db.commit()
    return player


@app.get("/healthz")
def healthz() -> dict[str, str]:
    try:
        with SessionLocal() as db:
            db.execute(text("SELECT 1"))
        return {"status": "ok", "db": "ok", "version": "dev"}
    except Exception:
        return {"status": "ok", "db": "error", "version": "dev"}


@app.post("/v1/sessions")
def create_or_restore_session(payload: SessionRequest, request: Request, response: Response, db: Session = Depends(get_db)) -> dict[str, Any]:
    token = get_request_token(request)
    if token:
        try:
            player = get_player_for_request(request, db)
            return {"player": {"public_id": player.public_id, "share_code": player.share_code}, "state": build_state(player, db)}
        except HTTPException:
            pass

    referrer = None
    if payload.ref:
        referrer = db.query(Player).filter(Player.share_code == payload.ref.upper()).first()

    token = secrets.token_urlsafe(32)
    player = Player(
        token_hash=_hash_token(token),
        locale=payload.locale or "en",
        referred_by_player_id=referrer.id if referrer else None,
        spin_limit=0,
        spins_used=0,
        points_balance=0,
    )
    db.add(player)
    db.commit()
    db.refresh(player)
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=60 * 60 * 24 * 30,
    )
    return {"player": {"public_id": player.public_id, "share_code": player.share_code}, "state": build_state(player, db)}


@app.get("/v1/state")
def get_state(request: Request, db: Session = Depends(get_db)) -> dict[str, Any]:
    player = get_player_for_request(request, db)
    return build_state(player, db)


@app.post("/v1/spins")
def create_spin(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
) -> dict[str, Any]:
    if not idempotency_key:
        raise HTTPException(status_code=400, detail={"code": "MISSING_IDEMPOTENCY_KEY", "message": "Idempotency-Key header is required"})
    try:
        uuid.UUID(idempotency_key)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail={"code": "INVALID_IDEMPOTENCY_KEY", "message": "Idempotency-Key must be a UUID"}) from exc

    player = get_player_for_request(request, db)
    existing = db.query(Spin).filter(Spin.player_id == player.id, Spin.idempotency_key == idempotency_key).first()
    if existing is not None:
        return {"spin": {"id": str(existing.id), "outcome_id": existing.outcome_id, "points_awarded": existing.points_awarded, "created_at": existing.created_at.isoformat(), "replayed": True}, "state": build_state(player, db)}

    config = get_active_config(db)
    outcome = choose_outcome(config.outcomes)
    spin_number = player.spins_used + 1

    spin_id = uuid.uuid4()
    spin = Spin(
        id=spin_id,
        player_id=player.id,
        spin_number=spin_number,
        idempotency_key=idempotency_key,
        config_version_id=config.id,
        outcome_id=str(outcome["id"]),
        points_awarded=int(outcome["points"]),
    )
    ledger = LedgerEntry(
        id=uuid.uuid4(),
        player_id=player.id,
        spin_id=spin_id,
        entry_type="spin_award",
        points_delta=int(outcome["points"]),
        balance_after=player.points_balance + int(outcome["points"]),
    )
    player.spins_used = spin_number
    player.points_balance += int(outcome["points"])
    db.add_all([spin, ledger])
    db.commit()
    db.refresh(spin)
    db.refresh(player)
    return {"spin": {"id": str(spin.id), "outcome_id": spin.outcome_id, "points_awarded": spin.points_awarded, "created_at": spin.created_at.isoformat(), "replayed": False}, "state": build_state(player, db)}


@app.get("/v1/history")
def get_history(request: Request, limit: int = 10, cursor: str | None = None, db: Session = Depends(get_db)) -> dict[str, Any]:
    player = get_player_for_request(request, db)
    query = db.query(Spin).filter(Spin.player_id == player.id).order_by(Spin.created_at.desc())
    offset = 0
    if cursor:
        try:
            offset = int(cursor)
        except ValueError:
            offset = 0
    items = query.offset(offset).limit(min(max(limit, 1), 50)).all()
    body_items = []
    for spin in items:
        body_items.append(
            {
                "spin_id": str(spin.id),
                "points_delta": spin.points_awarded,
                "balance_after": db.query(LedgerEntry).filter(LedgerEntry.spin_id == spin.id).first().balance_after if db.query(LedgerEntry).filter(LedgerEntry.spin_id == spin.id).first() else 0,
                "outcome_label": spin.outcome_id,
                "created_at": spin.created_at.isoformat(),
            }
        )
    next_cursor = str(offset + len(body_items)) if len(body_items) == limit else None
    return {"items": body_items, "next_cursor": next_cursor}


@app.post("/v1/events")
def log_event(event: EventRequest, request: Request, db: Session = Depends(get_db)) -> dict[str, str]:
    payload = event.model_dump(by_alias=True, exclude_none=True)
    event_type = payload["type"]
    referrer_id = None
    if payload.get("ref"):
        referrer = db.query(Player).filter(Player.share_code == payload["ref"].upper()).first()
        referrer_id = referrer.id if referrer else None

    if event_type == "referral_landing":
        existing = db.query(CampaignEvent).filter(CampaignEvent.event_type == "referral_landing", CampaignEvent.visit_id == payload.get("visit_id"), CampaignEvent.referrer_player_id == referrer_id).first()
        if existing:
            return {"status": "ok"}

    db_event = CampaignEvent(
        event_type=event_type,
        channel=payload.get("channel"),
        referrer_player_id=referrer_id,
        actor_player_id=get_player_for_request(request, db).id if request.cookies.get("session_token") else None,
        visit_id=payload.get("visit_id"),
    )
    db.add(db_event)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
