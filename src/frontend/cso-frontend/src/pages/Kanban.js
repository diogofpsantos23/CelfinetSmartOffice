import Header from "../components/Header";
import Footer from "../components/Footer";
import KanbanBoard from "../components/KanbanBoard";
import "../App.css"

export default function Kanban() {
    return (
        <div className="app">
            <Header/>
            <div aria-hidden="true" style={{height: '60px', width: '100%'}}/>
            <main style={{flex: 1}} className={"dashboard-container"}>
                <div className="dashboard-notes">
                    <KanbanBoard/>
                </div>
            </main>
            <Footer/>
        </div>
    );
}
