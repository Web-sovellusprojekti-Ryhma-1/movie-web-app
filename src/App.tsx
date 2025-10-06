import {MantineProvider} from "@mantine/core";
import "@mantine/core/styles.css";
import '@mantine/notifications/styles.css';
import {Notifications} from '@mantine/notifications';
import {Route, Router, Switch} from "wouter";
import DefaultLayout from "./layouts/DefaultLayout.tsx";
import DashboardView from "./views/DashboardView.tsx";
import GroupDetailsView from "./views/GroupDetailsView.tsx";
import GroupsListView from "./views/GroupsListView.tsx";
import MovieDetailsView from "./views/MovieDetailsView.tsx";
import SearchView from "./views/SearchView.tsx";
import UserView from "./views/UserView.tsx";

function App() {
    return (
        <MantineProvider>
            <Notifications/>
            <Router>
                <DefaultLayout>
                    <Switch>
                        <Route path="/" component={DashboardView}/>
                        <Route path="/search" component={SearchView}/>
                        <Route path="/movie/:id" component={MovieDetailsView}/>
                        <Route path="/groups" component={GroupsListView}/>
                        <Route path="/groups/:id" component={GroupDetailsView}/>
                        <Route path="/user/:id" component={UserView}/>
                        <Route><h1>404 Not Found</h1></Route>
                    </Switch>
                </DefaultLayout>
            </Router>
        </MantineProvider>
    )
}

export default App;
