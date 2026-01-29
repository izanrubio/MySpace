import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/languages - Obtener todos los lenguajes del usuario
router.get('/', authMiddleware, async (req, res) => {
    try {
        const languages = await prisma.language.findMany({
            where: { userId: req.userId },
            orderBy: { createdAt: 'desc' },
        });
        res.json(languages);
    } catch (error) {
        console.error('Error al obtener lenguajes:', error);
        res.status(500).json({ error: 'Error al obtener lenguajes' });
    }
});

// GET /api/languages/:id - Obtener un lenguaje específico
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const language = await prisma.language.findFirst({
            where: {
                id: req.params.id,
                userId: req.userId,
            },
        });

        if (!language) {
            return res.status(404).json({ error: 'Lenguaje no encontrado' });
        }

        res.json(language);
    } catch (error) {
        console.error('Error al obtener lenguaje:', error);
        res.status(500).json({ error: 'Error al obtener lenguaje' });
    }
});

// POST /api/languages - Crear un nuevo lenguaje
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, description, content, image } = req.body;

        if (!name || !content) {
            return res.status(400).json({ error: 'Nombre y contenido son requeridos' });
        }

        const language = await prisma.language.create({
            data: {
                name,
                description,
                content,
                image,
                userId: req.userId,
            },
        });

        res.status(201).json(language);
    } catch (error) {
        console.error('Error al crear lenguaje:', error);
        res.status(500).json({ error: 'Error al crear lenguaje' });
    }
});

// PUT /api/languages/:id - Actualizar un lenguaje
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { name, description, content, image } = req.body;

        // Verificar que el lenguaje pertenece al usuario
        const existing = await prisma.language.findFirst({
            where: {
                id: req.params.id,
                userId: req.userId,
            },
        });

        if (!existing) {
            return res.status(404).json({ error: 'Lenguaje no encontrado' });
        }

        const language = await prisma.language.update({
            where: { id: req.params.id },
            data: {
                name,
                description,
                content,
                image,
            },
        });

        res.json(language);
    } catch (error) {
        console.error('Error al actualizar lenguaje:', error);
        res.status(500).json({ error: 'Error al actualizar lenguaje' });
    }
});

// DELETE /api/languages/:id - Eliminar un lenguaje
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        // Verificar que el lenguaje pertenece al usuario
        const existing = await prisma.language.findFirst({
            where: {
                id: req.params.id,
                userId: req.userId,
            },
        });

        if (!existing) {
            return res.status(404).json({ error: 'Lenguaje no encontrado' });
        }

        await prisma.language.delete({
            where: { id: req.params.id },
        });

        res.json({ message: 'Lenguaje eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar lenguaje:', error);
        res.status(500).json({ error: 'Error al eliminar lenguaje' });
    }
});

// POST /api/languages/generate - Generar documentación con IA
router.post('/generate', authMiddleware, async (req, res) => {
    try {
        const { languageName } = req.body;

        if (!languageName) {
            return res.status(400).json({ error: 'Nombre del lenguaje es requerido' });
        }

        // Generar template específico según el lenguaje
        const template = generateLanguageTemplate(languageName);

        res.json({
            content: template,
            message: 'Template generado. Puedes editarlo según tus necesidades.'
        });
    } catch (error) {
        console.error('Error al generar template:', error);
        res.status(500).json({ error: 'Error al generar template' });
    }
});

// Función para generar templates específicos por lenguaje
function generateLanguageTemplate(languageName) {
    const lang = languageName.toLowerCase();

    // Templates específicos para lenguajes populares
    const templates = {
        javascript: `# JavaScript

## Introducción
JavaScript es un lenguaje de programación interpretado, orientado a objetos y basado en prototipos. Es uno de los lenguajes más populares del mundo, usado principalmente para desarrollo web tanto en el frontend como en el backend.

## Instalación

### Node.js (JavaScript en el servidor)

#### Windows
\`\`\`bash
# Descarga el instalador desde https://nodejs.org/
# O usa Chocolatey
choco install nodejs
\`\`\`

#### macOS
\`\`\`bash
# Usando Homebrew
brew install node
\`\`\`

#### Linux
\`\`\`bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Fedora
sudo dnf install nodejs
\`\`\`

## Frameworks y Librerías Populares

### Frontend
- **React** - Biblioteca para construir interfaces de usuario
- **Vue.js** - Framework progresivo para construir UIs
- **Angular** - Framework completo para aplicaciones web
- **Svelte** - Compilador que genera código JavaScript optimizado
- **Next.js** - Framework de React para producción

### Backend
- **Express.js** - Framework web minimalista para Node.js
- **NestJS** - Framework progresivo para aplicaciones del lado del servidor
- **Fastify** - Framework web rápido y de bajo overhead
- **Koa** - Framework web diseñado por el equipo de Express

### Testing
- **Jest** - Framework de testing delightful
- **Mocha** - Framework de testing flexible
- **Cypress** - Testing end-to-end para aplicaciones web

## Conceptos Básicos

### Variables
\`\`\`javascript
// var (evitar, scope de función)
var nombre = "Juan";

// let (scope de bloque, reasignable)
let edad = 25;
edad = 26;

// const (scope de bloque, no reasignable)
const PI = 3.14159;
\`\`\`

### Tipos de Datos
\`\`\`javascript
// Primitivos
let texto = "Hola";           // String
let numero = 42;              // Number
let booleano = true;          // Boolean
let indefinido;               // undefined
let nulo = null;              // null
let simbolo = Symbol("id");   // Symbol
let bigInt = 9007199254740991n; // BigInt

// Objetos
let persona = {
    nombre: "Ana",
    edad: 30
};

let numeros = [1, 2, 3, 4, 5]; // Array
\`\`\`

### Funciones
\`\`\`javascript
// Función tradicional
function sumar(a, b) {
    return a + b;
}

// Función flecha
const multiplicar = (a, b) => a * b;

// Función async
async function obtenerDatos() {
    const response = await fetch('https://api.example.com/data');
    return await response.json();
}
\`\`\`

### Estructuras de Control
\`\`\`javascript
// If/Else
if (edad >= 18) {
    console.log("Mayor de edad");
} else {
    console.log("Menor de edad");
}

// Switch
switch (dia) {
    case 1:
        console.log("Lunes");
        break;
    case 2:
        console.log("Martes");
        break;
    default:
        console.log("Otro día");
}

// Bucles
for (let i = 0; i < 5; i++) {
    console.log(i);
}

// For...of (arrays)
for (const item of array) {
    console.log(item);
}

// For...in (objetos)
for (const key in objeto) {
    console.log(key, objeto[key]);
}

// While
while (condicion) {
    // código
}
\`\`\`

### Programación Asíncrona
\`\`\`javascript
// Promises
fetch('https://api.example.com/data')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));

// Async/Await
async function procesarDatos() {
    try {
        const response = await fetch('https://api.example.com/data');
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error(error);
    }
}
\`\`\`

### Módulos (ES6)
\`\`\`javascript
// Exportar
export const PI = 3.14159;
export function calcularArea(radio) {
    return PI * radio * radio;
}

// Importar
import { PI, calcularArea } from './matematicas.js';

// Export default
export default class Usuario {
    constructor(nombre) {
        this.nombre = nombre;
    }
}

// Import default
import Usuario from './Usuario.js';
\`\`\`

## Recursos Adicionales
- [MDN Web Docs](https://developer.mozilla.org/es/docs/Web/JavaScript) - Documentación oficial
- [JavaScript.info](https://javascript.info/) - Tutorial moderno
- [Node.js Documentation](https://nodejs.org/docs/) - Documentación de Node.js
- [npm](https://www.npmjs.com/) - Gestor de paquetes
- [Stack Overflow](https://stackoverflow.com/questions/tagged/javascript) - Comunidad`,

        python: `# Python

## Introducción
Python es un lenguaje de programación interpretado, de alto nivel y de propósito general. Su filosofía de diseño enfatiza la legibilidad del código con el uso de indentación significativa.

## Instalación

### Windows
\`\`\`bash
# Descarga desde https://www.python.org/downloads/
# O usa Chocolatey
choco install python

# Verificar instalación
python --version
pip --version
\`\`\`

### macOS
\`\`\`bash
# Usando Homebrew
brew install python3

# Verificar instalación
python3 --version
pip3 --version
\`\`\`

### Linux
\`\`\`bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3 python3-pip

# Fedora
sudo dnf install python3 python3-pip

# Verificar instalación
python3 --version
pip3 --version
\`\`\`

## Frameworks y Librerías Populares

### Web Development
- **Django** - Framework web de alto nivel
- **Flask** - Microframework web ligero
- **FastAPI** - Framework moderno para APIs
- **Pyramid** - Framework web flexible

### Data Science & Machine Learning
- **NumPy** - Computación numérica
- **Pandas** - Análisis y manipulación de datos
- **Matplotlib** - Visualización de datos
- **Scikit-learn** - Machine Learning
- **TensorFlow** - Deep Learning
- **PyTorch** - Deep Learning

### Testing
- **pytest** - Framework de testing
- **unittest** - Framework de testing incluido
- **nose2** - Extensión de unittest

## Conceptos Básicos

### Variables
\`\`\`python
# Python es dinámicamente tipado
nombre = "Juan"
edad = 25
altura = 1.75
es_estudiante = True

# Type hints (opcional)
nombre: str = "Juan"
edad: int = 25
\`\`\`

### Tipos de Datos
\`\`\`python
# Números
entero = 42
flotante = 3.14
complejo = 3 + 4j

# Strings
texto = "Hola"
multilinea = """
Texto en
múltiples líneas
"""

# Listas (mutables)
numeros = [1, 2, 3, 4, 5]
mixta = [1, "dos", 3.0, True]

# Tuplas (inmutables)
coordenadas = (10, 20)

# Diccionarios
persona = {
    "nombre": "Ana",
    "edad": 30,
    "ciudad": "Madrid"
}

# Sets
conjunto = {1, 2, 3, 4, 5}
\`\`\`

### Funciones
\`\`\`python
# Función básica
def saludar(nombre):
    return f"Hola, {nombre}!"

# Función con parámetros por defecto
def sumar(a, b=0):
    return a + b

# Función con *args y **kwargs
def imprimir_todo(*args, **kwargs):
    print(args)
    print(kwargs)

# Lambda
cuadrado = lambda x: x ** 2

# Decoradores
def mi_decorador(func):
    def wrapper():
        print("Antes")
        func()
        print("Después")
    return wrapper

@mi_decorador
def saludar():
    print("Hola!")
\`\`\`

### Estructuras de Control
\`\`\`python
# If/Elif/Else
if edad >= 18:
    print("Mayor de edad")
elif edad >= 13:
    print("Adolescente")
else:
    print("Niño")

# For loop
for i in range(5):
    print(i)

# For con enumerate
for indice, valor in enumerate(['a', 'b', 'c']):
    print(f"{indice}: {valor}")

# While
contador = 0
while contador < 5:
    print(contador)
    contador += 1

# List comprehension
cuadrados = [x**2 for x in range(10)]
pares = [x for x in range(10) if x % 2 == 0]
\`\`\`

### Clases y Objetos
\`\`\`python
class Persona:
    # Constructor
    def __init__(self, nombre, edad):
        self.nombre = nombre
        self.edad = edad
    
    # Método
    def saludar(self):
        return f"Hola, soy {self.nombre}"
    
    # Método estático
    @staticmethod
    def es_mayor_edad(edad):
        return edad >= 18
    
    # Propiedad
    @property
    def info(self):
        return f"{self.nombre} ({self.edad} años)"

# Herencia
class Estudiante(Persona):
    def __init__(self, nombre, edad, carrera):
        super().__init__(nombre, edad)
        self.carrera = carrera
\`\`\`

### Manejo de Archivos
\`\`\`python
# Leer archivo
with open('archivo.txt', 'r') as f:
    contenido = f.read()

# Escribir archivo
with open('archivo.txt', 'w') as f:
    f.write("Hola mundo")

# Leer líneas
with open('archivo.txt', 'r') as f:
    for linea in f:
        print(linea.strip())
\`\`\`

### Manejo de Excepciones
\`\`\`python
try:
    resultado = 10 / 0
except ZeroDivisionError:
    print("No se puede dividir por cero")
except Exception as e:
    print(f"Error: {e}")
finally:
    print("Esto siempre se ejecuta")
\`\`\`

## Entornos Virtuales
\`\`\`bash
# Crear entorno virtual
python -m venv venv

# Activar (Windows)
venv\\Scripts\\activate

# Activar (macOS/Linux)
source venv/bin/activate

# Instalar paquetes
pip install requests pandas

# Guardar dependencias
pip freeze > requirements.txt

# Instalar desde requirements
pip install -r requirements.txt
\`\`\`

## Recursos Adicionales
- [Python.org](https://www.python.org/) - Sitio oficial
- [Python Documentation](https://docs.python.org/3/) - Documentación oficial
- [Real Python](https://realpython.com/) - Tutoriales y artículos
- [PyPI](https://pypi.org/) - Repositorio de paquetes
- [PEP 8](https://pep8.org/) - Guía de estilo`,

        php: `# PHP

## Introducción
PHP (Hypertext Preprocessor) es un lenguaje de programación de código abierto especialmente adecuado para el desarrollo web y que puede ser incrustado en HTML.

## Instalación

### Windows
\`\`\`bash
# Descarga XAMPP desde https://www.apachefriends.org/
# O descarga PHP desde https://windows.php.net/download/

# Verificar instalación
php -v
\`\`\`

### macOS
\`\`\`bash
# macOS incluye PHP, pero puedes instalar una versión más reciente
brew install php

# Verificar instalación
php -v
\`\`\`

### Linux
\`\`\`bash
# Ubuntu/Debian
sudo apt update
sudo apt install php php-cli php-fpm php-mysql

# Fedora
sudo dnf install php php-cli php-fpm php-mysqlnd

# Verificar instalación
php -v
\`\`\`

## Frameworks y Librerías Populares

### Frameworks Web
- **Laravel** - Framework PHP moderno y elegante
- **Symfony** - Framework PHP de alto rendimiento
- **CodeIgniter** - Framework ligero y rápido
- **Yii** - Framework de alto rendimiento
- **Slim** - Microframework para APIs

### CMS
- **WordPress** - Sistema de gestión de contenidos
- **Drupal** - CMS empresarial
- **Joomla** - CMS flexible

### Testing
- **PHPUnit** - Framework de testing
- **Codeception** - Testing full-stack
- **Pest** - Framework de testing elegante

### Herramientas
- **Composer** - Gestor de dependencias
- **PHPStan** - Análisis estático de código
- **PHP CS Fixer** - Formateador de código

## Conceptos Básicos

### Variables
\`\`\`php
<?php
// Las variables empiezan con $
$nombre = "Juan";
$edad = 25;
$altura = 1.75;
$esEstudiante = true;

// Constantes
define("PI", 3.14159);
const SITIO = "MiWeb";
?>
\`\`\`

### Tipos de Datos
\`\`\`php
<?php
// String
$texto = "Hola mundo";
$multilinea = <<<EOT
Texto en
múltiples líneas
EOT;

// Integer
$entero = 42;

// Float
$decimal = 3.14;

// Boolean
$verdadero = true;

// Array
$numeros = [1, 2, 3, 4, 5];
$persona = [
    "nombre" => "Ana",
    "edad" => 30
];

// Null
$vacio = null;

// Objeto
$obj = new stdClass();
$obj->nombre = "Juan";
?>
\`\`\`

### Funciones
\`\`\`php
<?php
// Función básica
function saludar($nombre) {
    return "Hola, $nombre!";
}

// Función con parámetros por defecto
function sumar($a, $b = 0) {
    return $a + $b;
}

// Función con type hints
function multiplicar(int $a, int $b): int {
    return $a * $b;
}

// Función anónima
$cuadrado = function($x) {
    return $x * $x;
};

// Arrow function (PHP 7.4+)
$doble = fn($x) => $x * 2;
?>
\`\`\`

### Estructuras de Control
\`\`\`php
<?php
// If/Else
if ($edad >= 18) {
    echo "Mayor de edad";
} elseif ($edad >= 13) {
    echo "Adolescente";
} else {
    echo "Niño";
}

// Switch
switch ($dia) {
    case 1:
        echo "Lunes";
        break;
    case 2:
        echo "Martes";
        break;
    default:
        echo "Otro día";
}

// For
for ($i = 0; $i < 5; $i++) {
    echo $i;
}

// Foreach
foreach ($array as $valor) {
    echo $valor;
}

foreach ($array as $clave => $valor) {
    echo "$clave: $valor";
}

// While
while ($condicion) {
    // código
}
?>
\`\`\`

### Clases y Objetos
\`\`\`php
<?php
class Persona {
    // Propiedades
    private $nombre;
    private $edad;
    
    // Constructor
    public function __construct($nombre, $edad) {
        $this->nombre = $nombre;
        $this->edad = $edad;
    }
    
    // Métodos
    public function saludar() {
        return "Hola, soy {$this->nombre}";
    }
    
    // Getter
    public function getNombre() {
        return $this->nombre;
    }
    
    // Setter
    public function setNombre($nombre) {
        $this->nombre = $nombre;
    }
    
    // Método estático
    public static function esMayorEdad($edad) {
        return $edad >= 18;
    }
}

// Herencia
class Estudiante extends Persona {
    private $carrera;
    
    public function __construct($nombre, $edad, $carrera) {
        parent::__construct($nombre, $edad);
        $this->carrera = $carrera;
    }
}

// Uso
$persona = new Persona("Juan", 25);
echo $persona->saludar();
?>
\`\`\`

### Manejo de Arrays
\`\`\`php
<?php
// Crear array
$frutas = ["manzana", "banana", "naranja"];

// Agregar elementos
$frutas[] = "uva";
array_push($frutas, "pera");

// Eliminar elementos
unset($frutas[0]);
array_pop($frutas);

// Funciones útiles
count($frutas);
in_array("manzana", $frutas);
array_map(fn($x) => strtoupper($x), $frutas);
array_filter($frutas, fn($x) => strlen($x) > 5);
?>
\`\`\`

### Manejo de Strings
\`\`\`php
<?php
$texto = "Hola Mundo";

// Longitud
strlen($texto);

// Convertir a mayúsculas/minúsculas
strtoupper($texto);
strtolower($texto);

// Reemplazar
str_replace("Mundo", "PHP", $texto);

// Dividir
explode(" ", $texto);

// Unir
implode(", ", ["a", "b", "c"]);

// Substring
substr($texto, 0, 4);
?>
\`\`\`

### Conexión a Base de Datos (PDO)
\`\`\`php
<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=midb', 'usuario', 'contraseña');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Select
    $stmt = $pdo->query('SELECT * FROM usuarios');
    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Insert con prepared statements
    $stmt = $pdo->prepare('INSERT INTO usuarios (nombre, email) VALUES (?, ?)');
    $stmt->execute(['Juan', 'juan@example.com']);
    
    // Update
    $stmt = $pdo->prepare('UPDATE usuarios SET nombre = ? WHERE id = ?');
    $stmt->execute(['Pedro', 1]);
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
\`\`\`

## Composer (Gestor de Dependencias)
\`\`\`bash
# Instalar Composer
curl -sS https://getcomposer.org/installer | php

# Inicializar proyecto
composer init

# Instalar paquetes
composer require vendor/package

# Instalar Laravel
composer create-project laravel/laravel mi-proyecto

# Actualizar dependencias
composer update
\`\`\`

## Recursos Adicionales
- [PHP.net](https://www.php.net/) - Documentación oficial
- [Laravel](https://laravel.com/) - Framework PHP moderno
- [Packagist](https://packagist.org/) - Repositorio de paquetes
- [PHP The Right Way](https://phptherightway.com/) - Mejores prácticas
- [Laracasts](https://laracasts.com/) - Tutoriales en video`
    };

    // Si existe un template específico, usarlo
    if (templates[lang]) {
        return templates[lang];
    }

    // Template genérico para otros lenguajes
    return `# ${languageName}

## Introducción
${languageName} es un lenguaje de programación moderno y versátil utilizado en diversos ámbitos del desarrollo de software.

## Instalación

### Windows
\`\`\`bash
# Descarga el instalador oficial desde el sitio web de ${languageName}
# O usa un gestor de paquetes como Chocolatey o Scoop
\`\`\`

### macOS
\`\`\`bash
# Usando Homebrew (recomendado)
brew install ${lang}

# O descarga desde el sitio oficial
\`\`\`

### Linux
\`\`\`bash
# Ubuntu/Debian
sudo apt update
sudo apt install ${lang}

# Fedora
sudo dnf install ${lang}

# Arch Linux
sudo pacman -S ${lang}
\`\`\`

## Frameworks y Librerías Populares

### Frameworks
- Framework 1 - Descripción breve
- Framework 2 - Descripción breve
- Framework 3 - Descripción breve

### Librerías Útiles
- Librería 1 - Para manejo de datos
- Librería 2 - Para testing
- Librería 3 - Para desarrollo web

## Conceptos Básicos

### Variables
\`\`\`${lang}
// Declaración de variables
variable = valor
\`\`\`

### Tipos de Datos
\`\`\`${lang}
// Tipos de datos básicos
// String, Integer, Float, Boolean, etc.
\`\`\`

### Funciones
\`\`\`${lang}
// Definición de funciones
function nombre(parametros) {
    // código
    return resultado
}
\`\`\`

### Estructuras de Control
\`\`\`${lang}
// If/Else
if (condicion) {
    // código
} else {
    // código alternativo
}

// Bucles
for (i = 0; i < 10; i++) {
    // código
}

while (condicion) {
    // código
}
\`\`\`

### Clases y Objetos (si aplica)
\`\`\`${lang}
// Definición de clases
class NombreClase {
    constructor() {
        // inicialización
    }
    
    metodo() {
        // código
    }
}
\`\`\`

## Herramientas de Desarrollo

### Editores Recomendados
- Visual Studio Code
- IntelliJ IDEA
- Sublime Text
- Vim/Neovim

### Gestores de Paquetes
- Gestor de paquetes específico del lenguaje

### Testing
- Framework de testing 1
- Framework de testing 2

## Recursos Adicionales
- [Documentación Oficial](https://ejemplo.com) - Documentación completa
- [Tutorial Interactivo](https://ejemplo.com) - Aprende haciendo
- [Comunidad](https://ejemplo.com) - Foros y soporte
- [Awesome ${languageName}](https://github.com) - Lista curada de recursos

## Mejores Prácticas
1. Escribe código limpio y legible
2. Comenta tu código cuando sea necesario
3. Sigue las convenciones de estilo del lenguaje
4. Escribe tests para tu código
5. Mantén tus dependencias actualizadas

## Próximos Pasos
1. Completa un tutorial básico
2. Construye un proyecto pequeño
3. Lee código de proyectos open source
4. Contribuye a la comunidad
5. Mantente actualizado con las nuevas versiones
`;
}

export default router;
