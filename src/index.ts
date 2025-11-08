import { Hono } from 'hono'
import { html } from 'hono/html'

type User = {
  name: string
}

function MainHeader(user: User, message: string) {
  return html`<h1>Hello ${user.name}</h1>
  <p>The length of name is ${user.name.length}. The message is ${message}</p>`
}

const app = new Hono()

app.get('/', (c) => {
  const user: User = { name: "bob" }
  const message = "this is my message"
  const mainHeaderHtml = MainHeader(user, message)
  return c.html(mainHeaderHtml)
})

export default app
