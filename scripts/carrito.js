class Carrito {
  constructor() {
    this.items = [];
    this.cargarDesdeStorage();
  }

  agregarProducto(producto) {
    const item = this.items.find((p) => p.id === producto.id);
    if (item) {
      if (item.cantidad < producto.stock) {
        item.cantidad++;
      } else {
        mostrarAlerta(`No hay más stock disponible de "${producto.nombre}"`);
      }
    } else {
      if (producto.stock > 0) {
        const precioConDescuento = producto.getPrecioFinal();
        this.items.push({ ...producto, cantidad: 1, precioConDescuento });
      } else {
        mostrarAlerta(`"${producto.nombre}" sin stock disponible`);
      }
    }
    this.guardarEnStorage();
  }

  restarProducto(id) {
    const item = this.items.find((p) => p.id === id);
    if (item) {
      item.cantidad--;
      if (item.cantidad <= 0) {
        this.eliminarProducto(id);
      }
    }
    this.guardarEnStorage();
  }

  eliminarProducto(id) {
    this.items = this.items.filter((p) => p.id !== id);
    this.guardarEnStorage();
  }

  vaciarCarrito() {
    this.items = [];
    this.guardarEnStorage();
  }

  getProductosTotal() {
    return this.items.reduce((acc, p) => acc + p.cantidad, 0);
  }

  getPrecioTotal() {
    return this.items.reduce((acc, p) => acc + p.precioConDescuento * p.cantidad, 0);
  }

  getItems() {
    return this.items;
  }

  guardarEnStorage() {
    localStorage.setItem("carrito", JSON.stringify(this.items));
  }

  cargarDesdeStorage() {
    const data = localStorage.getItem("carrito");
    if (data) {
      this.items = JSON.parse(data);
    }
  }
}

class ModalCarrito {
  constructor(carrito) {
    this.carrito = carrito;
    this.modal = document.getElementById('carritoModal');

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.cerrar();
    });
  }

  abrir() {
    console.log('Modal abierto');
    this.modal.classList.add('visible');
    this.renderizar();
  }

  cerrar() {
    this.modal.classList.remove('visible');
  }

  renderizar() {
    console.log('Renderizando modal');

    let contenido = this.modal.querySelector('.modal-contenido');

    if (!contenido) {
      contenido = document.createElement('div');
      contenido.className = 'modal-contenido';

      const btnCerrar = document.createElement('span');
      btnCerrar.className = 'close-button';
      btnCerrar.textContent = '×';
      btnCerrar.onclick = () => this.cerrar();
      contenido.appendChild(btnCerrar);

      const h2 = document.createElement('h2');
      h2.textContent = 'Mi pedido';
      contenido.appendChild(h2);

      const listaCarrito = document.createElement('ul');
      listaCarrito.id = 'lista-carrito';
      contenido.appendChild(listaCarrito);

      const resumenCarrito = document.createElement('div');
      resumenCarrito.className = 'resumen-carrito';
      contenido.appendChild(resumenCarrito);

      const acciones = document.createElement('div');
      acciones.className = 'acciones-carrito';

      const btnVaciar = crearBoton('Vaciar carrito', 'btn-vaciar', () => {
        mostrarConfirmacion(
          '¿Seguro querés vaciar el carrito?',
          () => {
            this.carrito.vaciarCarrito();
            this.renderizar();
            actualizarCarritoUI();
          }
        );
      });

      const btnVolverProductos = crearBoton('Seguir comprando', 'btn-compra', () => this.cerrar());

      const btnCheckout = crearBoton('Finalizar compra', 'btn-finalizar', () => {
        if (this.carrito.getProductosTotal() === 0) {
          mostrarAlerta('El carrito está vacío. Agregá productos para poder continuar.');
          return;
        }
        this.cerrar();
        modalCheckout.abrir();
      });

      acciones.append(btnVaciar, btnVolverProductos, btnCheckout);
      contenido.appendChild(acciones);

      this.modal.appendChild(contenido);
    }

    const listaCarrito = contenido.querySelector('#lista-carrito');
    const resumenCarrito = contenido.querySelector('.resumen-carrito');

    listaCarrito.innerHTML = '';

    const items = this.carrito.getItems();

    items.forEach(item => {
      const li = document.createElement('li');
      li.setAttribute('data-id', item.id);
      li.className = 'item-carrito';

      const img = document.createElement('img');
      img.className = 'miniatura-carrito';
      img.src = item.portada;
      img.alt = item.nombre;
      li.appendChild(img);

      const info = document.createElement('div');
      info.className = 'info-carrito';

      const nombre = document.createElement('strong');
      nombre.textContent = item.nombre;
      info.appendChild(nombre);

      const detalle = document.createElement('div');
      detalle.textContent = `Cantidad: ${item.cantidad} | Subtotal: $${(item.precioConDescuento * item.cantidad).toFixed(2)}`;
      info.appendChild(detalle);

      li.appendChild(info);

      const controles = document.createElement('div');
      controles.className = 'controles-carrito';

      const btnRestar = document.createElement('button');
      btnRestar.textContent = '–';
      btnRestar.onclick = () => {
        this.carrito.restarProducto(item.id);
        this.renderizar();
        actualizarCarritoUI();
      };

      const btnSumar = document.createElement('button');
      btnSumar.textContent = '+';
      btnSumar.onclick = () => {
        this.carrito.agregarProducto(item);
        this.renderizar();
        actualizarCarritoUI();
      };

      const btnEliminar = document.createElement('button');
      btnEliminar.textContent = 'X';
      btnEliminar.className = 'eliminar';
      btnEliminar.onclick = () => {
        this.carrito.eliminarProducto(item.id);
        this.renderizar();
        actualizarCarritoUI();
      };

      controles.append(btnRestar, btnSumar, btnEliminar);
      li.appendChild(controles);

      listaCarrito.appendChild(li);
    });

    resumenCarrito.innerHTML = '';

    if (items.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'El carrito está vacío.';
      listaCarrito.appendChild(li);
    }

    const totalProductos = this.carrito.getProductosTotal();
    const totalMonto = this.carrito.getPrecioTotal();

    const totalProd = document.createElement('p');
    const strongProd = document.createElement('strong');
    strongProd.textContent = 'Total productos: ';
    totalProd.appendChild(strongProd);
    totalProd.appendChild(document.createTextNode(totalProductos));

    const totalPrecio = document.createElement('p');
    const strongPrecio = document.createElement('strong');
    strongPrecio.textContent = 'Total: ';
    totalPrecio.appendChild(strongPrecio);
    totalPrecio.appendChild(document.createTextNode(`$${totalMonto.toFixed(2)}`));

    resumenCarrito.append(totalProd, totalPrecio);
  }
}
