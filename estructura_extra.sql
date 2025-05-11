-- Tablas adicionales para presentación académica

CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

CREATE TABLE libros (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(120) NOT NULL,
    autor VARCHAR(80) NOT NULL,
    categoria_id INTEGER REFERENCES categorias(id),
    precio_venta NUMERIC(10,2),
    precio_alquiler NUMERIC(10,2),
    stock INTEGER
);

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password VARCHAR(200) NOT NULL
);

CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(30)
);

CREATE TABLE detalle_pedido (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER REFERENCES pedidos(id),
    libro_id INTEGER REFERENCES libros(id),
    cantidad INTEGER,
    precio NUMERIC(10,2)
);

CREATE TABLE facturas (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER REFERENCES pedidos(id),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total NUMERIC(12,2)
);

-- Datos de ejemplo
INSERT INTO categorias (nombre) VALUES ('Novela'), ('Tecnología'), ('Ciencia Ficción'), ('Infantil');

INSERT INTO libros (titulo, autor, categoria_id, precio_venta, precio_alquiler, stock) VALUES
('Cómo hacer que te pasen cosas buenas', 'Marian Rojas Estapé', 1, 230000, 35000, 10),
('El Alquimista', 'Paulo Coelho', 2, 210000, 32000, 7),
('El Extranjero', 'Albert Camus', 2, 220000, 27000, 4),
('El Inversor Inteligente', 'Benjamin Graham', 3, 410000, 48000, 3),
('El Poder del Ahora', 'Eckhart Tolle', 1, 260000, 35000, 6),
('Hábitos Atómicos', 'James Clear', 1, 330000, 42000, 8),
('La Felicidad', 'Benedict Carey', 1, 210000, 32000, 3),
('La Inteligencia Emocional', 'Daniel Goleman', 1, 390000, 49000, 4),
('Padre Rico, Padre Pobre', 'Robert T. Kiyosaki', 3, 245000, 27000, 9),
('Persona Vitamina', 'Marian Rojas Estapé', 1, 230000, 27000, 2),
('Secretos de la Mente Millonaria', 'T. Harv Eker', 3, 410000, 44000, 5),
('Si lo crees, lo creas', 'Brian Tracy', 1, 220000, 25000, 7);
-- Categoría ejemplo: 1=Autoayuda/Desarrollo personal, 2=Novela/Literatura, 3=Finanzas/Negocios

-- Usuarios de ejemplo
INSERT INTO usuarios (nombre, email, password) VALUES
('marco', 'marco@mail.com', 'hash1'),
('tobias', 'tobias@mail.com', 'hash2');

-- Pedidos y facturas de ejemplo
INSERT INTO pedidos (usuario_id, estado) VALUES (1, 'Entregado'), (2, 'Pendiente');
INSERT INTO detalle_pedido (pedido_id, libro_id, cantidad, precio) VALUES (1, 1, 1, 120000), (2, 2, 2, 300000);
INSERT INTO facturas (pedido_id, total) VALUES (1, 120000), (2, 300000);
