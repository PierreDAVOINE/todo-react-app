require("dotenv").config();
const PORT = process.env.PORT ?? 8000;
const express = require("express");
const app = express();
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const pool = require("./db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors());
app.use(express.json());

app.get("/todos/:userEmail", async (req, res) => {
  const { userEmail } = req.params;
  console.log("get !");
  try {
    const todos = await pool.query(
      "SELECT * FROM todos WHERE user_email = $1",
      [userEmail]
    );
    console.log(todos.rows);
    res.json(todos.rows);
  } catch (error) {
    console.error(error);
  }
});

// Création d'une nouvelle entrée

app.post("/todos", async (req, res) => {
  const { user_email, title, progress, date } = req.body;
  console.log(user_email, title, progress, date);
  const id = uuidv4();
  console.log("create !");
  try {
    const newTodo = await pool.query(
      `INSERT INTO todos(id, user_email, title, progress, date) VALUES($1, $2, $3, $4, $5);`,
      [id, user_email, title, progress, date]
    );
    res.json(newTodo);
  } catch (error) {
    console.error(error);
  }
});

// Modification d'une nouvelle entrée

app.put("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { user_email, title, progress, date } = req.body;
  console.log("edit !");
  try {
    const editTodo = await pool.query(
      `UPDATE todos SET user_email = $1, title = $2, progress = $3, date = $4 WHERE id = $5;`,
      [user_email, title, progress, date, id]
    );
    res.json(editTodo);
  } catch (error) {
    console.error(error);
  }
});

// Supprimer une tâche

app.delete("/todos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deleteToDo = await pool.query("DELETE FROM todos WHERE id = $1;", [
      id,
    ]);
    res.json(deleteToDo);
  } catch (error) {
    console.error(error);
  }
});

// Créer un compte
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);
  try {
    const signUp = await pool.query(
      "INSERT INTO users (email, hashed_password) VALUES($1, $2)",
      [email, hashedPassword]
    );
    const token = jwt.sign({ email }, "secret", { expiresIn: "1hr" });
    console.log("inscris et connecté !");
    res.json({ email, token });
  } catch (error) {
    console.error(error);
    if (error) {
      res.json({ detail: error.detail });
    }
  }
});

// Se connecter
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const users = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (!users.rows.length) return res.json({ detail: "User does not exist!" });
    console.log("on compare les mdp");
    const success = await bcrypt.compare(
      password,
      users.rows[0].hashed_password
    );

    if (success) {
      const token = jwt.sign({ email }, "secret", { expiresIn: "1hr" });
      res.json({ email: users.rows[0].email, token });
    } else {
      res.json({ detail: "Login failed" });
    }
  } catch (error) {
    console.error(error);
  }
});

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
