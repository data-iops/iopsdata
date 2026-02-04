"""Database layer for Supabase integration."""

from .models import (
    Connection,
    Conversation,
    Message,
    QueryHistory,
    UploadedFile,
    UserSettings,
    Workspace,
    WorkspaceMember,
)
from .supabase import SupabaseClientWrapper, build_supabase_config, get_supabase_client

__all__ = [
    "Connection",
    "Conversation",
    "Message",
    "QueryHistory",
    "UploadedFile",
    "UserSettings",
    "Workspace",
    "WorkspaceMember",
    "SupabaseClientWrapper",
    "build_supabase_config",
    "get_supabase_client",
]
