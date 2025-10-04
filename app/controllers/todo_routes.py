from fastapi import Request, HTTPException, Form, APIRouter
from fastapi.responses import HTMLResponse
from app.models.todo_item import TodoItem, TodoForm
from typing import Annotated
from fastapi.templating import Jinja2Templates
from jinja2 import Environment, FileSystemLoader
from app.services.state import update_todo, get_todo, new_id, load_data, add_todo, delete_todo

templates = Jinja2Templates(directory="templates")
template_env = Environment(loader=FileSystemLoader("templates"))

router = APIRouter()

@router.get("/", response_class=HTMLResponse)
async def home(request: Request):
  todo_list = await load_data()
  page = templates.TemplateResponse("home.jinja", {'request': request, 'todo_list': todo_list})
  return page

@router.post('/toggle/{id}', response_class=HTMLResponse)
async def toggle_completion(request: Request, id: int):
  todo_item = await get_todo(id)
  if todo_item == None:
    raise HTTPException(status_code=404, detail=f'could not find todo item with id {id}')
  if todo_item.status:
    todo_item.status = False
  else:
    todo_item.status = True
  update_result = await update_todo(id, todo_item)
  if update_result == False:
    return HTTPException(status_code=500)

  template = template_env.get_template('todo.jinja')
  TodoStatusButton = template.module.TodoStatusButton # type: ignore
  component = TodoStatusButton(id=todo_item.id, status=todo_item.status)
  return component

@router.get('/show-form', response_class=HTMLResponse)
async def show_form():
  template = template_env.get_template('todo.jinja')
  NewTodo = template.module.NewTodo # type: ignore
  component = NewTodo()
  return component

@router.post('/new', response_class=HTMLResponse)
async def new_todo(new_todo_data: Annotated[TodoForm, Form()]):
  id = await new_id()
  new_todo_item = TodoItem(id=id, title=new_todo_data.title, description=new_todo_data.description, status=False)
  add_todo_response = await add_todo(todo_item=new_todo_item)
  if add_todo_response == False:
    raise HTTPException(status_code=500)
  
  template = template_env.get_template('todo.jinja')
  AddFormButton = template.module.AddFormButton # type: ignore
  addFormButton = AddFormButton()
  NewTodo = template.module.Todo # type: ignore
  newTodo = NewTodo(new_todo_item)

  htmlResponse = addFormButton + '\n' + newTodo
  return htmlResponse

@router.get('/edit-form/{id}', response_class=HTMLResponse)
async def get_edit_form(id: int):
  template = template_env.get_template('todo.jinja')
  TodoEditForm = template.module.TodoEditForm # type: ignore
  todo_item = await get_todo(id)
  if todo_item == None:
    raise HTTPException(status_code=404, detail=f"Could not find todo item with id {id}")

  todoEditForm = TodoEditForm(todo_item)
  return todoEditForm

@router.post('/edit/{id}', response_class=HTMLResponse)
async def edit_todo(id: int, new_todo_data: Annotated[TodoForm, Form()]):
  # find the existing todo item
  todo_item = await get_todo(id)
  if todo_item == None:
    raise HTTPException(status_code=404, detail=f"Could not find todo item with id {id}")

  # generate edited todo, based on form data
  edited_todo_item = TodoItem(
    id=id, 
    title=new_todo_data.title, 
    description=new_todo_data.description, 
    status=todo_item.status)
  update_todo_status = update_todo(id, edited_todo_item)
  if update_todo_status == False:
    raise HTTPException(status_code=500)

  # populate page with updated HTML
  template = template_env.get_template('todo.jinja')
  Todo = template.module.Todo # type: ignore
  todo_component = Todo(edited_todo_item)
  return todo_component

@router.delete('/delete/{id}', response_class=HTMLResponse)
async def delete(id: int):
  todo_item = await get_todo(id)
  if todo_item == None:
    raise HTTPException(status_code=404, detail=f"Could not find todo item with id {id}")
  delete_todo_response = await delete_todo(id)
  if delete_todo_response == False:
    raise HTTPException(status_code=500)
  return ''
