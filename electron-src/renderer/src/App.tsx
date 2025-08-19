import { RouterProvider } from 'react-router';
import BrowserRouter from './router';
import './assets/style.css';

function App(): React.JSX.Element {
    return (
        <>
            <RouterProvider router={BrowserRouter()} />
        </>
    );
}

export default App;
