import Header from "../components/Header";
import Footer from "../components/Footer";
import NotesPanel from "../components/NotesPanel";
import Office from "./Office";
import "../App.css"
import Kanban from "../components/Kanban";

export default function Dashboard() {
    return (
        <div className="app">
            <Header/>
            <main style={{flex: 1}} className={"dashboard-container"}>
                <div className="dashboard-office">
                    <Office />
                    <NotesPanel />
                </div>
                <div className="dashboard-notes">
                    <Kanban />
                </div>
            </main>
            <Footer/>
        </div>
    );
}
