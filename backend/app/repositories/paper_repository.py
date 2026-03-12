from typing import List, Optional, Dict, Any
from supabase import create_client, Client
from app.core.config import SUPABASE_URL, SUPABASE_KEY
from app.repositories.base import BaseRepository

class PaperRepository(BaseRepository[Dict[str, Any]]):
    def __init__(self):
        self.supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        self.table = "papers"

    def get_all(self) -> List[Dict[str, Any]]:
        try:
            response = self.supabase.table(self.table).select("*").order("created_at", desc=True).execute()
            return response.data
        except Exception as e:
            print(f"Error fetching papers: {e}")
            return []

    def get_by_id(self, id: str) -> Optional[Dict[str, Any]]:
        try:
            response = self.supabase.table(self.table).select("*").eq("id", id).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Error fetching paper {id}: {e}")
            return None

    def create(self, item: Dict[str, Any]) -> Dict[str, Any]:
        try:
            response = self.supabase.table(self.table).insert(item).execute()
            if response.data:
                return response.data[0]
            return item
        except Exception as e:
            print(f"Error creating paper: {e}")
            return item

    def update(self, id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            response = self.supabase.table(self.table).update(updates).eq("id", id).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Error updating paper {id}: {e}")
            return None

    def delete(self, id: str) -> bool:
        try:
            self.supabase.table(self.table).delete().eq("id", id).execute()
            return True
        except Exception as e:
            print(f"Error deleting paper: {e}")
            return False
