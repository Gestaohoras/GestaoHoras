const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run(`CREATE TABLE funcionarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE lancamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    funcionario_id INTEGER,
    data TEXT,
    hora_entrada TEXT,
    hora_saida TEXT,
    FOREIGN KEY(funcionario_id) REFERENCES funcionarios(id)
  )`);
});

app.post('/funcionarios', (req, res) => {
  const { nome } = req.body;
  db.run('INSERT INTO funcionarios (nome) VALUES (?)', [nome], function(err) {
    if (err) return res.status(500).send(err.message);
    res.json({ id: this.lastID, nome });
  });
});

app.get('/funcionarios', (req, res) => {
  db.all('SELECT * FROM funcionarios', [], (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.json(rows);
  });
});

app.post('/lancamentos', (req, res) => {
  const { funcionario_id, data, hora_entrada, hora_saida } = req.body;
  db.run(
    'INSERT INTO lancamentos (funcionario_id, data, hora_entrada, hora_saida) VALUES (?, ?, ?, ?)',
    [funcionario_id, data, hora_entrada, hora_saida],
    function(err) {
      if (err) return res.status(500).send(err.message);
      res.json({ id: this.lastID });
    }
  );
});

app.get('/banco-horas/:id', (req, res) => {
  const funcionarioId = req.params.id;
  db.all(
    'SELECT data, hora_entrada, hora_saida FROM lancamentos WHERE funcionario_id = ?',
    [funcionarioId],
    (err, rows) => {
      if (err) return res.status(500).send(err.message);
      let totalMinutos = 0;
      rows.forEach(({ hora_entrada, hora_saida }) => {
        const [h1, m1] = hora_entrada.split(':').map(Number);
        const [h2, m2] = hora_saida.split(':').map(Number);
        totalMinutos += (h2 * 60 + m2) - (h1 * 60 + m1);
      });
      const horas = Math.floor(totalMinutos / 60);
      const minutos = totalMinutos % 60;
      res.json({ totalHoras: `${horas}h${minutos}m` });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
