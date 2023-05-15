export default function countCompletedTasks(students) {
  let completedTasks = 0;
  let tasks = 0;
  students.forEach((student) => {
    student.homeworks.forEach((homework) => {
        tasks++;
        if (homework.completed) {
            completedTasks++;
        }
    });
  });
  return completedTasks/tasks;
}
