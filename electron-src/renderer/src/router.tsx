import { createBrowserRouter, redirect } from 'react-router';
import { HomePage } from './pages/home';
import { Layout } from './Layout';

const BrowserRouter = () => {
    return createBrowserRouter([
        {
            path: '/',
            element: <Layout />,
            //errorElement: <ErrorPage />,
            children: [
                {
                    path: '',
                    loader: () => redirect('/home'),
                },
                {
                    path: 'home',
                    element: <HomePage />,
                },
                // {
                //     path: 'furigana',
                //     element: <FuriganaPage />,
                // },
                // {
                //     path: 'launcher',
                //     element: <LauncherPage />,
                // },
                // {
                //     path: 'settings',
                //     element: <SettingsPage />,
                // },
                // {
                //     path: 'steam',
                //     element: <SteamPage />,
                // },
                // {
                //     path: 'steamconfig',
                //     element: <SteamConfigPage />,
                // },
                // {
                //     path: 'VN',
                //     element: <VNPage />,
                // },
                // {
                //     path: 'yuzu',
                //     element: <YuzuPage />,
                // },
                {
                    path: '*',
                    //element: <ErrorPage variant="not-found" />
                },
            ],
        },
    ]);
};
export default BrowserRouter;
