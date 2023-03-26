import ListHeader from "./components/ListHeader";
import ListItem from "./components/ListItem";
import { useEffect, useState } from "react";

const App = () => {
  const userEmail = "davoine.pierre.pro@gmail.com";
  const [tasks, setTask] = useState(null);

  const getData = async () => {
    try {
      const response = await fetch(`http://localhost:8001/todos/${userEmail}`);
      const json = await response.json();
      setTask(json);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => getData, []);

  console.log(tasks);

  // tri par date
  const sortedTask = tasks?.sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="app">
      <ListHeader listName={"✈ Holiday list"} getData={getData} />
      {sortedTask?.map((task) => (
        <ListItem key={task.id} task={task} getData={getData} />
      ))}
    </div>
  );
};

export default App;
