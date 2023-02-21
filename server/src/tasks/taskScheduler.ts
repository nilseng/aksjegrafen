import { getAllUnits } from "../services/unitService";
import { updateUnits } from "./updateUnits";

const tasks: { [key: string]: () => void | Promise<unknown> } = {
  getAllUnits,
  updateUnits,
};

export const scheduleTasks = (taskNames: (string | number)[]) => {
  taskNames.forEach((taskName) => {
    const task = tasks[taskName];
    if (task) task();
    else throw Error(`Task with name ${taskName} does not exist.`);
  });
};
