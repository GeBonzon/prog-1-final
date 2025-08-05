class ModalCheckout {
  constructor(carrito) {
    this.carrito = carrito;
    this.modal = document.getElementById('modalCheckout');

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.cerrar();
    });

    this.presionarTecla = this.presionarTecla.bind(this);
  }

  crearCampoForm(id, tipo, texto) {
    const campoForm = document.createElement('div');
    campoForm.className = 'form-campo';

    const label = document.createElement('label');
    label.setAttribute('for', id);
    label.textContent = texto;

    const input = document.createElement('input');
    input.type = tipo;
    input.id = id;

    const mensajeError = document.createElement('p');
    mensajeError.className = 'mensaje-error';
    mensajeError.style.display = 'none';

    input.addEventListener('input', () => {
      input.classList.remove('input-error');
      mensajeError.textContent = '';
      mensajeError.style.display = 'none';
    });

    campoForm.append(label, input, mensajeError);

    return { campoForm, input, mensajeError };
  }

  // abrir modal
  abrir() {
    this.modal.innerHTML = ''; 

    const contenedor = document.createElement('div');
    contenedor.className = 'modal-content';

    const titulo = document.createElement('h2');
    titulo.textContent = 'Finalizar compra';
    contenedor.appendChild(titulo);

    const form = document.createElement('form');
    form.className = 'form-checkout';

    const campos = [
      { id: 'nombre', tipo: 'text', texto: 'Nombre completo' },
      { id: 'telefono', tipo: 'tel', texto: 'Teléfono' },
      { id: 'email', tipo: 'email', texto: 'Email' },
      { id: 'direccion', tipo: 'text', texto: 'Lugar de entrega' },
      { id: 'fecha', tipo: 'date', texto: 'Fecha de entrega' }
    ];

    const inputs = {};

    campos.forEach(({ id, tipo, texto }) => {
      const { campoForm, input, mensajeError } = this.crearCampoForm(id, tipo, texto);
      form.appendChild(campoForm);
      inputs[id] = { input, mensajeError };
    });

    // fecha
    const now = new Date();
    now.setDate(now.getDate() + 3);
    inputs['fecha'].input.setAttribute('min', now.toISOString().split("T")[0]);

    // medios de pago
    const campoPago = document.createElement('div');
    campoPago.className = 'form-campo';

    const labelPago = document.createElement('label');
    labelPago.textContent = 'Método de pago';

    const selectPago = document.createElement('select');
    selectPago.id = 'metodoPago';

    ['efectivo', 'credito', 'transferencia'].forEach(valor => {
      const option = document.createElement('option');
      option.value = valor;
      option.textContent = valor.charAt(0).toUpperCase() + valor.slice(1);
      selectPago.appendChild(option);
    });

    const contenedorCuotas = document.createElement('div');
    contenedorCuotas.id = 'contenedor-cuotas';

    let selectCuotas = null;

    selectPago.addEventListener('change', () => {
      contenedorCuotas.innerHTML = '';
      selectCuotas = null;

      if (selectPago.value === 'credito') {
        const campoCuotas = document.createElement('div');
        campoCuotas.className = 'form-campo';

        const select = document.createElement('select');
        select.id = 'select-cuotas';

        const def = document.createElement("option");
        def.textContent = "Seleccione la cantidad de cuotas";
        def.disabled = true;
        def.selected = true;
        select.appendChild(def);

        const total = this.carrito.getPrecioTotal();
        const cuotas = [
          ["1", `1 cuota de $${(total / 1).toFixed(2)}`],
          ["3", `3 cuotas de $${(total / 3).toFixed(2)}`],
          ["6", `6 cuotas de $${(total / 6).toFixed(2)}`]
        ];

        cuotas.forEach(([val, txt]) => {
          const opt = document.createElement('option');
          opt.value = val;
          opt.textContent = txt;
          select.appendChild(opt);
        });

        const mensajeCuotas = document.createElement('p');
        mensajeCuotas.className = 'mensaje-error';
        mensajeCuotas.style.display = 'none';

        select.addEventListener('change', () => {
          select.classList.remove('input-error');
          mensajeCuotas.textContent = '';
          mensajeCuotas.style.display = 'none';
        });

        campoCuotas.append(select, mensajeCuotas);
        contenedorCuotas.appendChild(campoCuotas);

        selectCuotas = select;
      }
    });

    campoPago.append(labelPago, selectPago, contenedorCuotas);
    form.appendChild(campoPago);

    const botones = document.createElement('div');
    botones.className = 'form-botones';

    const btnCancelar = crearBoton('Cancelar', '', () => this.cerrar());
    btnCancelar.type = 'button';

    const btnConfirmar = document.createElement('button');
    btnConfirmar.type = 'submit';
    btnConfirmar.textContent = 'Confirmar compra';

    botones.append(btnCancelar, btnConfirmar);
    form.appendChild(botones);

    const validador = new ValidarFormulario(inputs, selectPago, selectCuotas);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      validador.limpiarErrores();

      validador.selectCuotas = document.getElementById('select-cuotas');

      if (!validador.validar()) return;

      this.carrito.vaciarCarrito();
      this.mostrarResumenCompra(inputs['nombre'].input.value.trim(), inputs['email'].input.value.trim());
      actualizarCarritoUI();
    });

    contenedor.appendChild(form);
    this.modal.appendChild(contenedor);
    this.modal.classList.add('visible');

    document.addEventListener('keydown', this.presionarTecla);
  }

  presionarTecla(e) {
    if (!this.modal.classList.contains('visible')) return;

    if (e.key === 'Escape') {
      this.cerrar();
    }
  }

  mostrarResumenCompra(nombre, email) {
    this.modal.innerHTML = '';

    const contenedor = document.createElement('div');
    contenedor.className = 'modal-contenido';

    let ordenActual = localStorage.getItem('numeroOrden');
    ordenActual = ordenActual ? parseInt(ordenActual) + 1 : 1;
    localStorage.setItem('numeroOrden', ordenActual);

    const titulo = document.createElement('h2');
    titulo.textContent = '¡Gracias por tu compra!';
    contenedor.appendChild(titulo);

    const mensaje = document.createElement('p');
    mensaje.appendChild(document.createTextNode(`Gracias, ${nombre}.`));
    mensaje.appendChild(document.createElement('br'));
    mensaje.appendChild(document.createTextNode(`Tu número de orden es #${ordenActual}.`));
    mensaje.appendChild(document.createElement('br'));
    mensaje.appendChild(document.createTextNode(`Te enviamos el seguimiento a ${email}.`));
    contenedor.appendChild(mensaje);

    const btnCerrar = crearBoton('Cerrar', 'btn-cerrar-modal', () => this.cerrar());
    contenedor.appendChild(btnCerrar);

    this.modal.appendChild(contenedor);
    this.modal.classList.add('visible');

    this.timeoutCerrar = setTimeout(() => this.cerrar(), 5000);

    document.addEventListener('keydown', this.presionarTecla);
  }

  cerrar() {
    this.modal.classList.remove('visible');
    this.modal.innerHTML = '';

    document.removeEventListener('keydown', this.presionarTecla);

    if (this.timeoutCerrar) {
      clearTimeout(this.timeoutCerrar);
      this.timeoutCerrar = null;
    }
  }
}
