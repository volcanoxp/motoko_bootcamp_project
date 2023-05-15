import { first_project_backend } from "../../../declarations/first_project_backend";

class HomeworkTable extends HTMLElement {
  constructor() {
    super();
    this.homeworks = [];
  }

  static get observedAttributes() {
    return ["homeworks"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "homeworks") {
      this.homeworks = JSON.parse(newValue);
      this.render();
    }
  }

  render() {
    this.innerHTML = `
        <table class="table">
          <thead class="table-active">
            <tr>
                <th class="text-center" scope="col">Name of the homework</th>
                <th class="text-center" scope="col">Description</th>
                <th class="text-center" scope="col">Difficulty</th>
                <th class="text-center" scope="col">Date of delivery</th>
                <th class="text-center" scope="col">Status</th>
                <th class="text-center" scope="col">Worker</th>
            </tr>
          </thead>
          <tbody>
            ${this.homeworks
              .flatMap((student) =>
                student.homeworks.map((homework) => ({
                  studentName: student.name,
                  homework: homework,
                }))
              )
              .map(
                ({ studentName, homework }, index) =>
                  `<tr>
                    <td class="text-center">${homework.title}</td>
                    <td class="text-center">${homework.description}</td>
                    <td class="text-center">${Array(homework.weight)
                      .fill()
                      .map(() => '<i class="fas fa-star"></i>')
                      .join("")}</td>
                    <td class="text-center">${new Date(
                      homework.dueDate
                    ).toLocaleDateString()}</td>
                    <td class="text-center">
                        <select class="custom-select" data-id="${homework.homeworkId}">
                            <option value="In progress" ${
                              !homework.completed ? "selected" : ""
                            }>In progress</option>
                            <option value="finished" ${
                              homework.completed ? "selected" : ""
                            }>Finished</option>
                        </select>
                    </td>
                    <td class="d-flex justify-content-center align-items-center">
                        <div data-toggle="tooltip" data-placement="top" title="${studentName}" class="rounded-circle bg-primary d-flex justify-content-center align-items-center text-white" style="width: 2rem; height: 2rem;">
                            ${studentName[0].toUpperCase()}
                        </div>
                    </td>
                  </tr>`
              )
              .join("")}
          </tbody>
        </table>
      `;
    this.setProgress();
  }

  setProgress() {
    const $lineProgress = document.querySelector("line-progress");
    const step = 1 / this.querySelectorAll("select").length;
    let current = $lineProgress.getProgress();
    this.querySelectorAll("select").forEach((element) => {
      element.addEventListener("change", async (e) => {
        const u = document.querySelector("#collapseFive .result .left");
        const h = document.querySelector("#collapseFive .result .right");
        if (e.target.value === "finished") {
          const i = await (async function (ev) {
            u.innerText = "Waiting...";
            h.innerText = "";
            const r = Date.now();
            const markHomeworkAsCompleted = await first_project_backend.markHomeworkAsCompleted(parseInt(e.currentTarget.dataset.id), true);
            const i = (Date.now() - r) / 1e3;
            h.innerText = `(${i}s)`;
          })();
          u.innerHTML = "Done!";  

          $lineProgress.setProgress(current + step);
          current = current + step;
        } else {
          const i = await (async function (ev) {
            u.innerText = "Waiting...";
            h.innerText = "";
            const r = Date.now();
            const markHomeworkAsCompleted = await first_project_backend.markHomeworkAsCompleted(parseInt(e.currentTarget.dataset.id), false);
            const i = (Date.now() - r) / 1e3;
            h.innerText = `(${i}s)`;
          })();
          u.innerHTML = "Done!";  

          $lineProgress.setProgress(current - step);
          current = current - step;
        }
      });
    });
  }
}

customElements.define("homework-table", HomeworkTable);
