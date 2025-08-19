import { RouterProvider } from 'react-router';
import BrowserRouter from './router';

function App(): React.JSX.Element {
    return (
        <>
            <RouterProvider router={BrowserRouter()} />
        </>
    );
}

export default App;
