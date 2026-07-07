"""Make users.email nullable — auto-created users have no email.

Revision ID: 5381c3b62a0a
Revises: 039c15443ce8
Create Date: 2026-07-07 16:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '5381c3b62a0a'
down_revision: Union[str, Sequence[str], None] = '039c15443ce8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column('users', 'email', nullable=True)


def downgrade() -> None:
    op.alter_column('users', 'email', nullable=False)
