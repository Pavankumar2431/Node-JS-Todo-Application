const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'todoApplication.db')
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

app.get('/todos/', async (request, response) => {
  let data = null
  let getTodosQuery = ''
  const {search_q = '', status, priority} = request.query

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `SELECT
      *
    FROM
      todo 
    WHERE
      todo LIKE '%${search_q}%'
      AND status = '${status}'
      AND priority = '${priority}';`
      break

    case hasPriorityProperty(request.query):
      getTodosQuery = `SELECT
      *
    FROM
      todo 
    WHERE
      todo LIKE '%${search_q}%'
      AND priority = '${priority}';`
      break

    case hasStatusProperty(request.query):
      getTodosQuery = `SELECT
      *
    FROM
      todo 
    WHERE
      todo LIKE '%${search_q}%'
      AND status = '${status}';`
      break
    case hasSearchProperty(request.query):
      getTodosQuery = `SELECT
      *
    FROM
      todo 
    WHERE
      todo LIKE '%${search_q}%';`
      break
  }

  const statusList = await db.all(getTodosQuery)
  response.send(statusList)
})
const hasPriorityAndStatusProperties = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}

const hasPriorityProperty = requestQuery => {
  return requestQuery.priority !== undefined
}

const hasStatusProperty = requestQuery => {
  return requestQuery.status !== undefined
}
const hasSearchProperty = requestQuery => {
  return requestQuery.search_q !== undefined
}
//API2
app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getTodoIdQuery = `
  SELECT * FROM todo WHERE id = ${todoId};`

  const todoItem = await db.get(getTodoIdQuery)
  response.send(todoItem)
})
//API3
app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  const posttodoQuery = `
  INSERT INTO todo (id, todo, priority, status)
  VALUES (${id}, '${todo}' , '${priority}' , '${status}');`

  await db.run(posttodoQuery)
  response.send('Todo Successfully Added')
})
//API4
app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  let data = null
  let putTodosQuery = ''
  const {status, priority, todo} = request.body
  switch (true) {
    case hasputStatusProperty(request.body):
      putTodosQuery = `UPDATE
      todo
      SET 
      status = '${status}'
    WHERE
      id = ${todoId};`
      response.send('Status Updated')
      break

    case hasputPriorityProperty(request.body):
      putTodosQuery = `UPDATE
      todo 
      SET
      priority = '${priority}'
    WHERE
       id = ${todoId};`
      response.send('Priority Updated')
      break

    case hasputToDoProperty(request.body):
      putTodosQuery = `UPDATE
      todo 
      SET
      todo = '${todo}'
    WHERE
       id = ${todoId};`
      response.send('Todo Updated')
      break
  }

  const putItems = await db.run(putTodosQuery)
})
const hasputStatusProperty = requestbody => {
  return requestbody.status !== undefined
}

const hasputPriorityProperty = requestbody => {
  return requestbody.priority !== undefined
}

const hasputToDoProperty = requestbody => {
  return requestbody.todo !== undefined
}

//API DELETE
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteQuery = `
  DELETE FROM todo WHERE id = ${todoId};`

  await db.run(deleteQuery)
  response.send('Todo Deleted')
})

module.exports = app
