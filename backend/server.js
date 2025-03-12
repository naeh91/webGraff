const express = require("express");
const multer = require("multer");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

const db = mysql.createConnection({
  host: "localhost",
  user: "dev",
  password: "",
  database: "artistas",
});

db.connect((err) => {
  if (err) {
    console.error("Error al conectar a la base de datos:", err);
  } else {
    console.log("Conectado a la base de datos MySQL");
  }
});

app.post("/api/artistas", upload.single("imagen"), (req, res) => {
  const { nombre, ubicacion } = req.body;
  const imagen = req.file ? req.file.filename : null;
  const sql =
    "INSERT INTO artistas (nombre, ubicacion, imagen) VALUES (?, ?, ?)";
  db.query(sql, [nombre, ubicacion, imagen], (err, result) => {
    if (err) {
      console.error("Error al insertar datos:", err);
      res.status(500).send("Error al insertar datos");
    } else {
      res.send("Datos insertados correctamente");
    }
  });
});

app.get("/api/imagenes", (req, res) => {
  const sql = "SELECT imagen FROM artistas WHERE imagen IS NOT NULL";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener imágenes:", err);
      res.status(500).send("Error al obtener imágenes");
    } else {
      const imagenes = results.map((result) => result.imagen);
      res.json(imagenes);
    }
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en el puerto ${PORT}`);
});
