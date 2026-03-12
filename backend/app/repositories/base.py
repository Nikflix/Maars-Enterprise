from typing import List, Optional, Generic, TypeVar
from abc import ABC, abstractmethod

T = TypeVar('T')

class BaseRepository(Generic[T], ABC):
    @abstractmethod
    def get_all(self) -> List[T]:
        pass

    @abstractmethod
    def get_by_id(self, id: str) -> Optional[T]:
        pass

    @abstractmethod
    def create(self, item: T) -> T:
        pass

    @abstractmethod
    def delete(self, id: str) -> bool:
        pass
