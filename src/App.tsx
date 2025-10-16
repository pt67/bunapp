import "./index.css";
import TaskForm from "./components/form";
import UserList from "./components/users";

export function App() {
  return (
    <div className="app">
      <h1>Building TODO in BUN with sqlite</h1>
      <TaskForm/>
      <UserList/>

    </div>
  );
}

export default App;
