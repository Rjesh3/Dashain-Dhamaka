from __future__ import annotations

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from .config import DATABASE_URL

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args, future=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)
Base = declarative_base()


def init_db() -> None:
    from .models import Player, ConfigVersion, Spin, LedgerEntry, CampaignEvent  # noqa: F401

    Base.metadata.create_all(bind=engine)
    from .models import seed_default_config

    seed_default_config(SessionLocal())
