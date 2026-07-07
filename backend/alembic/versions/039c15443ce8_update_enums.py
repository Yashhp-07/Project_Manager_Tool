"""update enums — drop CRITICAL, migrate taskstatus

Revision ID: 039c15443ce8
Revises: 7b76be9c1272
Create Date: 2026-07-07 15:47:32.042501

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '039c15443ce8'
down_revision: Union[str, Sequence[str], None] = '7b76be9c1272'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


OLD_PRIORITY = ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
NEW_PRIORITY = ('LOW', 'MEDIUM', 'HIGH')

OLD_TASKSTATUS = ('TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED')
NEW_TASKSTATUS = ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED')


def upgrade() -> None:
    # --- Priority: drop CRITICAL ---
    op.execute("ALTER TYPE priority RENAME TO priority_old")
    op.execute(f"CREATE TYPE priority AS ENUM ({', '.join(repr(v) for v in NEW_PRIORITY)})")
    op.execute("""
        ALTER TABLE tasks ALTER COLUMN priority TYPE priority
        USING CASE priority::text
            WHEN 'CRITICAL' THEN 'HIGH'::text
            ELSE priority::text
        END::priority
    """)
    op.execute("DROP TYPE priority_old")

    # --- TaskStatus: rename values ---
    op.execute("ALTER TYPE taskstatus RENAME TO taskstatus_old")
    op.execute(f"CREATE TYPE taskstatus AS ENUM ({', '.join(repr(v) for v in NEW_TASKSTATUS)})")
    op.execute("""
        ALTER TABLE tasks ALTER COLUMN status TYPE taskstatus
        USING CASE status::text
            WHEN 'TODO' THEN 'NOT_STARTED'::text
            WHEN 'DONE' THEN 'COMPLETED'::text
            WHEN 'BLOCKED' THEN 'IN_PROGRESS'::text
            ELSE status::text
        END::taskstatus
    """)
    op.execute("DROP TYPE taskstatus_old")


def downgrade() -> None:
    # --- TaskStatus: revert ---
    op.execute("ALTER TYPE taskstatus RENAME TO taskstatus_new")
    op.execute(f"CREATE TYPE taskstatus AS ENUM ({', '.join(repr(v) for v in OLD_TASKSTATUS)})")
    op.execute("""
        ALTER TABLE tasks ALTER COLUMN status TYPE taskstatus
        USING CASE status::text
            WHEN 'NOT_STARTED' THEN 'TODO'::text
            WHEN 'COMPLETED' THEN 'DONE'::text
            ELSE status::text
        END::taskstatus
    """)
    op.execute("DROP TYPE taskstatus_new")

    # --- Priority: add CRITICAL back ---
    op.execute("ALTER TYPE priority RENAME TO priority_new")
    op.execute(f"CREATE TYPE priority AS ENUM ({', '.join(repr(v) for v in OLD_PRIORITY)})")
    op.execute("""
        ALTER TABLE tasks ALTER COLUMN priority TYPE priority
        USING priority::text::priority
    """)
    op.execute("DROP TYPE priority_new")
