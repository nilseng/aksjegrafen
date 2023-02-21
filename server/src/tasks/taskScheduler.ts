import { importUnits } from "./importUnits";
import { updateUnits } from "./updateUnits";

const tasks: { [key: string]: () => void | Promise<void> } = {
  importUnits,
  updateUnits,
};

export const scheduleTasks = (taskNames: (string | number)[]) => {
  taskNames.forEach((taskName) => {
    const task = tasks[taskName];
    if (task) task();
    else throw Error(`Task with name ${taskName} does not exist.`);
  });
};
