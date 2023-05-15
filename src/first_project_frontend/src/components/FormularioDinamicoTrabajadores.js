import { first_project_backend } from "../../../declarations/first_project_backend";

class FormularioDinamicoTrabajadores extends HTMLElement {
  constructor() {
    super();
    this.inputs = [];
    this.formData = [];

    const addButton = document.createElement("button");
    addButton.id = "createWorker";
    addButton.innerHTML =
      '<span><i class="fa-solid fa-user mr-2"></i>Create new worker</span>';
    addButton.className = "btn btn-primary";
    addButton.addEventListener("click", () => {
      this.addInput();
    });

    const inputGroup = document.createElement("div");
    inputGroup.className = "d-flex my-2";
    inputGroup.appendChild(addButton);

    // Agregar el inputGroup a la página o al componente web
    this.appendChild(inputGroup);

    if (this.hasAttribute("initial-data")) {
      const initialData = JSON.parse(this.getAttribute("initial-data"));
      initialData.forEach((data, index) => {
        this.addInput(data.name, index);
      });
    } else {
      this.addInput();
    }
  }

  addInput(name = "", index = this.formData.length) {
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.className = "form-control mr-2";
    nameInput.placeholder = "Name";
    nameInput.value = name;

    const saveButton = document.createElement("button");
    saveButton.innerHTML = '<i class="fa-solid fa-check"></i>';
    saveButton.className = "btn btn-primary";
    if(name) saveButton.setAttribute("disabled", true);
    saveButton.setAttribute("data-toggle","tooltip");
    saveButton.setAttribute("data-placement","left");
    saveButton.setAttribute("title","Create new worker");
    saveButton.addEventListener("click", (e) => {
      this.addStudents(e.currentTarget);
    });

    const inputGroup = document.createElement("div");
    inputGroup.className = "d-flex my-2";
    inputGroup.appendChild(nameInput);
    inputGroup.appendChild(saveButton);
    // inputGroup.appendChild(removeButton);

    // Agregar el inputGroup a la página o al componente web
    this.appendChild(inputGroup);

    this.inputs.push([nameInput]);

    this.formData.push({
      name: name,
    });

    nameInput.addEventListener("input", () => {
      this.formData[index].name = nameInput.value;
    });
  }

  async addStudents(element) {
    element.setAttribute("disabled", true);

    const u = document.querySelector("#collapseThree .result .left");
    const h = document.querySelector("#collapseThree .result .right");

    const i = await (async function (e) {
      u.innerText = "Waiting...";
      h.innerText = "";
      const r = Date.now();
      const student = await first_project_backend.addStudents([
        {
          ...this.formData.at(-1),
          homeworkIds: [],
          totalWeight: 0,
        },
      ]);
      const i = (Date.now() - r) / 1e3;
      h.innerText = `(${i}s)`;
    }).bind(this)();
    u.innerHTML = "Done!";
  }

  getFormValues() {
    return this.formData;
  }
}

customElements.define(
  "formulario-dinamico-trabajadores",
  FormularioDinamicoTrabajadores
);
