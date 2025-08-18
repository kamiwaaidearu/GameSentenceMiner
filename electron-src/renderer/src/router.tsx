import { createBrowserRouter } from 'react-router';

const BrowserRouter = () => {
    return createBrowserRouter([
        {
            path: '/',
            element: <Layout />,
            //errorElement: <ErrorPage />,
            children: [
                {
                    path: 'manage-inventories',
                    element: <ManageInventoriesPage />,
                },
                {
                    path: 'manage-inventories/:resellerInventoryId',
                    element: <ManageInventoryItemsPage />,
                },
                {
                    path: '*',
                    //element: <ErrorPage variant="not-found" />
                },
            ],
        },
    ]);
};
export default BrowserRouter;
