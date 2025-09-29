import {MantineProvider} from "@mantine/core";
import "@mantine/core/styles.css";
import {Route, Switch} from "wouter";
import DefaultLayout from "./layouts/DefaultLayout.tsx";
import DashboardView from "./views/DashboardView.tsx";
import SearchView from "./views/SearchView.tsx";
import MovieDetailsView from "./views/MovieDetailsView.tsx";
import UserView from "./views/UserView.tsx";

function App() {
    return (
        <MantineProvider>
            <DefaultLayout>
                <Switch>
                    <Route path="/"><DashboardView/></Route>
                    <Route path="/search"><SearchView/></Route>
                    <Route path="/movie/:id"><MovieDetailsView/></Route>
                    <Route path="/user/:id">{params => <UserView id={params.id} />}</Route>
                    <Route><h1>404 Not Found</h1></Route>
                </Switch>
            </DefaultLayout>
        </MantineProvider>
    )
}

export default App
