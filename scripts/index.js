const contenedorProductos = document.getElementById("contenedorProductos");
const cantidadResultados = document.getElementById("cantidadResultados");
const carritoCantidad = document.getElementById("carritoCantidad");
const carritoTotal = document.getElementById("carritoTotal");
const abrirCarrito = document.getElementById("abrirCarrito");

const modalDetalle = new ModalDetalleProducto();
const carrito = new Carrito();
const modalCarrito = new ModalCarrito(carrito);
const modalCheckout = new ModalCheckout(carrito);

let productos = [];

class Filtros {
  constructor(productos, onFiltrar, onCambioCategoria) {
    this.productos = productos;
    this.onFiltrar = onFiltrar;
    this.onCambioCategoria = onCambioCategoria;

    this.estado = {
      categoria: "",
      genero: "",
      autor: "",
      tipo: "",
      precioMin: 0,
      precioMax: Infinity,
    };

    this.selects = {
      categoria: document.getElementById("filtroCategoria"),
      genero: document.getElementById("filtroGenero"),
      autor: document.getElementById("filtroAutor"),
      tipo: document.getElementById("filtroTipo"),
    };

    this.precioMinInput = document.getElementById("filtroPrecioMin");
    this.precioMaxInput = document.getElementById("filtroPrecioMax");
    this.ordenarSelect = document.getElementById("ordenarProductos");
    this.limpiarBtn = document.getElementById("limpiarFiltros");

    this.init();
  }

  init() {
    this.generarOpciones();
    this.asignarEventos();
  }

  generarOpciones() {
    for (let key in this.selects) {
      const valores = [...new Set(this.productos.map((p) => p[key]))].sort();
      valores.forEach((valor) => {
        const option = document.createElement("option");
        option.value = valor;
        option.textContent = valor;
        this.selects[key].appendChild(option);
      });
    }
  }

  asignarEventos() {
    for (let key in this.selects) {
      this.selects[key].addEventListener("change", (e) => {
        this.estado[key] = e.target.value;

        if (key === "categoria" && this.onCambioCategoria) {
          this.onCambioCategoria();
        }

        this.onFiltrar(this.filtrarYOrdenar());
      });
    }

    this.precioMinInput.addEventListener("input", () => {
      this.estado.precioMin = parseFloat(this.precioMinInput.value) || 0;
      this.onFiltrar(this.filtrarYOrdenar());
    });

    this.precioMaxInput.addEventListener("input", () => {
      this.estado.precioMax = parseFloat(this.precioMaxInput.value) || Infinity;
      this.onFiltrar(this.filtrarYOrdenar());
    });

    this.ordenarSelect.addEventListener("change", () => {
      this.onFiltrar(this.filtrarYOrdenar());
    });

    this.limpiarBtn.addEventListener("click", () => {
      this.limpiar();
      this.onFiltrar(this.filtrarYOrdenar());
    });
  }

  limpiar() {
    this.estado = {
      categoria: "",
      genero: "",
      autor: "",
      tipo: "",
      precioMin: 0,
      precioMax: Infinity,
    };

    for (let key in this.selects) {
      this.selects[key].value = "";
    }
    this.precioMinInput.value = "";
    this.precioMaxInput.value = "";
    this.ordenarSelect.value = "Ordenar por popularidad";
  }

  filtrarYOrdenar() {
    let resultado = this.productos.filter((p) => {
      const precioFinal = p.getPrecioFinal();
      return (
        (!this.estado.categoria || p.categoria === this.estado.categoria) &&
        (!this.estado.genero || p.genero === this.estado.genero) &&
        (!this.estado.autor || p.autor === this.estado.autor) &&
        (!this.estado.tipo || p.tipo === this.estado.tipo) &&
        p.getPrecioFinal() >= this.estado.precioMin &&
        p.getPrecioFinal() <= this.estado.precioMax
      );
    });

    if (this.ordenarSelect.value === "Precio más bajo") {
      resultado.sort((a, b) => a.getPrecioFinal() - b.getPrecioFinal());
    } else if (this.ordenarSelect.value === "Precio más alto") {
      resultado.sort((a, b) => b.getPrecioFinal() - a.getPrecioFinal());
    }

    return resultado;
  }
}

function crearProductos(productosFiltrados) {
  contenedorProductos.innerHTML = "";
  productosFiltrados.forEach((producto) => {
    const card = producto.crearCard(agregarAlCarrito, abrirModalDetalle);
    contenedorProductos.appendChild(card);
  });
  cantidadResultados.textContent = productosFiltrados.length;
}

function agregarAlCarrito(producto) {
  carrito.agregarProducto(producto);
  actualizarCarritoUI();
}

function actualizarCarritoUI() {
  carritoCantidad.textContent = carrito.getProductosTotal();
  carritoTotal.textContent = carrito.getPrecioTotal();
}

function abrirModalDetalle(producto) {
   if (producto.stock === 0) return;
  modalDetalle.abrir(producto, agregarAlCarrito);
}

abrirCarrito.addEventListener("click", () => {
  modalCarrito.abrir();
});

fetch("productos.json")
  .then((res) => res.json())
  .then((data) => {
    productos = data.map((p) => new Producto(p));

    const gestorFiltros = new Filtros(productos, (resultado) => {
      crearProductos(resultado);
    }, mostrarBannerPromocional);

    crearProductos(gestorFiltros.filtrarYOrdenar());
    actualizarCarritoUI();
  });

// banner flotante

let bannerActual = null;

const mensajes = [
  {
    tituloBanner: "¿No sabés qué leer?",
    descripcion: "Dejá que el destino decida por vos.",
    textoBoton: "Sorprendeme",
    clickBoton: () => clickBanner('manga'),
  },
  {
    tituloBanner: "Ofertas por tiempo limitado",
    descripcion: "¡Descuentos imperdibles en tus mangas favoritos!",
    textoBoton: "Ver ofertas",
    clickBoton: () => clickBanner('descuentos'),
  },
  {
    tituloBanner: "¿Te lo vas a perder?",
    descripcion: "Estos mangas están por agotarse. ¡Apurate!",
    textoBoton: "Ver mangas",
    clickBoton: () => clickBanner('ultimasUnidades'),
  }
];

  function clickBanner(tipo) {
  if (tipo === 'manga') {
    const mangaRandom = productos[Math.floor(Math.random() * productos.length)];
    if (mangaRandom && mangaRandom.stock > 0) abrirModalDetalle(mangaRandom);

  } else if (tipo === 'descuentos') {
    const mangaDescuento = productos.filter(p => p.descuento && p.descuento > 0);
    if (mangaDescuento.length) crearProductos(mangaDescuento);

  } else if (tipo === 'ultimasUnidades') {
    const bajoStock = productos.filter(p => p.stock > 0 && p.stock < 5);
    if (bajoStock.length) crearProductos(bajoStock);
  }
}

function mostrarBannerPromocional() {
  if (bannerActual) {
    bannerActual.remove();
    clearTimeout(bannerActual.timeoutId);
  }

  const random = mensajes[Math.floor(Math.random() * mensajes.length)];

  const banner = document.createElement('section');
  banner.classList.add('banner-promocional');

  const contenedorTexto = document.createElement('div');
  contenedorTexto.classList.add('contenido');

  const h2 = document.createElement('h2');
  h2.textContent = random.tituloBanner;

  const p = document.createElement('p');
  p.textContent = random.descripcion;

  contenedorTexto.append(h2, p);

  const botonAccion = crearBoton(random.textoBoton, 'btn-banner-accion', () => {
  random.clickBoton();
  });

  contenedorTexto.appendChild(botonAccion);
  banner.appendChild(contenedorTexto);

  const main = document.querySelector('main');
  if (main) {
    main.insertBefore(banner, main.firstChild);
  } else {
    document.body.appendChild(banner);
  }

  bannerActual = banner;

  banner.timeoutId = setTimeout(() => {
    banner.remove();
    bannerActual = null;
  }, 10000);
}

document.querySelectorAll('.categoria').forEach(categoria => {
  categoria.addEventListener('click', () => {
    mostrarBannerPromocional();
  });
});


  