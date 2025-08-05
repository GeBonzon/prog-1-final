// funciones globales

function crearBoton(texto, clase, clickear) {
  const btn = document.createElement('button');
  btn.textContent = texto;
  btn.className = clase;
  btn.onclick = clickear;
  return btn;
}

function mostrarAlerta(mensaje) {
  const alerta = document.createElement('div');
  alerta.className = 'mensaje-alerta';
  alerta.textContent = mensaje;

  document.body.appendChild(alerta);

  setTimeout(() => {
    alerta.remove();
  }, 3000);
}

function mostrarConfirmacion(mensaje, confirmar, cancelar) {
  const fondo = document.createElement('div');
  fondo.className = 'fondo-confirmacion';

  const modal = document.createElement('div');
  modal.className = 'modal-confirmacion';

  const texto = document.createElement('p');
  texto.textContent = mensaje;

  const botones = document.createElement('div');
  botones.style.display = 'flex';
  botones.style.justifyContent = 'flex-end';
  botones.style.gap = '0.5rem';
  botones.style.marginTop = '1rem';

  const btnNo = document.createElement('button');
  btnNo.textContent = 'No';
  btnNo.className = 'btn btn-danger';
  btnNo.onclick = () => {
    fondo.remove();
    if (cancelar) cancelar();
  };

  const btnSi = document.createElement('button');
  btnSi.textContent = 'Sí';
  btnSi.className = 'btn btn-success';
  btnSi.onclick = () => {
    fondo.remove();
    if (confirmar) confirmar();
  };

  botones.append(btnNo, btnSi);
  modal.append(texto, botones);
  fondo.appendChild(modal);
  document.body.appendChild(fondo);
}

// 

class ValidarFormulario {
  constructor(inputs, selectPago, selectCuotas, mostrarErrorCallback) {
    this.inputs = inputs;
    this.selectPago = selectPago;
    this.selectCuotas = selectCuotas;
    this.mostrarErrorCallback = mostrarErrorCallback; 
  }

  validar() {
    let valido = true;


    for (const id in this.inputs) {
      const { input, mensajeError } = this.inputs[id];
      if (input.value.trim() === '') {
        mensajeError.textContent = `El campo "${this.capitalizar(id)}" es obligatorio`;
        mensajeError.style.display = 'block';
        input.classList.add('input-error');
        valido = false;
      }
    }


    if (this.selectPago.value === 'credito') {
      if (!this.selectCuotas || this.selectCuotas.selectedIndex === 0) {
        const mensajeCuotas = this.selectCuotas ? this.selectCuotas.nextElementSibling : null;
        if (mensajeCuotas) {
          mensajeCuotas.textContent = 'Por favor seleccione la cantidad de cuotas deseadas';
          mensajeCuotas.style.display = 'block';
          this.selectCuotas.classList.add('input-error');
        }
        valido = false;
      }
    }

    return valido;
  }

  capitalizar(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  limpiarErrores() {
    for (const id in this.inputs) {
      const { input, mensajeError } = this.inputs[id];
      input.classList.remove('input-error');
      mensajeError.textContent = '';
      mensajeError.style.display = 'none';
    }
    if (this.selectCuotas) {
      this.selectCuotas.classList.remove('input-error');
      const mensajeCuotas = this.selectCuotas.nextElementSibling;
      if (mensajeCuotas) {
        mensajeCuotas.textContent = '';
        mensajeCuotas.style.display = 'none';
      }
    }
  }
}
