import { first_project_backend } from "../../declarations/first_project_backend";
import "./components/FormularioDinamicoTareas";
import "./components/FormularioDinamicoTrabajadores";
import "./components/LineProgress";
import "./components/HomeworkTable";
import countCompletedTasks from "./helpers/utils";
import "bootstrap";

(async () => {
  const $name = document.querySelector("form#project #name");
  const $task = document.querySelector("#tasks");
  const $workers = document.querySelector("#workers");
  const $checklist = document.querySelector("#checklist");

  const name = await first_project_backend.getTitle();
  $name.value = name;

  let homeworks = await first_project_backend.getPoolHomeHomework();
  if (homeworks.length)
    document
      .querySelector("#collapseTwo")
      .setAttribute("class", "in collapse show");
  homeworks = homeworks.map((homework) => {
    return {
      ...homework,
      weight: Number(homework.weight),
      dueDate: Number(homework.dueDate),
    };
  });

  $task.innerHTML = `
      <formulario-dinamico-tareas initial-data=${JSON.stringify(
        homeworks
      )}></formulario-dinamico-tareas>
  `;

  let workers = await first_project_backend.getStudents();
  console.log("🚀 ~ file: index.js:38 ~ workers:", workers)
  if (workers.length)
    document
      .querySelector("#collapseThree")
      .setAttribute("class", "in collapse show");
  workers = workers.map((worker) => {
    return {
      ...worker,
      homeworks: worker.homeworks.map((homework) => {
        return {
          ...homework,
          dueDate: Number(homework.dueDate),
          homeworkId: Number(homework.homeworkId),
          weight: Number(homework.weight),
        };
      }),
    };
  });
  $workers.innerHTML = `
      <formulario-dinamico-trabajadores initial-data=${JSON.stringify(
        workers
      )}></formulario-dinamico-trabajadores>
  `;

  let assignedHomeworks = await first_project_backend.getIsAssignedHomework();

  const $createButton = document.querySelector("#collapseOne form button");
  const $createTask = document.querySelector("#collapseTwo #createTask");
  const $createWorker = document.querySelector("#collapseThree #createWorker");
  const $assignButton = document.querySelector("#collapseFour form button");

  if (assignedHomeworks) {
    document.querySelectorAll("[data-action='delete']").forEach(button => {
      button.setAttribute("disabled", true);
    });
    
    $createButton.setAttribute("disabled", true);
    $createTask.setAttribute("disabled", true);
    $createWorker.setAttribute("disabled", true);
    $assignButton.setAttribute("disabled", true);

    $checklist.innerHTML = `
      <line-progress initial-value="${countCompletedTasks(
        workers
      )}"></line-progress>
      <homework-table homeworks=${JSON.stringify(workers)}></homework-table>
    `;

    document
      .querySelector("#collapseFour")
      .setAttribute("class", "in collapse show");

    document
      .querySelector("#collapseFive")
      .setAttribute("class", "in collapse show");
  }
})();

document.querySelector("form#project").addEventListener("submit", async (e) => {
  e.preventDefault();

  const button = e.target.querySelector("button");
  button.setAttribute("disabled", true);

  const u = e.target.querySelector(".result .left");
  const h = e.target.querySelector(".result .right");

  const name = document.querySelector("form#project #name").value.toString();

  const i = await (async function (e) {
    u.innerText = "Waiting...";
    h.innerText = "";
    const r = Date.now();
    const setTitle = await first_project_backend.setTitle(name);
    const i = (Date.now() - r) / 1e3;
    h.innerText = `(${i}s)`;
  })();
  u.innerHTML = "Done!";
  button.removeAttribute("disabled");

  return false;
});

document
  .querySelector("#collapseFour form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const button = e.target.querySelector("button");
    button.setAttribute("disabled", true);

    const u = e.target.querySelector(".result .left");
    const h = e.target.querySelector(".result .right");

    const i = await (async function (e) {
      u.innerText = "Waiting...";
      h.innerText = "";
      const r = Date.now();
      const assignHomework = await first_project_backend.assignHomework();
      const i = (Date.now() - r) / 1e3;
      h.innerText = `(${i}s)`;
    })();
    u.innerHTML = "Done!";
    const $createButton = document.querySelector("#collapseOne form button");
    const $createTask = document.querySelector("#collapseTwo #createTask");
    const $createWorker = document.querySelector("#collapseThree #createWorker");
    const $assignButton = document.querySelector("#collapseFour form button");
    $createButton.setAttribute("disabled", true);
    $createTask.setAttribute("disabled", true);
    $createWorker.setAttribute("disabled", true);
    $assignButton.setAttribute("disabled", true);

    document.querySelectorAll("[data-action='delete']").forEach(button => {
      button.setAttribute("disabled", true);
    });

    let workers = await first_project_backend.getStudents();
    workers = workers.map((worker) => {
      return {
        ...worker,
        homeworks: worker.homeworks.map((homework) => {
          return {
            ...homework,
            dueDate: Number(homework.dueDate),
            homeworkId: Number(homework.homeworkId),
            weight: Number(homework.weight),
          };
        }),
      };
    });

    const tablaTareas = document.querySelector("homework-table");
    tablaTareas.setAttribute("homeworks", JSON.stringify(workers));

    return false;
  });

  document.querySelector('#restart').addEventListener('click', async (e) => {
    const button = e.currentTarget.querySelector("button");
    button.setAttribute("disabled", true);

    const u = e.currentTarget.querySelector(".result .left");
    const h = e.currentTarget.querySelector(".result .right");

    const i = await (async function (e) {
      u.innerText = "Waiting...";
      h.innerText = "";
      const r = Date.now();
      let resetHomework = await first_project_backend.resetHomework();
      const i = (Date.now() - r) / 1e3;
      h.innerText = `(${i}s)`;
    })();
    u.innerHTML = "Done!";
    button.removeAttribute("disabled");
    location.reload();
  })


  document.querySelector('#finish').addEventListener('click', (e) => {
    document.querySelector('#msg').innerHTML = "Thank you ♥"
  })