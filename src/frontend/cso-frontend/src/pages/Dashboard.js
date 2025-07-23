import Header from "../components/Header";
import Footer from "../components/Footer";
import NotesPanel from "../components/NotesPanel";
import Office from "./Office";
import "../App.css"

export default function Dashboard() {
    return (
        <div className="app">
            <Header/>
            <main style={{flex: 1}} className={"dashboard-container"}>
                <Office/>
                <NotesPanel />
            </main>
            <Footer/>
        </div>
    );
}
