import { first_project_backend } from "../../../declarations/first_project_backend";
import moment from "moment";

class FormularioDinamicoTareas extends HTMLElement {
  constructor() {
    super();
    this.inputs = [];
    this.formData = [];

    const addButton = document.createElement("button");
    addButton.id = "createTask";
    addButton.innerHTML =
      '<span><i class="fa-solid fa-list-check mr-2"></i>Create new task</span>';
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
        this.addInput(
          data.title,
          data.description,
          data.weight,
          data.dueDate,
          index
        );
      });
    } else {
      this.addInput();
    }
  }

  addInput(
    title = "",
    description = "",
    weight = 1,
    dueDate = new Date().getTime(),
    index = this.formData.length
  ) {
    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.className = "form-control mr-2";
    titleInput.placeholder = "Title";
    titleInput.value = title;

    const descInput = document.createElement("input");
    descInput.type = "text";
    descInput.className = "form-control mr-2";
    descInput.placeholder = "Description";
    descInput.value = description;

    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.className = "form-control mr-2";
    dateInput.value = moment(dueDate).format("yyyy-MM-DD");

    const select = document.createElement("select");
    select.className = "custom-select mr-2";
    for (let i = 1; i <= 5; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.text = i;
      select.appendChild(option);
    }
    select.value = weight;

    const saveButton = document.createElement("button");
    saveButton.innerHTML = '<i class="fa-solid fa-check"></i>';
    saveButton.className = "btn btn-primary";
    if(title) saveButton.setAttribute("disabled", true);
    saveButton.setAttribute("data-toggle","tooltip");
    saveButton.setAttribute("data-placement","left");
    saveButton.setAttribute("title","Create new task");
    saveButton.addEventListener("click", (e) => {
      this.addPoolHomework(e.currentTarget);
    });

    const inputGroup = document.createElement("div");
    inputGroup.className = "d-flex my-2";
    inputGroup.appendChild(titleInput);
    inputGroup.appendChild(descInput);
    inputGroup.appendChild(dateInput);
    inputGroup.appendChild(select);
    inputGroup.appendChild(saveButton);

    // Agregar el inputGroup a la página o al componente web
    this.appendChild(inputGroup);

    this.inputs.push([titleInput, descInput, dateInput, select]);

    this.formData.push({
      title: title,
      description: description,
      weight: weight,
      dueDate: dueDate,
    });

    titleInput.addEventListener("input", () => {
      this.formData[index].title = titleInput.value;
    });

    descInput.addEventListener("input", () => {
      this.formData[index].description = descInput.value;
    });

    dateInput.addEventListener("change", () => {
      this.formData[index].dueDate = new Date(dateInput.value).getTime();
    });

    select.addEventListener("change", () => {
      this.formData[index].weight = parseInt(select.value);
    });
  }

  async addPoolHomework(element) {
    element.setAttribute("disabled", true);
    
    const u = document.querySelector("#collapseTwo .result .left");
    const h = document.querySelector("#collapseTwo .result .right");

    const i = await async function (e) {
      u.innerText = "Waiting...";
      h.innerText = "";
      const r = Date.now();
      const homework = await first_project_backend.addPoolHomework([
        {
          ...this.formData.at(-1),
          completed: false,
        },
      ]);
      const i = (Date.now() - r) / 1e3;
      h.innerText = `(${i}s)`;
    }.bind(this)();
    u.innerHTML = "Done!";

  }

  getFormValues() {
    return this.formData;
  }
}

customElements.define("formulario-dinamico-tareas", FormularioDinamicoTareas);
