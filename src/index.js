const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  if (!username) {
    return response.status(400).json({ error: "Dosn't possible find username attribute"});
  }

  const userExists = users.find(user => user.username === username);

  if (!userExists) {
    return response.status(400).json({error: "This username not exists"});
  }
  
  request.user = userExists;

  return next();
}

function todoExists(request, response, next) {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id);

  if(!todo) {
    return response.status(404).json({error: "Todo not exists"});
  }

  request.todo = todo;

  return next();
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;
  const userExists = users.find(user => user.username === username);
  
  if (userExists) {
    return response.status(400).json({"error": "This user is already"});
  }

  const userData = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(userData);

  return response.status(200).json(userData);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, todoExists, (request, response) => {
  const { todo } = request;
  const { title, deadline } = request.body;
  
  todo.title = title;
  todo.deadline = deadline;

  return response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, todoExists,(request, response) => {
  const { todo } = request;

  if(!todo) {
    return response.status(404).json({error: "Todo not exists"});
  }

  todo.done = true;

  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, todoExists,(request, response) => {
  const { user } = request;
  const { id } = request.params;

  const indexTodo = user.todos.findIndex(todoOut => todoOut.id === id);

  user.todos.splice(indexTodo, 1);

  return response.status(204).send();
});

module.exports = app;