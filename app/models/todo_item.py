from dataclasses import dataclass
from pydantic import BaseModel

class TodoItem(BaseModel):
  id: int
  title: str
  description: str
  status: bool

class TodoForm(BaseModel):
  title: str
  description: str

class TodoSearchResult(BaseModel):
  idx: int
  todo_item: TodoItem | None