import { Line } from "progressbar.js";

class LinearProgress extends HTMLElement {
  constructor() {
    super();
    this.bar = null;
    this.initialValue = 0;
  }

  connectedCallback() {
    // Obtener el valor del atributo "initial-value" si está presente
    const initialValueAttr = this.getAttribute("initial-value");
    if (initialValueAttr !== null) {
      this.initialValue = parseFloat(initialValueAttr);
    }

    // Crear un contenedor para el gráfico
    const container = document.createElement("div");
    container.style.width = "97.5%";
    container.style.height = "16px";
    container.style.margin = "20px";
    container.style.marginBottom = "60px";
    this.appendChild(container);

    // Crear el gráfico circular
    this.bar = new Line(container, {
      strokeWidth: 4,
      easing: "easeInOut",
      duration: 1400,
      color: "#007BFF",
      trailColor: "#eee",
      trailWidth: 1,
      svgStyle: { width: "100%", height: "100%" },
      text: {
        style: {
          // Text color.
          // Default: same as stroke color (options.color)
          color: "#000000",
          position: "absolute",
          padding: 0,
          margin: 0,
          transform: null,
        },
        autoStyleContainer: false,
      },
      from: { color: "#FFEA82" },
      to: { color: "#007BFF" },
      step: (state, bar) => {
        bar.setText(Math.round(bar.value() * 100) + " %");
      },
    });

    // Establecer el valor inicial del gráfico
    this.bar.animate(this.initialValue);
  }

  setProgress(value) {
    this.bar.animate(value);
  }

  getProgress() {
    return this.initialValue;
  }
}

customElements.define("line-progress", LinearProgress);
