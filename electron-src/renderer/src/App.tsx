import { RouterProvider } from "react-router";
import BrowserRouter from "./router";

function App(): React.JSX.Element {
    const ipcHandle = (): void => window.electron.ipcRenderer.send('ping');

    return (
        <RouterProvider router={BrowserRouter()} />
    );
}

export default App;
