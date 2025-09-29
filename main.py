from fastapi import FastAPI, Request, HTTPException, Form
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from jinja2 import Environment, FileSystemLoader
from models.todo_item import TodoItem, TodoForm, TodoSearchResult
from typing import Annotated

app = FastAPI()
templates = Jinja2Templates(directory="templates")
env = Environment(loader=FileSystemLoader("templates"))

todo_list: list[TodoItem] = [
  TodoItem(1, 'First Todo', 'the first item to do', False),
  TodoItem(2, 'Second Todo', 'the second item to do', False)
]

async def search_todo_list(id: int) -> TodoSearchResult:
  for i, todo in enumerate(todo_list):
    if todo.id == id:
      return TodoSearchResult(idx=i, todo_item=todo)
  return TodoSearchResult(idx=-1, todo_item=None)


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
  page = templates.TemplateResponse("home.jinja", {'request': request, 'todo_list': todo_list})
  return page

@app.post('/toggle/{id}', response_class=HTMLResponse)
async def toggle_completion(request: Request, id: int):
  todo_item = [t for t in todo_list if t.id == id]
  if len(todo_item) == 0:
    raise HTTPException(status_code=404, detail=f"Could not find todo item with id {id}")
  if todo_item[0].status:
    todo_item[0].status = False
  else:
    todo_item[0].status = True
  template = env.get_template('todo.jinja')
  TodoStatusButton = template.module.TodoStatusButton # type: ignore
  component = TodoStatusButton(id=todo_item[0].id, status=todo_item[0].status)
  return component

@app.get('/show-form', response_class=HTMLResponse)
async def show_form():
  template = env.get_template('todo.jinja')
  NewTodo = template.module.NewTodo # type: ignore
  component = NewTodo()
  return component

@app.post('/new', response_class=HTMLResponse)
async def new_todo(new_todo_data: Annotated[TodoForm, Form()]):
  # insert new todo item into todo_list
  new_id = max([t.id for t in todo_list]) + 1 if len(todo_list) > 0 else 0
  new_todo_item = TodoItem(id=new_id, title=new_todo_data.title, description=new_todo_data.description, status=False)
  todo_list.append(new_todo_item)
  
  template = env.get_template('todo.jinja')
  AddFormButton = template.module.AddFormButton # type: ignore
  addFormButton = AddFormButton()
  NewTodo = template.module.Todo # type: ignore
  newTodo = NewTodo(new_todo_item)

  htmlResponse = addFormButton + '\n' + newTodo
  return htmlResponse

@app.get('/edit-form/{id}', response_class=HTMLResponse)
async def get_edit_form(id: int):
  template = env.get_template('todo.jinja')
  TodoEditForm = template.module.TodoEditForm # type: ignore
  todoSearch = await search_todo_list(id)
  if todoSearch.idx == -1:
    raise HTTPException(status_code=404, detail=f"Could not find todo item with id {id}")
  todoEditForm = TodoEditForm(todo_list[todoSearch.idx])
  return todoEditForm

@app.post('/edit/{id}', response_class=HTMLResponse)
async def edit_todo(id: int, new_todo_data: Annotated[TodoForm, Form()]):
  # find the existing todo item
  todoSearch = await search_todo_list(id)
  if todoSearch.todo_item == None:
    raise HTTPException(status_code=404, detail=f"Could not find todo item with id {id}")

  # generate edited todo, based on form data
  edited_todo_item = TodoItem(id=id, title=new_todo_data.title, description=new_todo_data.description, status=todoSearch.todo_item.status)
  todo_list[todoSearch.idx] = edited_todo_item

  # populate page with updated HTML
  template = env.get_template('todo.jinja')
  Todo = template.module.Todo # type: ignore
  todo_component = Todo(edited_todo_item)
  return todo_component

@app.delete('/delete/{id}', response_class=HTMLResponse)
async def delete(id: int):
  todoSearch = await search_todo_list(id)
  if todoSearch.idx > -1:
    del todo_list[todoSearch.idx]
    return ''
  else:
    return HTTPException(status_code=404, detail=f'Could not find id {id}')