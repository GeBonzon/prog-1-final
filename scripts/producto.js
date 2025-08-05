function crearEtiqueta(etiqueta, dato) {
  const p = document.createElement('p');
  const strong = document.createElement('strong');
  strong.textContent = etiqueta;
  p.append(strong, document.createTextNode(dato));
  return p;
}

class Producto {
  constructor({ id, nombre, descripcion, precio, portada, categoria, genero, autor, stock, tipo, volumen, total_volumenes, descuento, imagenes }) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.precio = precio;
    this.portada = portada;
    this.categoria = categoria;
    this.genero = genero;
    this.autor = autor;
    this.stock = stock;
    this.tipo = tipo;
    this.volumen = volumen;
    this.total_volumenes = total_volumenes;
    this.descuento = descuento || 0;
    this.imagenes = imagenes || [];
  }

  crearCard(agregarAlCarrito, abrirModalDetalle) {
    const col = document.createElement("div");
    col.className = "col";

    const card = document.createElement("div");
    card.className = "card h-100";
    if (this.stock === 0) {
      card.classList.add("sin-stock");
    }

    const img = document.createElement("img");
    img.src = this.portada;
    img.className = "card-img-top img-fluid";
    img.alt = this.nombre;

    const body = document.createElement("div");
    body.className = "card-body d-flex flex-column";

    const title = document.createElement("h3");
    title.className = "card-title mb-1";
    title.textContent = this.nombre;

    const precio = document.createElement("p");
    precio.className = "precio mb-2";

    if (this.descuento && this.descuento > 0) {
    const { precioTachado, precioConDescuento } = this.crearPrecio();
    precioTachado.style.marginRight = "0.5rem";
    precio.append(precioTachado, precioConDescuento);
  } else {
    precio.textContent = `$${this.precio.toFixed(2)}`;
  }

    const btnDetalle = crearBoton("Ver detalle", "btn btn-detalle mb-2", () => abrirModalDetalle(this));

    const btnAgregar = crearBoton("Agregar al carrito", "btn btn-compra mt-auto", () => agregarAlCarrito(this));

    body.append(title, precio, btnDetalle, btnAgregar);
    card.append(img, body);

    if (this.stock === 0) {
      const cartel = document.createElement("div");
      cartel.className = "etiqueta-sin-stock";
      cartel.textContent = "SIN STOCK";
      card.appendChild(cartel);
    }

    if (this.descuento && this.descuento > 0) {
      const etiquetaDescuento = document.createElement("div");
      etiquetaDescuento.className = "etiqueta-descuento";
      etiquetaDescuento.textContent = `-${this.descuento}% OFF`;
      card.appendChild(etiquetaDescuento);
    }

    col.appendChild(card);
    return col;
  }

  getPrecioFinal() {
    return this.descuento > 0 ? this.precio * (1 - this.descuento / 100) : this.precio;
  }

  crearPrecio() {
    const precioTachado = document.createElement('span');
    precioTachado.className = 'precio-tachado';
    precioTachado.textContent = `$${this.precio.toFixed(2)}`;

    const precioConDescuento = document.createElement('span');
    precioConDescuento.className = 'precio-descuento';
    precioConDescuento.style.color = 'red';
    precioConDescuento.textContent = `$${this.getPrecioFinal().toFixed(2)}`;

    return { precioTachado, precioConDescuento };
  }
  
}

class ModalDetalleProducto {
  constructor() {
    this.modal = document.getElementById('modalDetalleProducto');

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.cerrar();
    });

    this.presionarTecla = this.presionarTecla.bind(this);
    
    this.imagenes = [];
    this.indiceActual = 0;
    this.imagenAmpliada = null;
    this.contenedorMiniaturas = null;
  }

  abrir(producto, agregarAlCarrito) {
    this.modal.innerHTML = '';

    const contenido = document.createElement('div');
    contenido.className = 'modal-contenido';

    const btnCerrar = document.createElement('span');
    btnCerrar.className = 'close-button';
    btnCerrar.textContent = '×';
    btnCerrar.onclick = () => this.cerrar();
    contenido.appendChild(btnCerrar);

    const contenedor = document.createElement('div');
    contenedor.className = 'detalle-contenedor';

    // galeria modal
    
    const contenedorGaleria = document.createElement('div');
    contenedorGaleria.className = 'contenedor-galeria';

    this.imagenes = [producto.portada, ...(producto.imagenes || [])];
    this.indiceActual = 0;

    this.imagenAmpliada = document.createElement('img');
    this.imagenAmpliada.className = 'detalle-imagen';
    this.imagenAmpliada.src = this.imagenes[this.indiceActual];
    this.imagenAmpliada.alt = producto.nombre;

    contenedorGaleria.appendChild(this.imagenAmpliada);

    this.contenedorMiniaturas = document.createElement('div');
    this.contenedorMiniaturas.className = 'contenedor-miniaturas';

    this.imagenes.forEach((src, index) => {
      const miniatura = document.createElement('img');
      miniatura.src = src;
      miniatura.className = 'miniatura';
      miniatura.alt = `Miniatura ${index + 1} de ${producto.nombre}`;
      miniatura.style.cursor = 'pointer';
      miniatura.addEventListener('click', () => {
        this.mostrarImagen(index);
      });
      this.contenedorMiniaturas.appendChild(miniatura);
    });

    contenedorGaleria.appendChild(this.contenedorMiniaturas);

    const info = document.createElement('div');
    info.className = 'detalle-info';

    const h2 = document.createElement('h2');
    h2.textContent = producto.nombre;

    const pDescripcion = document.createElement('p');
    pDescripcion.textContent = producto.descripcion;

    const pCategoria = crearEtiqueta('Categoría: ', producto.categoria);
  
    const pGenero = crearEtiqueta('Género: ',  producto.genero);

    const pTipo = crearEtiqueta('Tipo: ',  producto.tipo);

    const pAutor  = crearEtiqueta('Autor: ',   producto.autor);

    const contPrecio = document.createElement('p');
    const strongPrecio = document.createElement('strong');
    strongPrecio.textContent = 'Precio: ';
    contPrecio.appendChild(strongPrecio);

    if (producto.descuento && producto.descuento > 0) {
      const { precioTachado, precioConDescuento } = producto.crearPrecio();

      contPrecio.append(precioTachado, precioConDescuento);

      const textoPromo = document.createElement('p');
      textoPromo.className = 'texto-promocional';
      textoPromo.textContent = `¡Aprovechá ${producto.descuento}% OFF!`;
      contPrecio.appendChild(textoPromo);
    } else {
      const precioNormal = document.createElement('span');
      precioNormal.className = 'precio-normal';
      precioNormal.textContent = `$${producto.precio.toFixed(2)}`;
      contPrecio.appendChild(precioNormal);
    }

    const pStock = crearEtiqueta('Stock: ', producto.stock);

    const btnAgregar = crearBoton("Agregar al carrito", "btn-compra", () => agregarAlCarrito(producto));
    btnAgregar.disabled = producto.stock === 0;

    info.append(h2, pDescripcion, pCategoria, pGenero, pTipo, pAutor, contPrecio, pStock, btnAgregar);

    if (producto.stock === 1) {
      const aviso = document.createElement('p');
      aviso.textContent = '¡Última unidad disponible! No te lo pierdas.';
      aviso.className = 'aviso-stock-bajo';
      info.appendChild(aviso);
    }

    contenedor.append(contenedorGaleria, info);
    contenido.appendChild(contenedor);
    this.modal.appendChild(contenido);
    this.modal.classList.add('visible');

    this.actualizarMiniaturas();

    document.addEventListener('keydown', this.presionarTecla);
  }

  mostrarImagen(indice) {
    if (indice < 0) {
      this.indiceActual = this.imagenes.length - 1;
    } else if (indice >= this.imagenes.length) {
      this.indiceActual = 0;
    } else {
      this.indiceActual = indice;
    }

    this.imagenAmpliada.src = this.imagenes[this.indiceActual];
    this.actualizarMiniaturas();
  }

  actualizarMiniaturas() {
    if (!this.contenedorMiniaturas) return;
    const imagenesMini = this.contenedorMiniaturas.querySelectorAll('img.miniatura');
    imagenesMini.forEach((miniatura, i) => {
      if (i === this.indiceActual) {
        miniatura.classList.add('miniatura-activa');
      } else {
        miniatura.classList.remove('miniatura-activa');
      }
    });
  }

  presionarTecla(e) {
    if (!this.modal.classList.contains('visible')) return;

    switch (e.key) {
      case 'Escape':
        this.cerrar();
        break;
      case 'ArrowLeft':
        this.mostrarImagen(this.indiceActual - 1);
        break;
      case 'ArrowRight':
        this.mostrarImagen(this.indiceActual + 1);
        break;
    }
  }

  cerrar() {
    this.modal.classList.remove('visible');
    document.removeEventListener('keydown', this.presionarTecla);
  }
}
