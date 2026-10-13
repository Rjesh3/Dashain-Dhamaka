from __future__ import annotations

import hashlib
import random
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy import JSON, BigInteger, Boolean, DateTime, ForeignKey, Integer, LargeBinary, String, UniqueConstraint, text
from sqlalchemy.orm import Mapped, Session, mapped_column, relationship

from .config import DEFAULT_OUTCOMES
from .database import Base


def _make_public_id() -> str:
    return f"player-{uuid.uuid4().hex[:8]}"


def _make_share_code() -> str:
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    return "".join(random.choice(alphabet) for _ in range(8))


def _hash_token(token: str) -> bytes:
    return hashlib.sha256(token.encode("utf-8")).digest()


class Player(Base):
    __tablename__ = "players"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    public_id: Mapped[str] = mapped_column(String(32), unique=True, nullable=False, default=_make_public_id)
    share_code: Mapped[str] = mapped_column(String(8), unique=True, nullable=False, default=_make_share_code)
    token_hash: Mapped[bytes | None] = mapped_column(LargeBinary, unique=True, nullable=True)
    spin_limit: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    spins_used: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    points_balance: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)
    referred_by_player_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("players.id"), nullable=True)
    locale: Mapped[str] = mapped_column(String(4), default="en", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    last_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc) + timedelta(days=30))

    spins: Mapped[list["Spin"]] = relationship(back_populates="player")
    ledger_entries: Mapped[list["LedgerEntry"]] = relationship(back_populates="player")


class ConfigVersion(Base):
    __tablename__ = "config_versions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    outcomes: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    initial_spins: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    created_by: Mapped[str | None] = mapped_column(String(64), nullable=True)
    change_note: Mapped[str | None] = mapped_column(String(255), nullable=True)

    spins: Mapped[list["Spin"]] = relationship(back_populates="config")


class Spin(Base):
    __tablename__ = "spins"
    __table_args__ = (
        UniqueConstraint("player_id", "idempotency_key", name="uq_player_idempotency_key"),
        UniqueConstraint("player_id", "spin_number", name="uq_player_spin_number"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    player_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("players.id"), nullable=False)
    spin_number: Mapped[int] = mapped_column(Integer, nullable=False)
    idempotency_key: Mapped[str] = mapped_column(String(64), nullable=False)
    config_version_id: Mapped[int] = mapped_column(ForeignKey("config_versions.id"), nullable=False)
    outcome_id: Mapped[str] = mapped_column(String(32), nullable=False)
    points_awarded: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    player: Mapped[Player] = relationship(back_populates="spins")
    config: Mapped[ConfigVersion] = relationship(back_populates="spins")
    ledger_entry: Mapped["LedgerEntry"] = relationship(back_populates="spin")


class LedgerEntry(Base):
    __tablename__ = "ledger_entries"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    player_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("players.id"), nullable=False)
    spin_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("spins.id"), unique=True, nullable=False)
    entry_type: Mapped[str] = mapped_column(String(32), default="spin_award", nullable=False)
    points_delta: Mapped[int] = mapped_column(Integer, nullable=False)
    balance_after: Mapped[int] = mapped_column(BigInteger, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    player: Mapped[Player] = relationship(back_populates="ledger_entries")
    spin: Mapped[Spin] = relationship(back_populates="ledger_entry")


class CampaignEvent(Base):
    __tablename__ = "campaign_events"
    __table_args__ = (
        UniqueConstraint("event_type", "visit_id", "referrer_player_id", name="uq_referral_visit"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    event_type: Mapped[str] = mapped_column(String(32), nullable=False)
    channel: Mapped[str | None] = mapped_column(String(32), nullable=True)
    referrer_player_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("players.id"), nullable=True)
    actor_player_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("players.id"), nullable=True)
    visit_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


def seed_default_config(db: Session) -> None:
    if db.query(ConfigVersion).count() > 0:
        return
    config = ConfigVersion(
        outcomes=DEFAULT_OUTCOMES,
        initial_spins=5,
        is_active=True,
        created_by="system",
        change_note="Initial Dashain Dhamaka config",
    )
    db.add(config)
    db.commit()
