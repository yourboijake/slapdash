from app.models.todo_item import TodoSearchResult, TodoItem
from fastapi import HTTPException, Response
import json
from pydantic import TypeAdapter
from typing import List
import os

JSON_FILE_NAME=os.path.dirname(os.path.realpath(__file__)) + '/todo_list.json'

async def load_data() -> List[TodoItem]:
  todo_json: List[dict] = json.loads(open(JSON_FILE_NAME).read())
  todo_list: List[TodoItem] = [TodoItem(id=t['id'], title=t['title'], description=t['description'], status=t['status']) for t in todo_json]
  return todo_list

async def save_data(todo_list: List[TodoItem]) -> bool:
  TodoItemListTypeAdapter = TypeAdapter(List[TodoItem])
  json_data = TodoItemListTypeAdapter.dump_json(todo_list, indent=4)
  try:
    with open(JSON_FILE_NAME, 'wb') as f:
      f.write(json_data)
    return True
  except:
    return False

async def search_todo_list(id: int, todo_list: List[TodoItem]) -> TodoSearchResult:
  for i, todo in enumerate(todo_list):
    if todo.id == id:
      return TodoSearchResult(idx=i, todo_item=todo)
  return TodoSearchResult(idx=-1, todo_item=None)

async def update_todo(id: int, todo_item: TodoItem) -> bool:
  todo_list = await load_data()
  search_result = await search_todo_list(id, todo_list)
  if search_result.todo_item == None:
    return False
  todo_list[search_result.idx] = todo_item
  save_result = await save_data(todo_list)
  return save_result

async def new_id() -> int:
  todo_list = await load_data()
  if len(todo_list) == 0:
    return 0
  id: int = max([t.id for t in todo_list]) + 1
  return id

async def add_todo(todo_item: TodoItem) -> bool:
  todo_list = await load_data()
  todo_list.append(todo_item)
  save_data_result = await save_data(todo_list)
  return save_data_result
 
async def get_todo(id: int) -> TodoItem | None:
  todo_list = await load_data()
  search_result = await search_todo_list(id, todo_list)
  return search_result.todo_item

async def delete_todo(id: int) -> bool:
  todo_list = await load_data()
  todo_search = await search_todo_list(id, todo_list)
  if todo_search.idx == -1:
    return False
  del todo_list[todo_search.idx]
  save_data_response = await save_data(todo_list)
  return save_data_response
