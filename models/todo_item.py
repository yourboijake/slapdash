from dataclasses import dataclass
from enum import Enum
from typing import Annotated
from pydantic import BaseModel

@dataclass 
class TodoItem:
  id: int
  title: str
  description: str
  status: bool

class TodoForm(BaseModel):
  title: str
  description: str

class TodoSearchResult(BaseModel):
  idx: int
  todo_item: TodoItem | None = None